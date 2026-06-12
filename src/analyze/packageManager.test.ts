import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { detectPackageManager } from "./packageManager";

test("detects npm from package-lock.json", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "package-manager-test-"));

  try {
    await writeFile(path.join(tempDir, "package-lock.json"), "{}", "utf8");

    assert.deepEqual(await detectPackageManager(tempDir), {
      name: "npm",
      lockfile: "package-lock.json",
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("returns unknown when no lockfile exists", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "package-manager-test-"));

  try {
    assert.deepEqual(await detectPackageManager(tempDir), {
      name: "unknown",
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
