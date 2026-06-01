import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../repo/walk";

export type WorkflowFacts = {
  files: string[];
  hasCi: boolean;
};

export async function analyzeWorkflows(rootDir: string): Promise<WorkflowFacts> {
    const workflowsDir = path.join(rootDir, ".github", "workflows");

    if (!(await pathExists(workflowsDir))) {
        return {
            files: [],
            hasCi: false,
        };
    }

    const entries = await readdir(workflowsDir, { withFileTypes: true });

    const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort();

    return {
        files,
        hasCi: files.length > 0,
    };
}
