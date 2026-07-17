export const CONTRIBUTION_DAYS = 7;

/**
 * Sums contributions in a window, split into public and private by
 * repository.isPrivate. Requires a classic PAT with the repo scope:
 * fine-grained tokens are bounded to one resource owner, so org-owned private
 * activity is silently absent from their API view. Only aggregate counts
 * leave this module — no repo names, titles, or timestamps.
 *
 * The fields slot into a `viewer { contributionsCollection(from:, to:) { … } }`
 * block — enrichment.ts composes them into the combined activity query.
 */
export const CONTRIBUTIONS_FIELDS = `
        commitContributionsByRepository(maxRepositories: 100) {
          repository { isPrivate }
          contributions(first: 100) { nodes { commitCount } }
        }
        issueContributionsByRepository(maxRepositories: 100) {
          repository { isPrivate }
          contributions { totalCount }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository { isPrivate }
          contributions { totalCount }
        }
        pullRequestReviewContributionsByRepository(maxRepositories: 100) {
          repository { isPrivate }
          contributions { totalCount }
        }`;

export type ContributionCounts = { publicCount: number; privateCount: number };

type ContributionsByRepository = {
  repository?: { isPrivate?: unknown };
  contributions?: { totalCount?: unknown; nodes?: unknown };
};

type QueryData = {
  viewer?: {
    contributionsCollection?: {
      commitContributionsByRepository?: unknown;
      issueContributionsByRepository?: unknown;
      pullRequestContributionsByRepository?: unknown;
      pullRequestReviewContributionsByRepository?: unknown;
    };
  };
};

// Commit contributions arrive as per-day buckets carrying a commitCount each;
// issue/PR/review contributions are one node per item, so totalCount suffices.
const commitCount = (group: ContributionsByRepository): number => {
  const nodes = group.contributions?.nodes;
  if (!Array.isArray(nodes)) {
    return 0;
  }
  let total = 0;
  for (const node of nodes) {
    const count = (node as { commitCount?: unknown } | null)?.commitCount;
    if (typeof count === "number" && count > 0) {
      total += count;
    }
  }
  return total;
};

const itemCount = (group: ContributionsByRepository): number => {
  const count = group.contributions?.totalCount;
  return typeof count === "number" && count > 0 ? count : 0;
};

const addGroups = (
  groups: unknown,
  count: (group: ContributionsByRepository) => number,
  counts: ContributionCounts,
): void => {
  if (!Array.isArray(groups)) {
    return;
  }
  for (const group of groups as (ContributionsByRepository | null)[]) {
    // Repos of unknown shape are skipped rather than guessed at.
    if (group?.repository?.isPrivate === true) {
      counts.privateCount += count(group);
    } else if (group?.repository?.isPrivate === false) {
      counts.publicCount += count(group);
    }
  }
};

export const shapeContributionCounts = (data: unknown): ContributionCounts | null => {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const collection = (data as QueryData).viewer?.contributionsCollection;
  if (typeof collection !== "object" || collection === null) {
    return null;
  }
  const counts: ContributionCounts = { publicCount: 0, privateCount: 0 };
  addGroups(collection.commitContributionsByRepository, commitCount, counts);
  addGroups(collection.issueContributionsByRepository, itemCount, counts);
  addGroups(collection.pullRequestContributionsByRepository, itemCount, counts);
  addGroups(collection.pullRequestReviewContributionsByRepository, itemCount, counts);
  return counts;
};
