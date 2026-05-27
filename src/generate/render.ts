import type { RepositoryFacts } from "../analyze/summary";
import type { TreeEntry } from "../repo/walk";

export function renderOnboardingMarkdown(facts: RepositoryFacts): string {
  const projectName = facts.packageJson?.name ?? "repository";
  const lines: string[] = [
    `# ${projectName} Onboarding Snapshot`,
    "",
    "Generated from static repository facts. No source code was executed.",
    "",
    "## Project Facts",
    "",
    `- Package: ${projectName}`,
    `- Version: ${facts.packageJson?.version ?? "not declared"}`,
    `- Description: ${facts.packageJson?.description ?? "not declared"}`,
    `- Entry points: ${facts.entryPoints.length ? facts.entryPoints.join(", ") : "none detected"}`,
    "",
    "## Detected Stack",
    "",
    ...renderStackRows(facts),
    "",
    "## Codemap",
    "",
    "| Path | What it indicates |",
    "| --- | --- |",
    ...renderCodemapRows(facts),
    "",
    "## Health Snapshot",
    "",
    `- Build script: ${facts.health.hasBuildScript ? "present" : "missing"}`,
    `- Test script: ${facts.health.hasTestScript ? "present" : "missing or placeholder"}`,
    `- Lint script: ${facts.health.hasLintScript ? "present" : "missing"}`,
    `- Environment examples: ${facts.environment.exampleFiles.length ? facts.environment.exampleFiles.join(", ") : "none detected"}`,
    `- Environment variables: ${facts.environment.variableNames.length ? facts.environment.variableNames.join(", ") : "none detected"}`,
  ];

  if (facts.health.notes.length) {
    lines.push("", "### Health Notes", "", ...facts.health.notes.map((note) => `- ${note}`));
  }

  return `${lines.join("\n")}\n`;
}

function renderStackRows(facts: RepositoryFacts): string[] {
  if (!facts.technologies.length) {
    return ["No known JavaScript or TypeScript framework packages were detected."];
  }

  return [
    "| Technology | Package | Version | Category |",
    "| --- | --- | --- | --- |",
    ...facts.technologies.map(
      (tech) => `| ${tech.name} | \`${tech.packageName}\` | \`${tech.version}\` | ${tech.category} |`,
    ),
  ];
}

function renderCodemapRows(facts: RepositoryFacts): string[] {
  const rows = facts.structure
    .filter((entry) => entry.type === "directory" || isLikelyImportantFile(entry))
    .slice(0, 30)
    .map((entry) => `| \`${entry.path}\` | ${describePath(entry)} |`);

  return rows.length ? rows : ["| not detected | No src or app directory was found. |"];
}

function isLikelyImportantFile(entry: TreeEntry): boolean {
  return /(^|\/)(index|main|app|server|routes|router|config)\.(ts|tsx|js|jsx)$/.test(entry.path);
}

function describePath(entry: TreeEntry): string {
  if (entry.path.endsWith("/services")) {
    return "Likely business logic or integration boundary.";
  }

  if (entry.path.endsWith("/components")) {
    return "Likely reusable UI components.";
  }

  if (entry.path.endsWith("/routes") || entry.path.endsWith("/api")) {
    return "Likely HTTP routing or API boundary.";
  }

  if (entry.path.endsWith("/analyze")) {
    return "Repository analysis logic.";
  }

  if (entry.path.endsWith("/github")) {
    return "GitHub integration boundary.";
  }

  if (entry.path.endsWith("/generate")) {
    return "Generated documentation rendering logic.";
  }

  if (entry.path.endsWith("/repo")) {
    return "Local repository filesystem utilities.";
  }

  if (entry.type === "directory") {
    return "Directory present in the source tree.";
  }

  return "Potential runtime entry or configuration file.";
}
