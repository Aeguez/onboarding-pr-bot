# onboarding-pr-bot CODEMAP

Generated from static repository structure. No source code was executed.

| Path | What it indicates |
| --- | --- |
| `src` | Directory present in the source tree. |
| `src/analyze` | Repository analysis logic. |
| `src/app.ts` | Potential runtime entry or configuration file. |
| `src/config` | Runtime configuration and app defaults. |
| `src/generate` | Generated documentation rendering logic. |
| `src/github` | GitHub integration boundary. |
| `src/index.ts` | Potential runtime entry or configuration file. |
| `src/repo` | Local repository filesystem utilities. |

## Internal Imports

- `src/analyze/detectStack.ts` imports `./scripts`
- `src/analyze/env.ts` imports `../repo/walk`
- `src/analyze/health.ts` imports `../repo/walk`, `./scripts`
- `src/analyze/imports.ts` imports `../repo/walk`
- `src/analyze/packageManager.test.ts` imports `./packageManager`
- `src/analyze/packageManager.ts` imports `../repo/walk`
- `src/analyze/scripts.ts` imports `../repo/walk`
- `src/analyze/summary.ts` imports `../repo/walk`, `./detectStack`, `./env`, `./health`, `./imports`, `./packageManager`, `./scripts`, `./tsconfig`, `./workflows`
- `src/analyze/tsconfig.ts` imports `../repo/walk`
- `src/analyze/workflows.ts` imports `../repo/walk`
- `src/app.test.ts` imports `./app`, `./github/prPublisher`
- `src/app.ts` imports `./analyze/summary`, `./generate/render`, `./generate/writeDocs`, `./github/auth`, `./github/prPublisher`, `./github/webhookSecurity`, `./repo/clone`
- `src/generate/render.ts` imports `../analyze/summary`, `../repo/walk`
- `src/generate/writeDocs.ts` imports `../analyze/summary`, `./render`
- `src/github/prPublisher.test.ts` imports `../analyze/summary`, `./prPublisher`
- `src/github/prPublisher.ts` imports `../analyze/summary`
- `src/github/webhookSecurity.test.ts` imports `./webhookSecurity`
- `src/index.ts` imports `./app`
