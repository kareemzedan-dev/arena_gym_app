import { z } from "zod";
import { TokenPair, LoginRequest } from "@arena/shared";
export type SessionStore = {
  read(): Promise<TokenPair | null>;
  write(value: TokenPair | null): Promise<void>;
};
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public details?: unknown,
  ) {
    super(code);
  }
}
/** One rotating refresh request per session, even when several screens expire together. */
export class ApiClient {
  private tokens: TokenPair | null = null;
  private generation = 0;
  private refreshFlight: Promise<void> | null = null;
  private persist: Promise<void> = Promise.resolve();
  onSessionLost: () => void = () => {};
  constructor(
    readonly baseUrl: string,
    private store: SessionStore,
    private transport: typeof fetch = (input, init) => fetch(input, init),
  ) {}
  async restore() {
    const generation = this.generation;
    const tokens = await this.store.read();
    if (generation !== this.generation) return false;
    this.tokens = tokens;
    return !!this.tokens;
  }
  private save(tokens: TokenPair | null) {
    this.tokens = tokens;
    this.persist = this.persist
      .catch(() => {})
      .then(() => this.store.write(tokens));
    return this.persist;
  }
  async login(identifier: string, password: string) {
    const body = LoginRequest.parse({ identifier, password });
    const generation = ++this.generation;
    const tokens = TokenPair.parse(
      await this.send("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    if (generation !== this.generation) return;
    await this.save(tokens);
  }
  async logout() {
    const old = this.tokens;
    ++this.generation;
    await this.save(null);
    this.onSessionLost();
    // Local logout is immediate; revocation is best effort when offline.
    if (old)
      await this.send("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: old.refreshToken }),
      }).catch(() => {});
  }
  private async refresh() {
    if (this.refreshFlight) return this.refreshFlight;
    const old = this.tokens;
    const generation = this.generation;
    if (!old) throw new ApiError(401, "SESSION_EXPIRED");
    const flight = (async () => {
      try {
        const tokens = TokenPair.parse(
          await this.send("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken: old.refreshToken }),
          }),
        );
        if (generation !== this.generation)
          throw new ApiError(401, "SESSION_CHANGED");
        await this.save(tokens);
      } catch (error) {
        // A timed-out rotation may have completed on the server: never replay its token.
        if (generation === this.generation) {
          ++this.generation;
          await this.save(null);
          this.onSessionLost();
        }
        throw error;
      }
    })();
    this.refreshFlight = flight;
    try {
      await flight;
    } finally {
      if (this.refreshFlight === flight) this.refreshFlight = null;
    }
  }
  private async send(path: string, init: RequestInit = {}, token?: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    let response: Response;
    try {
      response = await this.transport(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timer);
      throw new ApiError(0, "NETWORK_ERROR");
    }
    if (response.status === 204) {
      clearTimeout(timer);
      return null;
    }
    // Bound untrusted envelopes before schema validation, including unconstrained arrays.
    if (Number(response.headers.get("content-length") || 0) > 2_000_000) {
      clearTimeout(timer);
      controller.abort();
      throw new ApiError(502, "RESPONSE_TOO_LARGE");
    }
    let raw: string;
    try {
      raw = await response.text();
    } catch {
      throw new ApiError(0, "NETWORK_ERROR");
    } finally {
      clearTimeout(timer);
    }
    if (raw.length > 2_000_000) throw new ApiError(502, "RESPONSE_TOO_LARGE");
    let body: any = null;
    try {
      body = JSON.parse(raw);
    } catch {
      /* handled by response/schema validation */
    }
    validateEnvelope(body);
    if (!response.ok)
      throw new ApiError(
        response.status,
        body?.code || body?.error?.code || `HTTP_${response.status}`,
        body,
      );
    return body;
  }
  async request<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    init: RequestInit = {},
  ): Promise<z.output<S>> {
    const generation = this.generation;
    const token = this.tokens?.accessToken;
    if (!token) throw new ApiError(401, "SESSION_EXPIRED");
    let data: unknown;
    try {
      data = await this.send(path, init, token);
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        generation !== this.generation
      )
        throw error;
      // A late 401 may arrive after another request already rotated this token.
      if (this.tokens?.accessToken === token) await this.refresh();
      if (!this.tokens || generation !== this.generation)
        throw new ApiError(401, "SESSION_EXPIRED");
      try {
        data = await this.send(path, init, this.tokens.accessToken);
      } catch (retryError) {
        if (
          retryError instanceof ApiError &&
          retryError.status === 401 &&
          generation === this.generation
        ) {
          ++this.generation;
          await this.save(null);
          this.onSessionLost();
        }
        throw retryError;
      }
    }
    if (generation !== this.generation)
      throw new ApiError(401, "SESSION_CHANGED");
    return schema.parse(data);
  }
}

function validateEnvelope(value: unknown) {
  const queue: [unknown, number][] = [[value, 0]];
  let count = 0;
  while (queue.length) {
    const [node, depth] = queue.pop()!;
    if (++count > 50000 || depth > 24)
      throw new ApiError(502, "INVALID_RESPONSE");
    if (node && typeof node === "object") {
      const values = Object.values(node);
      if (values.length > 5000) throw new ApiError(502, "INVALID_RESPONSE");
      for (const child of values) queue.push([child, depth + 1]);
    }
  }
}
