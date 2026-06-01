import path from "node:path";
import { pathExists } from "../repo/walk";

export type PackageManagerFacts = {
  name: "npm" | "yarn" | "pnpm" | "bun" | "unknown";
  lockfile?: string;
};

const lockfiles: Array<{
  name: PackageManagerFacts["name"];
  file: string;
}> = [
  { name: "npm", file: "package-lock.json" },
  { name: "yarn", file: "yarn.lock" },
  { name: "pnpm", file: "pnpm-lock.yaml" },
  { name: "bun", file: "bun.lockb" },
];

export async function detectPackageManager(
  rootDir: string,
): Promise<PackageManagerFacts> {
  for (const lockfile of lockfiles) {
    if (await pathExists(path.join(rootDir, lockfile.file))) {
      return {
        name: lockfile.name,
        lockfile: lockfile.file,
      };
    }
  }

  return {
    name: "unknown",
  };
}