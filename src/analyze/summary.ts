import path from "node:path";
import { analyzeEnvironment, type EnvFacts } from "./env";
import { createHealthSnapshot, type HealthSnapshot } from "./health";
import { detectStack, type DetectedTechnology } from "./detectStack";
import { getAvailableScripts, readPackageJson, type PackageJsonFacts } from "./scripts";
import { pathExists, walkRepository, type TreeEntry } from "../repo/walk";
import { analyzeTsConfig, type TsConfigFacts } from "./tsconfig";
import { analyzeWorkflows, type WorkflowFacts } from "./workflows";
import {
  detectPackageManager,
  type PackageManagerFacts,
} from "./packageManager";

export type RepositoryFacts = {
  repositoryPath: string;
  packageJson: PackageJsonFacts | null;
  packageManager: PackageManagerFacts;
  tsconfig: TsConfigFacts;
  technologies: DetectedTechnology[];
  scripts: string[];
  entryPoints: string[];
  structure: TreeEntry[];
  environment: EnvFacts;
  health: HealthSnapshot;
  workflows: WorkflowFacts;
};

const entryPointCandidates = [
  "src/index.ts",
  "src/index.tsx",
  "src/main.ts",
  "src/main.tsx",
  "src/app.ts",
  "src/server.ts",
  "app/index.ts",
  "app/page.tsx",
];

export async function analyzeRepository(rootDir: string): Promise<RepositoryFacts> {
  const repositoryPath = path.resolve(rootDir);
  const packageJson = await readPackageJson(repositoryPath);
  const entryPoints = await findEntryPoints(repositoryPath);

  return {
    repositoryPath,
    packageJson,
    packageManager: await detectPackageManager(repositoryPath),
    tsconfig: await analyzeTsConfig(repositoryPath),
    technologies: detectStack(packageJson),
    scripts: getAvailableScripts(packageJson),
    entryPoints,
    structure: await walkRepository(repositoryPath),
    environment: await analyzeEnvironment(repositoryPath),
    health: await createHealthSnapshot(repositoryPath, packageJson),
    workflows: await analyzeWorkflows(repositoryPath),
  };
}

async function findEntryPoints(rootDir: string): Promise<string[]> {
  const matches: string[] = [];

  for (const candidate of entryPointCandidates) {
    if (await pathExists(path.join(rootDir, candidate))) {
      matches.push(candidate);
    }
  }

  return matches;
}
