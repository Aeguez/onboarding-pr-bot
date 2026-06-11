import crypto from "node:crypto";

export function verifyGitHubWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  webhookSecret: string | undefined,
): boolean {
  if (!signatureHeader || !webhookSecret) {
    return false;
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

  return safeCompare(signatureHeader, expectedSignature);
}

function safeCompare(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}
