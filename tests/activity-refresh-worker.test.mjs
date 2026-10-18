import assert from "node:assert/strict";
import test from "node:test";

import worker from "../cloudflare/activity-refresh/worker.mjs";

const DEPLOY_HOOK_URL =
  "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test-hook";

test("the scheduled Worker requests a Pages build", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    new Response(null, { status: 200 }),
  );

  await worker.scheduled({}, { PAGES_DEPLOY_HOOK_URL: DEPLOY_HOOK_URL });

  assert.equal(fetchMock.mock.callCount(), 1);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, DEPLOY_HOOK_URL);
  assert.equal(options.method, "POST");
  assert.equal(options.redirect, "manual");
});

test("missing configuration fails without making a request", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");

  await assert.rejects(worker.scheduled({}, {}), /PAGES_DEPLOY_HOOK_URL is required/);
  assert.equal(fetchMock.mock.callCount(), 0);
});

for (const status of [302, 503]) {
  test(`a deploy hook returning HTTP ${status} marks the run as failed`, async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
      new Response("Failure details", { status }),
    );

    await assert.rejects(
      worker.scheduled({}, { PAGES_DEPLOY_HOOK_URL: DEPLOY_HOOK_URL }),
      new RegExp("Cloudflare Pages deploy hook returned HTTP " + status),
    );
  });
}

test("network failures do not expose the secret deploy hook URL", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Request failed for " + DEPLOY_HOOK_URL);
  });

  await assert.rejects(
    worker.scheduled({}, { PAGES_DEPLOY_HOOK_URL: DEPLOY_HOOK_URL }),
    (error) => {
      assert.equal(error.message, "Cloudflare Pages deploy hook request failed");
      assert.equal(String(error.stack).includes(DEPLOY_HOOK_URL), false);
      assert.equal(error.cause, undefined);
      return true;
    },
  );
});
