import { readFile } from "node:fs/promises";
import path from "node:path";
import { walkRepository } from "../repo/walk";

export type ImportFacts = {
  file: string;
  imports: string[];
};

const sourceFilePattern = /\.(ts|tsx|js|jsx)$/;
const staticImportPattern = /\bimport\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportPattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const requirePattern = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;

export async function analyzeImports(rootDir: string): Promise<ImportFacts[]> {
  const entries = await walkRepository(rootDir, { roots: ["src", "app"], maxDepth: 8 });
  const sourceFiles = entries
    .filter((entry) => entry.type === "file" && sourceFilePattern.test(entry.path))
    .map((entry) => entry.path)
    .sort();

  const facts: ImportFacts[] = [];

  for (const file of sourceFiles) {
    const content = await readFile(path.join(rootDir, file), "utf8");
    const imports = findInternalImports(content);

    if (imports.length) {
      facts.push({ file, imports });
    }
  }

  return facts;
}

function findInternalImports(content: string): string[] {
  const imports = new Set<string>();

  for (const pattern of [staticImportPattern, dynamicImportPattern, requirePattern]) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
      const importPath = match[1];

      if (importPath.startsWith(".")) {
        imports.add(importPath);
      }
    }
  }

  return [...imports].sort();
}
