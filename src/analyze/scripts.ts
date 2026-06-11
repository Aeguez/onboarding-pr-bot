import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../repo/walk";

export type PackageJsonFacts = {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

export async function readPackageJson(rootDir: string): Promise<PackageJsonFacts | null> {
  const packageJsonPath = path.join(rootDir, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return null;
  }

  const raw = await readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  return {
    name: parsed.name,
    version: parsed.version,
    description: parsed.description,
    main: parsed.main,
    scripts: parsed.scripts ?? {},
    dependencies: parsed.dependencies ?? {},
    devDependencies: parsed.devDependencies ?? {},
  };
}

export function getAvailableScripts(packageJson: PackageJsonFacts | null): string[] {
  return Object.keys(packageJson?.scripts ?? {}).sort();
}
