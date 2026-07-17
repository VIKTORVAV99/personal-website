import { Hono } from "hono";
import { getGithubToken, githubGraphql, GITHUB_USERNAME, type GithubEnv } from "./client";
import { CONTRIBUTION_DAYS, CONTRIBUTIONS_FIELDS, shapeContributionCounts } from "./contributions";
import { MERGED_PRS_FIELDS, OPENED_ISSUES_FIELDS, shapeActivityLog } from "./latestActivity";

const LOG_LIMIT = 15;
// PR search sorts by update time, so fetch headroom to re-sort by merge time —
// generous, since a burst of comment activity on old merged PRs can push
// recent merges far down the update-sorted list; issue search sorts by
// creation time, which is already what we display.
const PR_SEARCH_LIMIT = 50;

const ACTIVITY_QUERY = `
  query Activity($prSearch: String!, $issueSearch: String!, $from: DateTime!, $to: DateTime!) {
    prs: search(query: $prSearch, type: ISSUE, first: ${PR_SEARCH_LIMIT}) {
${MERGED_PRS_FIELDS}
    }
    issues: search(query: $issueSearch, type: ISSUE, first: ${LOG_LIMIT}) {
${OPENED_ISSUES_FIELDS}
    }
    viewer {
      contributionsCollection(from: $from, to: $to) {
${CONTRIBUTIONS_FIELDS}
      }
    }
  }
`;

// Keep this app chained so its schema flows into AppType via .route() in index.ts.
// Adding a GitHub-backed feature = one shaper module + one .get() here.
export const githubRoutes = new Hono<{ Bindings: GithubEnv }>().get("/activity", async (c) => {
  const token = await getGithubToken(c.env);
  if (token === undefined) {
    // GraphQL requires a token (e.g. local dev without a provisioned secret);
    // consumers treat an empty log and null counts as "render nothing".
    // no-store keeps the cache middleware from storing this 200, so a
    // transient Secrets Store failure in production heals on the next
    // request instead of pinning an empty feed for an hour.
    c.header("Cache-Control", "no-store, max-age=0");
    return c.json({ log: [], contributions: null });
  }

  // One GraphQL round trip per cache miss: merged PRs and opened issues
  // (private ones redacted by the shaper) plus windowed contribution counts.
  const to = new Date();
  const from = new Date(to.getTime() - CONTRIBUTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await githubGraphql(
    ACTIVITY_QUERY,
    {
      prSearch: `is:pr is:merged author:${GITHUB_USERNAME} sort:updated-desc`,
      issueSearch: `is:issue author:${GITHUB_USERNAME} sort:created-desc`,
      from: from.toISOString(),
      to: to.toISOString(),
    },
    token,
  );
  if (!result.ok) {
    return c.json({ error: "github_unavailable" as const }, 502);
  }

  const counts = shapeContributionCounts(result.data);
  return c.json({
    log: shapeActivityLog(result.data).slice(0, LOG_LIMIT),
    contributions: counts === null ? null : { ...counts, days: CONTRIBUTION_DAYS },
  });
});
