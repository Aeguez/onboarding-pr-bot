import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CloneRepositoryOptions = {
  owner: string;
  repo: string;
  token: string;
};

export async function cloneRepositoryToTempDir(
  options: CloneRepositoryOptions,
): Promise<string> {
  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), `onboarding-pr-bot-${options.owner}-${options.repo}-`),
  );

  const cloneUrl = createAuthenticatedCloneUrl(options);

  await execFileAsync("git", ["clone", "--depth", "1", cloneUrl, tempDir], {
    timeout: 120_000,
  });

  return tempDir;
}

function createAuthenticatedCloneUrl(options: CloneRepositoryOptions): string {
  return `https://x-access-token:${encodeURIComponent(options.token)}@github.com/${options.owner}/${options.repo}.git`;
}
