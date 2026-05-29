import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RepositoryFacts } from "../analyze/summary";
import {
  renderCodemapMarkdown,
  renderHealthSnapshotMarkdown,
  renderOnboardingMarkdown,
} from "./render";

export type GeneratedDocsResult = {
  files: string[];
};

export async function writeGeneratedDocs(
  rootDir: string,
  facts: RepositoryFacts,
): Promise<GeneratedDocsResult> {
  const docsDir = path.join(rootDir, "docs");
  const onboardingPath = path.join(docsDir, "onboarding.md");
  const codemapPath = path.join(rootDir, "CODEMAP.md");
  const healthPath = path.join(docsDir, "health-snapshot.md");

  await mkdir(docsDir, { recursive: true });

  await Promise.all([
    writeFile(onboardingPath, renderOnboardingMarkdown(facts), "utf8"),
    writeFile(codemapPath, renderCodemapMarkdown(facts), "utf8"),
    writeFile(healthPath, renderHealthSnapshotMarkdown(facts), "utf8"),
  ]);

  return {
    files: ["docs/onboarding.md", "CODEMAP.md", "docs/health-snapshot.md"],
  };
}

