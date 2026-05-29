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
    "## Generated Companion Files",
    "",
    "- `CODEMAP.md`",
    "- `docs/health-snapshot.md`",
  ];

  return `${lines.join("\n")}\n`;
}

export function renderCodemapMarkdown(facts: RepositoryFacts): string {
  const projectName = facts.packageJson?.name ?? "repository";
  const lines: string[] = [
    `# ${projectName} CODEMAP`,
    "",
    "Generated from static repository structure. No source code was executed.",
    "",
    "| Path | What it indicates |",
    "| --- | --- |",
    ...renderCodemapRows(facts),
  ];

  return `${lines.join("\n")}\n`;
}

export function renderHealthSnapshotMarkdown(facts: RepositoryFacts): string {
  const projectName = facts.packageJson?.name ?? "repository";
  const lines: string[] = [
    `# ${projectName} Health Snapshot`,
    "",
    "Generated from package metadata and configuration files.",
    "",
    "## Scripts",
    "",
    `- Build script: ${facts.health.hasBuildScript ? "present" : "missing"}`,
    `- Test script: ${facts.health.hasTestScript ? "present" : "missing or placeholder"}`,
    `- Lint script: ${facts.health.hasLintScript ? "present" : "missing"}`,
    "",
    "## TypeScript",
    "",
    `- tsconfig.json: ${facts.tsconfig.exists ? "present" : "missing"}`,
    `- Strict mode: ${facts.tsconfig.strict === undefined ? "not declared" : String(facts.tsconfig.strict)}`,
    `- Target: ${facts.tsconfig.target ?? "not declared"}`,
    `- Module: ${facts.tsconfig.module ?? "not declared"}`,
    `- rootDir: ${facts.tsconfig.rootDir ?? "not declared"}`,
    `- outDir: ${facts.tsconfig.outDir ?? "not declared"}`,
    "",
    "## Environment",
    "",
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
  if (entry.path.endsWith("/controllers")) {
    return "Request coordination layer between routes and business logic.";
  }

  if (entry.path.endsWith("/routes")) {
    return "HTTP route definitions and request handlers.";
  }

  if (entry.path.endsWith("/api")) {
    return "API route definitions or HTTP integration boundary.";
  }

  if (entry.path.endsWith("/services")) {
    return "Business logic and external integration code.";
  }

  if (entry.path.endsWith("/models")) {
    return "Data models or database-facing entities.";
  }

  if (entry.path.endsWith("/middleware")) {
    return "Reusable request and response middleware.";
  }

  if (entry.path.endsWith("/components")) {
    return "Likely reusable UI components.";
  }
  
  if (entry.path.endsWith("/pages")) {
    return "Page-level routes or views.";
  }

  if (entry.path.endsWith("/app")) {
    return "Application routes, layout, or app-level source code.";
  }

  if (entry.path.endsWith("/lib")) {
    return "Shared library code and reusable helpers.";
  }

  if (entry.path.endsWith("/utils")) {
    return "Small utility functions shared across the app.";
  }

  if (entry.path.endsWith("/config")) {
    return  "Runtime configuration and app defaults.";
  }

  if (entry.path.endsWith("/tests") || entry.path.endsWith("/_tests_")) {
    return "Automated test files.";
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
