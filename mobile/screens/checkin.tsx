import React, { useEffect, useMemo, useState } from "react";
import { AppState, View, useWindowDimensions } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckInTokenResponse, MembershipResponse } from "@arena/shared";
import { api } from "../api";
import { ApiError } from "../api/client";
import { checkInRefreshDelay, tokenToQrRects } from "../api/qr";
import { useData, DataState } from "../components/data";
import { Screen, Text, Card, Button, Loading } from "../components/ui";
import { useSession } from "../state/session";
import { usePrefs } from "../state/preferences";
import { greetingName } from "../state/greeting";

export default function CheckIn() {
  const { text } = usePrefs();
  const { user } = useSession();
  const client = useQueryClient();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(AppState.currentState === "active");
  const [resuming, setResuming] = useState(false);
  const [now, setNow] = useState(Date.now());
  const membership = useData("/me/membership", MembershipResponse);
  const token = useQuery({
    queryKey: ["api", "/me/check-in-token"],
    queryFn: () => api.request("/me/check-in-token", CheckInTokenResponse),
    enabled: active,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: (query) =>
      query.state.data && !query.state.error
        ? checkInRefreshDelay(query.state.data.expiresAt)
        : false,
  });
  const { refetch } = token;
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const listener = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
      setNow(Date.now());
      if (state === "active") {
        setResuming(true);
        void refetch().finally(() => setResuming(false));
      }
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [refetch]);
  useFocusEffect(
    React.useCallback(
      () => () => {
        // Reception may have scanned the token while this screen was open.
        void client.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "api" &&
            typeof query.queryKey[1] === "string" &&
            /membership|subscriptions|pt-summary|session-balance/.test(
              query.queryKey[1],
            ),
        });
      },
      [client],
    ),
  );
  const qr = useMemo(() => {
    if (!token.data) return null;
    try {
      return tokenToQrRects(token.data.token);
    } catch {
      return null;
    }
  }, [token.data]);
  const seconds = token.data
    ? Math.max(0, Math.ceil((Date.parse(token.data.expiresAt) - now) / 1000))
    : 0;
  const renewalSeconds = Math.max(0, seconds - 10);
  const error = token.error || (token.data && !qr);
  const size = Math.max(240, Math.min(width - 48, 360));
  return (
    <Screen back title={text("Check in with QR", "الدخول برمز QR")}>
      <Text muted>
        {text(
          "Show this code at reception. One session is deducted when scanned.",
          "اعرضي هذا الرمز لدى الاستقبال. تُخصم جلسة واحدة عند مسحه.",
        )}
      </Text>
      <Text bold size={22}>
        {user?.fullName?.trim() || greetingName(user)}
      </Text>
      {error ? (
        <Card>
          <Text accessibilityRole="alert">
            {token.error instanceof ApiError &&
            [400, 403, 404, 409, 422].includes(token.error.status)
              ? text(
                  "Check-in is unavailable. Please ask reception to check your active subscription and session balance.",
                  "الدخول غير متاح. يُرجى مراجعة الاستقبال للتحقق من اشتراكك الساري ورصيد جلساتك.",
                )
              : text(
                  "Could not load your entry code. Check your connection and try again.",
                  "تعذر تحميل رمز الدخول. تحققي من الاتصال وحاولي مجددًا.",
                )}
          </Text>
          <Button
            title={text("Try again", "حاولي مجددًا")}
            busy={token.isFetching}
            onPress={() => void refetch()}
          />
        </Card>
      ) : (
        <>
          <View
            style={{
              width: size,
              height: size,
              backgroundColor: "white",
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {qr && seconds > 0 && active && !resuming && !token.isFetching ? (
              <Svg
                width={size}
                height={size}
                viewBox={`0 0 ${qr.size} ${qr.size}`}
                accessibilityLabel={text(
                  "Gym entry QR code",
                  "رمز QR لدخول النادي",
                )}
                accessibilityRole="image"
              >
                <Rect width={qr.size} height={qr.size} fill="white" />
                {qr.rects.map((rect, i) => (
                  <Rect key={i} {...rect} fill="black" />
                ))}
              </Svg>
            ) : (
              <Loading />
            )}
          </View>
          <Text style={{ textAlign: "center" }} muted>
            {renewalSeconds > 0
              ? text(
                  `Renews in ${renewalSeconds} s`,
                  `يتجدد خلال ${renewalSeconds} ث`,
                )
              : text("Refreshing entry code…", "جار تجديد رمز الدخول…")}
          </Text>
        </>
      )}
      <DataState query={membership}>
        <Card>
          <Text muted>
            {text("PT sessions remaining", "جلسات التدريب الشخصي المتبقية")}
          </Text>
          <Text bold size={30}>
            {membership.data?.ptRemaining ?? 0}
          </Text>
        </Card>
      </DataState>
    </Screen>
  );
}
