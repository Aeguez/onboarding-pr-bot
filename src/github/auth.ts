import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

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