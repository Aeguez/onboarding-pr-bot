import express from "express";
import dotenv from "dotenv";
import { analyzeRepository } from "./analyze/summary";
import { renderOnboardingMarkdown } from "./generate/render";
import { writeGeneratedDocs } from "./generate/writeDocs";
import { verifyGitHubWebhookSignature } from "./github/webhookSecurity";

dotenv.config();

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
    }
  }
  ));

app.post("/api/generate-local-docs", async(_req, res, next) => {
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

app.post("/api/webhook", async (req, res, next) => {
  try{
  const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;
  const signature = req.header("x-hub-signature-256");

  if(
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

  console.log("Webhook received:", { event, delivery });

  const facts = await analyzeRepository(process.cwd());

  
  res.status(200).json({
    ok: true,
    event,
    delivery,
    package: facts.packageJson?.name,
    detectedTechnologies: facts.technologies.map((tech) => tech.name),
    entryPoints: facts.entryPoints,
    health: facts.health,
  });
} catch (error) {
  next(error);
  }
});
  
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
