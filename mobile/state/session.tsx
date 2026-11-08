import React, { createContext, useContext, useEffect, useState } from "react";
import { Me } from "@arena/shared";
import { AppState, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { api } from "../api";
import { ApiError } from "../api/client";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, e) =>
        count < 1 &&
        e instanceof ApiError &&
        (e.status === 0 || e.status >= 500),
    },
    mutations: { retry: false },
  },
});
const Context = createContext<{
  user: Me | null;
  ready: boolean;
  bootError: boolean;
  retry(): void;
  login(id: string, password: string): Promise<void>;
  logout(): Promise<void>;
}>(null!);
export function SessionProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (Platform.OS === "web") return;
    const listener = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => listener.remove();
  }, []);
  // Keep the established identity while validating on resume. request() performs
  // single-flight token rotation on 401 and rejects responses from old sessions.
  useEffect(() => {
    if (!ready || !user) return;
    let mounted = true;
    let flight: Promise<void> | null = null;
    const resume = () => {
      if (flight) return;
      flight = api
        .request("/users/me", Me)
        .then((me) => {
          if (mounted) setUser(me);
        })
        .catch(() => {
          /* Session loss is handled centrally; offline resumes retain identity. */
        })
        .finally(() => {
          flight = null;
        });
    };
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") resume();
    });
    return () => {
      mounted = false;
      listener.remove();
    };
  }, [ready, user?.id]);
  useEffect(() => {
    let mounted = true;
    api.onSessionLost = () => {
      queryClient.clear();
      if (mounted) {
        setUser(null);
        setBootError(false);
      }
    };
    (async () => {
      setReady(false);
      setBootError(false);
      try {
        if (await api.restore()) {
          const me = await api.request("/users/me", Me);
          if (mounted) setUser(me);
        }
      } catch (e) {
        if (mounted && (!(e instanceof ApiError) || e.status !== 401))
          setBootError(true);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [attempt]);
  async function login(id: string, password: string) {
    queryClient.clear();
    await api.login(id, password);
    const me = await api.request("/users/me", Me);
    setUser(me);
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider
        value={{
          user,
          ready,
          bootError,
          retry: () => setAttempt((a) => a + 1),
          login,
          logout: () => api.logout(),
        }}
      >
        {children}
      </Context.Provider>
    </QueryClientProvider>
  );
}
export const useSession = () => useContext(Context);
