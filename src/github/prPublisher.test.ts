import assert from "node:assert/strict";
import test from "node:test";
import type { RepositoryFacts } from "../analyze/summary";
import { buildPullRequestBody } from "./prPublisher";

test("builds a PR body from verified repository facts", () => {
  const body = buildPullRequestBody(createFacts(), [
    "docs/onboarding.md",
    "CODEMAP.md",
    "docs/health-snapshot.md",
  ]);

  assert.match(body, /docs\/onboarding\.md/);
  assert.match(body, /Package: onboarding-pr-bot/);
  assert.match(body, /Package manager: npm \(package-lock\.json\)/);
  assert.match(body, /Detected stack: Express \(express\)/);
  assert.match(body, /No source code was executed/);
});

function createFacts(): RepositoryFacts {
  return {
    repositoryPath: "/repo",
    packageJson: {
      name: "onboarding-pr-bot",
      scripts: {},
      dependencies: {},
      devDependencies: {},
    },
    packageManager: {
      name: "npm",
      lockfile: "package-lock.json",
    },
    tsconfig: {
      exists: true,
      strict: true,
    },
    technologies: [
      {
        name: "Express",
        packageName: "express",
        version: "^5.2.1",
        category: "framework",
      },
    ],
    scripts: ["build"],
    entryPoints: ["src/index.ts"],
    structure: [],
    imports: [],
    environment: {
      exampleFiles: [".env.example"],
      variableNames: ["WEBHOOK_SECRET"],
    },
    health: {
      hasBuildScript: true,
      hasTestScript: false,
      hasLintScript: false,
      hygiene: {
        readme: true,
        license: true,
        gitignore: true,
        envExample: true,
        codeowners: false,
      },
      readme: {
        exists: true,
        characterCount: 1000,
        mentionsInstall: true,
        mentionsTest: true,
        mentionsEnvironmentVariables: true,
      },
      notes: ["No lint script was found."],
    },
    workflows: {
      files: ["ci.yml"],
      hasCi: true,
    },
  };
}
