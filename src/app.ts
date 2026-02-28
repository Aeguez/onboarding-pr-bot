import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// GitHub manda JSON
app.use(express.json());

// Endpoint webhook (por ahora solo log)
app.post("/api/webhook", (req, res) => {
  const event = req.header("x-github-event");
  const delivery = req.header("x-github-delivery");
  console.log("Webhook received:", { event, delivery });
  console.log("Body keys:", Object.keys(req.body || {}));
  res.status(200).send("ok");
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

export default app;