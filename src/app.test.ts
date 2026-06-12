import assert from "node:assert/strict";
import test from "node:test";
import { docsBranchName } from "./github/prPublisher";
import { getIgnoredPushReason } from "./app";

test("ignores pushes to the generated documentation branch", () => {
  assert.equal(
    getIgnoredPushReason("push", { ref: `refs/heads/${docsBranchName}` }),
    "Ignoring bot documentation branch push",
  );
});

test("ignores bot-authored pushes", () => {
  assert.equal(
    getIgnoredPushReason("push", {
      ref: "refs/heads/main",
      sender: { type: "Bot", login: "onboarding-pr-bot[bot]" },
    }),
    "Ignoring bot-authored push",
  );
});

test("does not ignore human-authored main pushes", () => {
  assert.equal(
    getIgnoredPushReason("push", {
      ref: "refs/heads/main",
      sender: { type: "User", login: "Aeguez" },
    }),
    null,
  );
});
