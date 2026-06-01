import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PackageJsonFacts } from "./scripts";
import { pathExists } from "../repo/walk";

export type RepositoryHygieneFacts = {
  readme: boolean;
  license: boolean;
  gitignore: boolean;
  envExample: boolean;
  codeowners: boolean;
};

export type ReadmeQualityFacts = {
  exists: boolean;
  characterCount: number;
  mentionsInstall: boolean;
  mentionsTest: boolean;
  mentionsEnvironmentVariables: boolean;
};

export type HealthSnapshot = {
  hasBuildScript: boolean;
  hasTestScript: boolean;
  hasLintScript: boolean;
  testCommand?: string;
  hygiene: RepositoryHygieneFacts;
  readme: ReadmeQualityFacts;
  notes: string[];
};

export async function createHealthSnapshot(
  rootDir: string,
  packageJson: PackageJsonFacts | null,
): Promise<HealthSnapshot> {
  const scripts = packageJson?.scripts ?? {};
  const notes: string[] = [];
  const hygiene = await analyzeRepositoryHygiene(rootDir);
  const readme = await analyzeReadmeQuality(rootDir);

  if (!scripts.test) {
    notes.push("No npm test script was found.");
  }

  if (scripts.test?.includes("no test specified")) {
    notes.push("The test script is still the default npm placeholder.");
  }

  if (!scripts.lint) {
    notes.push("No lint script was found.");
  }

  if (readme.exists && readme.characterCount < 500) {
    notes.push("README exists but appears short.");
  }

  if (readme.exists && !readme.mentionsTest) {
    notes.push("README does not mention how to run tests.");
  }

  if (readme.exists && !readme.mentionsEnvironmentVariables) {
    notes.push("README does not mention required environment variables.");
  }

  return {
    hasBuildScript: Boolean(scripts.build),
    hasTestScript: Boolean(scripts.test) && !scripts.test.includes("no test specified"),
    hasLintScript: Boolean(scripts.lint),
    testCommand: scripts.test,
    hygiene,
    readme,
    notes,
  };
}

async function analyzeRepositoryHygiene(rootDir: string): Promise<RepositoryHygieneFacts> {
  return {
    readme: await hasAnyFile(rootDir, ["README.md", "README"]),
    license: await hasAnyFile(rootDir, ["LICENSE", "LICENSE.md"]),
    gitignore: await pathExists(path.join(rootDir, ".gitignore")),
    envExample: await pathExists(path.join(rootDir, ".env.example")),
    codeowners: await hasAnyFile(rootDir, [
      "CODEOWNERS",
      ".github/CODEOWNERS",
      "docs/CODEOWNERS",
    ]),
  };
}

async function analyzeReadmeQuality(rootDir: string): Promise<ReadmeQualityFacts> {
  const readmePath = await findFirstExistingFile(rootDir, ["README.md", "README"]);

  if (!readmePath) {
    return {
      exists: false,
      characterCount: 0,
      mentionsInstall: false,
      mentionsTest: false,
      mentionsEnvironmentVariables: false,
    };
  }

  const content = await readFile(readmePath, "utf8");

  return {
    exists: true,
    characterCount: content.length,
    mentionsInstall: /\b(install|npm install|pnpm install|yarn install|bun install)\b/i.test(content),
    mentionsTest: /\b(test|tests|npm test|npm run test|pnpm test|yarn test|bun test)\b/i.test(content),
    mentionsEnvironmentVariables: /\b(env|environment variables?|\.env|WEBHOOK_SECRET)\b/i.test(content),
  };
}

async function hasAnyFile(rootDir: string, candidates: string[]): Promise<boolean> {
  return Boolean(await findFirstExistingFile(rootDir, candidates));
}

async function findFirstExistingFile(
  rootDir: string,
  candidates: string[],
): Promise<string | null> {
  for (const candidate of candidates) {
    const candidatePath = path.join(rootDir, candidate);

    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
}
