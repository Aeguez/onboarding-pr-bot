import type { PackageJsonFacts } from "./scripts";

export type DetectedTechnology = {
  name: string;
  packageName: string;
  version: string;
  category: "runtime" | "framework" | "language" | "tooling" | "testing" | "database";
};

const knownPackages: Array<Omit<DetectedTechnology, "version">> = [
  { name: "Express", packageName: "express", category: "framework" },
  { name: "React", packageName: "react", category: "framework" },
  { name: "Next.js", packageName: "next", category: "framework" },
  { name: "Vue", packageName: "vue", category: "framework" },
  { name: "Vite", packageName: "vite", category: "tooling" },
  { name: "TypeScript", packageName: "typescript", category: "language" },
  { name: "ts-node-dev", packageName: "ts-node-dev", category: "tooling" },
  { name: "Jest", packageName: "jest", category: "testing" },
  { name: "Vitest", packageName: "vitest", category: "testing" },
  { name: "Mocha", packageName: "mocha", category: "testing" },
  { name: "Prisma", packageName: "prisma", category: "database" },
  { name: "Mongoose", packageName: "mongoose", category: "database" },
  { name: "dotenv", packageName: "dotenv", category: "tooling" },
  {name: "ESLint", packageName: "eslint", category:"tooling"},
];

export function detectStack(packageJson: PackageJsonFacts | null): DetectedTechnology[] {
  if (!packageJson) {
    return [];
  }

  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return knownPackages
    .filter((tech) => allDependencies[tech.packageName])
    .map((tech) => ({
      ...tech,
      version: allDependencies[tech.packageName],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
