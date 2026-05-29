import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../repo/walk";

export type TsConfigFacts = {
    exists: boolean;
    strict?: boolean;
    target?: string;
    module?: string;
    rootDir?: string;
    outDir?: string;
};

export async function analyzeTsConfig(rootDir: string): Promise<TsConfigFacts> {
    const tsconfigPath = path.join(rootDir, "tsconfig.json");

    if(!(await pathExists(tsconfigPath))) {
        return { exists:false };
    }

    const raw = await readFile(tsconfigPath, "utf8");
    const parsed = JSON.parse(raw) as {
        compilerOptions?: {
            strict?: boolean;
            target?: string;
            module?: string;
            rootDir?: string;
            outDir?: string;
        };
    };

    const options = parsed.compilerOptions ?? {};

    return {
        exists: true,
        strict: options.strict,
        target: options.target,
        module: options.module,
        rootDir: options.rootDir,
        outDir: options.outDir,
    };
}