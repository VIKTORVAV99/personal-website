// Explicit module import (not the ambient global): this package exports raw .ts,
// so the frontend's svelte-check type-checks these files under a tsconfig that
// doesn't include the backend's ambient workers-types.
import type { SecretsStoreSecret } from "@cloudflare/workers-types";

export const GITHUB_USERNAME = "viktorvav99";

const GITHUB_API_BASE = "https://api.github.com";

export type GithubEnv = {
  SECRETS: SecretsStoreSecret;
};

export type GithubResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; rateLimited: boolean };

export const buildGithubHeaders = (token?: string): Record<string, string> => ({
  // GitHub rejects requests without a User-Agent.
  "User-Agent": "portfolio-backend",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const getGithubToken = async (env: GithubEnv): Promise<string | undefined> => {
  try {
    return await env.SECRETS.get();
  } catch {
    // Local dev without a Secrets Store value — fall back to unauthenticated requests.
    return undefined;
  }
};

// GraphQL always requires a token.
export const githubGraphql = async <T = unknown>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<GithubResult<T>> => {
  const response = await fetch(`${GITHUB_API_BASE}/graphql`, {
    method: "POST",
    headers: { ...buildGithubHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      rateLimited: response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0",
    };
  }
  const body = (await response.json()) as { data?: T; errors?: unknown[] };
  if (body.data === undefined || body.data === null) {
    // GraphQL reports errors in-band with a 200 status. Errors alongside data
    // are partial successes (e.g. one aliased field failed) — keep the data.
    return { ok: false, status: response.status, rateLimited: false };
  }
  return { ok: true, data: body.data };
};
