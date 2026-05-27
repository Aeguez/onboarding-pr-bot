import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../repo/walk";

export type EnvFacts = {
  exampleFiles: string[];
  variableNames: string[];
};

export async function analyzeEnvironment(rootDir: string): Promise<EnvFacts> {
  const candidates = [".env.example", ".env.sample"];
  const exampleFiles: string[] = [];
  const variableNames = new Set<string>();

  for (const candidate of candidates) {
    const absolutePath = path.join(rootDir, candidate);
    if (!(await pathExists(absolutePath))) {
      continue;
    }

    exampleFiles.push(candidate);
    const raw = await readFile(absolutePath, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      variableNames.add(trimmed.split("=")[0].trim());
    }
  }

  return {
    exampleFiles,
    variableNames: [...variableNames].sort(),
  };
}
