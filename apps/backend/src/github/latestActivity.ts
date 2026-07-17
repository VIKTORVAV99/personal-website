type ActivityType = "pr-merged" | "issue-opened";

export type LatestActivity =
  | {
      type: ActivityType;
      /** Private activity is redacted: only type and timestamp are exposed. */
      private: true;
      repo: null;
      message: null;
      url: null;
      timestamp: string;
    }
  | {
      type: ActivityType;
      private: false;
      repo: string;
      /** PR/issue title (first line). */
      message: string | null;
      url: string;
      timestamp: string;
    };

const MAX_MESSAGE_LENGTH = 72;

const shapeMessage = (message: string): string => {
  const [firstLine] = message.split("\n", 1);
  return firstLine.length > MAX_MESSAGE_LENGTH
    ? `${firstLine.slice(0, MAX_MESSAGE_LENGTH - 1)}…`
    : firstLine;
};

/**
 * Fields for the two aliased `search(type: ISSUE, …)` blocks. Search reaches
 * the user's whole history — unlike the events feed, which only exposes the
 * last ~100 events and rarely holds 15 entries of interest.
 */
export const MERGED_PRS_FIELDS = `
        nodes {
          ... on PullRequest {
            title
            url
            mergedAt
            repository { nameWithOwner isPrivate }
          }
        }`;

export const OPENED_ISSUES_FIELDS = `
        nodes {
          ... on Issue {
            title
            url
            createdAt
            repository { nameWithOwner isPrivate }
          }
        }`;

// Structural slice of the search responses — only the fields we read.
// Everything is optional/unknown because the input is an untrusted external API.
type SearchNode = {
  title?: unknown;
  url?: unknown;
  mergedAt?: unknown;
  createdAt?: unknown;
  repository?: { nameWithOwner?: unknown; isPrivate?: unknown };
};

type QueryData = { prs?: { nodes?: unknown }; issues?: { nodes?: unknown } };

/**
 * Redaction happens here, in one place, no matter what the caller fetched:
 * for private repos only the activity type and timestamp leave the server,
 * and only an explicitly public repo shows details.
 */
const shapeNode = (node: unknown, type: ActivityType): LatestActivity | null => {
  if (typeof node !== "object" || node === null) {
    return null;
  }
  const { title, url, mergedAt, createdAt, repository } = node as SearchNode;
  const timestamp = type === "pr-merged" ? mergedAt : createdAt;
  if (typeof timestamp !== "string") {
    return null;
  }
  if (repository?.isPrivate !== false) {
    return { type, private: true, repo: null, message: null, url: null, timestamp };
  }
  if (typeof repository.nameWithOwner !== "string" || typeof url !== "string") {
    return null;
  }
  return {
    type,
    private: false,
    repo: repository.nameWithOwner,
    message: typeof title === "string" ? shapeMessage(title) : null,
    url,
    timestamp,
  };
};

const shapeList = (nodes: unknown, type: ActivityType): LatestActivity[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }
  const shaped: LatestActivity[] = [];
  for (const node of nodes) {
    const activity = shapeNode(node, type);
    if (activity !== null) {
      shaped.push(activity);
    }
  }
  return shaped;
};

/** Merges both search results into one log ordered by when the activity
 * actually happened (merge time / creation time), newest first. */
export const shapeActivityLog = (data: unknown): LatestActivity[] => {
  if (typeof data !== "object" || data === null) {
    return [];
  }
  const { prs, issues } = data as QueryData;
  const log = [...shapeList(prs?.nodes, "pr-merged"), ...shapeList(issues?.nodes, "issue-opened")];
  // ISO-8601 UTC timestamps compare correctly as strings.
  return log.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};
