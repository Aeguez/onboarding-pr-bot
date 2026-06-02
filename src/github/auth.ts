import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

type InstallationAuthResult = {
  token: string;
};

export type GitHubAppAuthConfig = {
    appId: string;
    privateKey: string;
    installationId: string;
};

export function createInstallationOctokit(config: GitHubAppAuthConfig): Octokit {
    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appID: config.appId,
            privateKey: config.privateKey,
            installationId: config.installationId,
        },
    });
}

export function getGitHubAppAuthConfigFromEnv(): GitHubAppAuthConfig {
  const appId = process.env.APP_ID;
  const privateKey = process.env.PRIVATE_KEY;
  const installationId = process.env.INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    throw new Error("Missing GitHub App authentication environment variables.");
  }

  return {
    appId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    installationId,
  };
}

export async function createInstallationAccessToken(): Promise<string> {
  const octokit = createInstallationOctokit(getGitHubAppAuthConfigFromEnv());

  const auth = await octokit.auth({
    type: "installation",
  });

  if (!isInstallationAuthResult(auth)) {
    throw new Error("GitHub App authentication did not return an installation token.");
  }

  return auth.token;
}

function isInstallationAuthResult(value: unknown): value is InstallationAuthResult {
    return (
        typeof value === "object" &&
        value !== null &&
        "token" in value &&
        typeof value.token === "string"
    )

}