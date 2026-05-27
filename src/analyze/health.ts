import type { PackageJsonFacts } from "./scripts";

export type HealthSnapshot = {
  hasBuildScript: boolean;
  hasTestScript: boolean;
  hasLintScript: boolean;
  testCommand?: string;
  notes: string[];
};

export function createHealthSnapshot(packageJson: PackageJsonFacts | null): HealthSnapshot {
  const scripts = packageJson?.scripts ?? {};
  const notes: string[] = [];

  if (!scripts.test) {
    notes.push("No npm test script was found.");
  }

  if (scripts.test?.includes("no test specified")) {
    notes.push("The test script is still the default npm placeholder.");
  }

  if (!scripts.lint) {
    notes.push("No lint script was found.");
  }

  return {
    hasBuildScript: Boolean(scripts.build),
    hasTestScript: Boolean(scripts.test) && !scripts.test.includes("no test specified"),
    hasLintScript: Boolean(scripts.lint),
    testCommand: scripts.test,
    notes,
  };
}
