import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyGitHubWebhookSignature } from "./webhookSecurity";

test("verifies a valid GitHub webhook signature", () => {
  const secret = "test-secret";
  const rawBody = Buffer.from(JSON.stringify({ action: "opened" }));
  const signature =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  assert.equal(verifyGitHubWebhookSignature(rawBody, signature, secret), true);
});

test("rejects an invalid GitHub webhook signature", () => {
  const rawBody = Buffer.from(JSON.stringify({ action: "opened" }));

  assert.equal(
    verifyGitHubWebhookSignature(rawBody, "sha256=invalid", "test-secret"),
    false,
  );
});
