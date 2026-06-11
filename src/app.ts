import { rm } from "node:fs/promises";
import { createInstallationAccessToken } from "./github/auth";
import { publishOnboardingPullRequest } from "./github/prPublisher";
import { cloneRepositoryToTempDir } from "./repo/clone";
import express from "express";
import dotenv from "dotenv";
import { analyzeRepository } from "./analyze/summary";
import { renderOnboardingMarkdown } from "./generate/render";
import { writeGeneratedDocs } from "./generate/writeDocs";
import { verifyGitHubWebhookSignature } from "./github/webhookSecurity";

dotenv.config();

type RequestWithRawBody = express.Request & {
  rawBody?: Buffer;
};

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as RequestWithRawBody).rawBody = Buffer.from(buf);
    },
  }),
);

app.post("/api/webhook", async (req, res, next) => {
  let repoPath: string | undefined;

  try {
    const rawBody = (req as RequestWithRawBody).rawBody;
    const signature = req.header("x-hub-signature-256");

    if (
      !rawBody ||
      !verifyGitHubWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET)
    ) {
      res.status(401).json({
        ok: false,
        error: "Invalid webhook signature",
      });
      return;
    }

    const event = req.header("x-github-event");
    const delivery = req.header("x-github-delivery");

    if (!event || !isSupportedWebhookEvent(event)) {
      res.status(202).json({
        ok: true,
        ignored: true,
        event,
      });
      return;
    }

    const repository = req.body.repository;

    if (!repository?.owner?.login || !repository?.name || !repository?.default_branch) {
      res.status(400).json({
        ok: false,
        error: "Webhook payload is missing repository information",
      });
      return;
    }

    const owner = repository.owner.login;
    const repo = repository.name;
    const defaultBranch = repository.default_branch;
    const installationId = req.body.installation?.id
      ? String(req.body.installation.id)
      : undefined;

    console.log("Webhook received:", {
      event,
      delivery,
      owner,
      repo,
    });

    const token = await createInstallationAccessToken(installationId);

    const clonedRepoPath = await cloneRepositoryToTempDir({
      owner,
      repo,
      token,
    });

    repoPath = clonedRepoPath;

    const facts = await analyzeRepository(clonedRepoPath);
    const result = await writeGeneratedDocs(clonedRepoPath, facts);
    const pullRequest = await publishOnboardingPullRequest({
      owner,
      repo,
      repoPath: clonedRepoPath,
      token,
      defaultBranch,
      files: result.files,
    });

    res.status(200).json({
      ok: true,
      event,
      delivery,
      owner,
      repo,
      generatedFiles: result.files,
      pullRequest,
      package: facts.packageJson?.name,
      detectedTechnologies: facts.technologies.map((tech) => tech.name),
      entryPoints: facts.entryPoints,
      health: facts.health,
    });
  } catch (error) {
    next(error);
  } finally {
    if (repoPath) {
      await rm(repoPath, { recursive: true, force: true });
    }
  }
});

function isSupportedWebhookEvent(event: string): boolean {
  return event === "push" || event === "repository";
}

app.get("/api/analyze-local", async (_req, res, next) => {
  try {
    const facts = await analyzeRepository(process.cwd());
    res.status(200).json(facts);
  } catch (error) {
    next(error);
  }
});

app.get("/api/onboarding-preview", async (_req, res, next) => {
  try {
    const facts = await analyzeRepository(process.cwd());
    res.type("text/markdown").status(200).send(renderOnboardingMarkdown(facts));
  } catch (error) {
    next(error);
  }
});

app.post("/api/generate-local-docs", async (_req, res, next) => {
  try {
    const facts = await analyzeRepository(process.cwd());
    const result = await writeGeneratedDocs(process.cwd(), facts);

    res.status(201).json({
      ok: true,
      generatedFiles: result.files,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  },
);

export default app;
