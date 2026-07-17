import { describe, expect, it } from "bun:test";
import { shapeContributionCounts } from "./contributions";

const collection = (overrides: Record<string, unknown> = {}) => ({
  viewer: {
    contributionsCollection: {
      commitContributionsByRepository: [],
      issueContributionsByRepository: [],
      pullRequestContributionsByRepository: [],
      pullRequestReviewContributionsByRepository: [],
      ...overrides,
    },
  },
});

const commitGroup = (isPrivate: boolean, dailyCommitCounts: number[]) => ({
  repository: { isPrivate },
  contributions: { nodes: dailyCommitCounts.map((commitCount) => ({ commitCount })) },
});

const itemGroup = (isPrivate: boolean, totalCount: number) => ({
  repository: { isPrivate },
  contributions: { totalCount },
});

describe("shapeContributionCounts", () => {
  it("splits commit contributions between public and private", () => {
    const data = collection({
      commitContributionsByRepository: [
        commitGroup(true, [3, 5]),
        commitGroup(false, [13]),
        commitGroup(true, [1]),
      ],
    });
    expect(shapeContributionCounts(data)).toEqual({ publicCount: 13, privateCount: 9 });
  });

  it("counts issues, PRs, and reviews by item on both sides", () => {
    const data = collection({
      issueContributionsByRepository: [itemGroup(true, 2), itemGroup(false, 4)],
      pullRequestContributionsByRepository: [itemGroup(true, 3), itemGroup(false, 1)],
      pullRequestReviewContributionsByRepository: [itemGroup(true, 1)],
    });
    expect(shapeContributionCounts(data)).toEqual({ publicCount: 5, privateCount: 6 });
  });

  it("returns zeros for an empty window", () => {
    expect(shapeContributionCounts(collection())).toEqual({ publicCount: 0, privateCount: 0 });
  });

  it("skips groups with missing or malformed shapes", () => {
    const data = collection({
      commitContributionsByRepository: [
        null,
        { repository: {} },
        { repository: { isPrivate: true } },
        { repository: { isPrivate: true }, contributions: { nodes: [{ commitCount: "3" }, null] } },
      ],
      issueContributionsByRepository: undefined,
      pullRequestContributionsByRepository: [
        { repository: { isPrivate: false }, contributions: { totalCount: -2 } },
      ],
    });
    expect(shapeContributionCounts(data)).toEqual({ publicCount: 0, privateCount: 0 });
  });

  it("returns null when the response shape is unusable", () => {
    expect(shapeContributionCounts(null)).toBeNull();
    expect(shapeContributionCounts({})).toBeNull();
    expect(shapeContributionCounts({ viewer: {} })).toBeNull();
  });
});
