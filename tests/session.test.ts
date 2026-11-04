import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { ApiClient, ApiError, type SessionStore } from "../mobile/api/client";
const pair = { accessToken: "old-access", refreshToken: "old-refresh" };
const fresh = { accessToken: "new-access", refreshToken: "new-refresh" };
function storage() {
  let value: typeof pair | null = { ...pair };
  const writes: (typeof pair | null)[] = [];
  return {
    writes,
    read: async () => value,
    write: async (v: typeof value) => {
      value = v;
      writes.push(v);
    },
  } satisfies SessionStore & { writes: unknown[] };
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
const defer = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
};
test("concurrent expired requests rotate both tokens exactly once", async () => {
  const store = storage();
  let refreshes = 0;
  const release = defer();
  const client = new ApiClient("https://api.test", store, async (url, init) => {
    if (String(url).endsWith("/auth/refresh")) {
      refreshes++;
      await release.promise;
      return json(fresh);
    }
    return new Headers(init?.headers).get("Authorization") ===
      "Bearer old-access"
      ? json({}, 401)
      : json({ ok: true });
  });
  await client.restore();
  const requests = Array.from({ length: 8 }, () =>
    client.request("/me", z.object({ ok: z.boolean() })),
  );
  await new Promise((r) => setTimeout(r, 10));
  release.resolve();
  const results = await Promise.all(requests);
  assert.equal(refreshes, 1);
  assert.equal(results.length, 8);
  assert.deepEqual(store.writes, [fresh]);
});
test("late 401 after rotation reuses new access token instead of replaying refresh", async () => {
  const store = storage();
  let refreshes = 0;
  const late = defer();
  const client = new ApiClient("https://api.test", store, async (url, init) => {
    const path = String(url);
    if (path.endsWith("/auth/refresh")) {
      refreshes++;
      return json(fresh);
    }
    if (
      new Headers(init?.headers).get("Authorization") === "Bearer old-access"
    ) {
      if (path.endsWith("/late")) await late.promise;
      return json({}, 401);
    }
    return json("ok");
  });
  await client.restore();
  const first = client.request("/first", z.string());
  const second = client.request("/late", z.string());
  await first;
  late.resolve();
  await second;
  assert.equal(refreshes, 1);
});
test("logout during refresh never restores the old session", async () => {
  const store = storage();
  const release = defer();
  const entered = defer();
  let lost = 0;
  const client = new ApiClient("https://api.test", store, async (url) => {
    if (String(url).endsWith("/auth/refresh")) {
      entered.resolve();
      await release.promise;
      return json(fresh);
    }
    if (String(url).endsWith("/logout"))
      return new Response(null, { status: 204 });
    return json({}, 401);
  });
  client.onSessionLost = () => lost++;
  await client.restore();
  const pending = client.request("/private", z.unknown());
  const rejected = assert.rejects(pending);
  await entered.promise;
  await client.logout();
  release.resolve();
  await rejected;
  assert.equal(await store.read(), null);
  assert.equal(lost, 1);
});
test("failed refresh clears session and notifies once", async () => {
  const store = storage();
  let lost = 0;
  const client = new ApiClient("https://api.test", store, async () =>
    json({}, 401),
  );
  client.onSessionLost = () => lost++;
  await client.restore();
  await assert.rejects(client.request("/private", z.unknown()));
  assert.equal(await store.read(), null);
  assert.equal(lost, 1);
});
test("a forbidden mutation is never retried or refreshed", async () => {
  const store = storage();
  let calls = 0;
  const client = new ApiClient("https://api.test", store, async () => {
    calls++;
    return json({}, 403);
  });
  await client.restore();
  await assert.rejects(
    client.request("/write", z.unknown(), { method: "POST", body: "{}" }),
    (e: unknown) => e instanceof ApiError && e.status === 403,
  );
  assert.equal(calls, 1);
  assert.deepEqual(await store.read(), pair);
});
test("login preserves password bytes and surfaces rate limits", async () => {
  const store = storage();
  let input: any;
  const client = new ApiClient(
    "https://api.test",
    store,
    async (_url, init) => {
      input = JSON.parse(String(init?.body));
      return json({}, 429);
    },
  );
  await assert.rejects(
    client.login("  member  ", " pass word "),
    (e: unknown) => e instanceof ApiError && e.status === 429,
  );
  assert.equal(input.identifier, "member");
  assert.equal(input.password, " pass word ");
});
test("responses must satisfy backend contract", async () => {
  const client = new ApiClient("https://api.test", storage(), async () =>
    json({ wrong: true }),
  );
  await client.restore();
  await assert.rejects(
    client.request("/me", z.object({ id: z.number() })),
    z.ZodError,
  );
});
test("logout invalidates in-flight private responses", async () => {
  const release = defer();
  const client = new ApiClient("https://api.test", storage(), async (url) => {
    if (String(url).endsWith("/logout"))
      return new Response(null, { status: 204 });
    await release.promise;
    return json({ private: "data" });
  });
  await client.restore();
  const p = client.request("/private", z.unknown());
  const rejected = assert.rejects(p);
  await client.logout();
  release.resolve();
  await rejected;
});
test("default transport does not bind browser fetch to the API instance", async () => {
  const original = globalThis.fetch;
  let receiver: unknown;
  globalThis.fetch = async function () {
    receiver = this;
    return json("ok");
  };
  try {
    const client = new ApiClient("https://api.test", storage());
    await client.restore();
    assert.equal(await client.request("/private", z.string()), "ok");
    assert.notEqual(receiver, client);
  } finally {
    globalThis.fetch = original;
  }
});
test("untrusted oversized collections are rejected before schema validation", async () => {
  const client = new ApiClient("https://api.test", storage(), async () =>
    json(Array.from({ length: 6000 }, () => ({ wrong: true }))),
  );
  await client.restore();
  await assert.rejects(
    client.request("/private", z.array(z.object({ id: z.number() }))),
    (e: unknown) => e instanceof ApiError && e.code === "INVALID_RESPONSE",
  );
});
test("a rejected newly refreshed access token ends the session", async () => {
  const store = storage();
  let lost = 0;
  const client = new ApiClient("https://api.test", store, async (url) =>
    String(url).endsWith("/auth/refresh") ? json(fresh) : json({}, 401),
  );
  client.onSessionLost = () => lost++;
  await client.restore();
  await assert.rejects(client.request("/private", z.unknown()));
  assert.equal(await store.read(), null);
  assert.equal(lost, 1);
});
