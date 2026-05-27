import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
]);

export type TreeEntry = {
  path: string;
  type: "file" | "directory";
  depth: number;
};

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function walkRepository(
  rootDir: string,
  options: { maxDepth?: number; roots?: string[] } = {},
): Promise<TreeEntry[]> {
  const maxDepth = options.maxDepth ?? 3;
  const roots = options.roots ?? ["src", "app"];
  const entries: TreeEntry[] = [];

  for (const root of roots) {
    const absoluteRoot = path.join(rootDir, root);
    if (!(await pathExists(absoluteRoot))) {
      continue;
    }

    entries.push({ path: root, type: "directory", depth: 0 });
    await walkDirectory(rootDir, absoluteRoot, 1, maxDepth, entries);
  }

  return entries;
}

async function walkDirectory(
  rootDir: string,
  currentDir: string,
  depth: number,
  maxDepth: number,
  entries: TreeEntry[],
): Promise<void> {
  if (depth > maxDepth) {
    return;
  }

  const children = await readdir(currentDir, { withFileTypes: true });

  for (const child of children.sort((a, b) => a.name.localeCompare(b.name))) {
    if (child.isDirectory() && ignoredDirectories.has(child.name)) {
      continue;
    }

    const absolutePath = path.join(currentDir, child.name);
    const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, "/");

    if (child.isDirectory()) {
      entries.push({ path: relativePath, type: "directory", depth });
      await walkDirectory(rootDir, absolutePath, depth + 1, maxDepth, entries);
      continue;
    }

    if (child.isFile()) {
      entries.push({ path: relativePath, type: "file", depth });
    }
  }
}
