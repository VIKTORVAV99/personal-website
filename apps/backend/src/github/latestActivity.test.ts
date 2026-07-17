import { describe, expect, it } from "bun:test";
import { shapeActivityLog } from "./latestActivity";

const prNode = (overrides: Record<string, unknown> = {}) => ({
  title: "bump all deps",
  url: "https://github.com/VIKTORVAV99/personal-website/pull/586",
  mergedAt: "2026-07-16T21:00:26Z",
  repository: { nameWithOwner: "VIKTORVAV99/personal-website", isPrivate: false },
  ...overrides,
});

const issueNode = (overrides: Record<string, unknown> = {}) => ({
  title: "Sensor state stops updating",
  url: "https://github.com/home-assistant/core/issues/12345",
  createdAt: "2026-07-15T09:30:00Z",
  repository: { nameWithOwner: "home-assistant/core", isPrivate: false },
  ...overrides,
});

const data = (prs: unknown[], issues: unknown[] = []) => ({
  prs: { nodes: prs },
  issues: { nodes: issues },
});

describe("shapeActivityLog", () => {
  it("shapes a public merged PR", () => {
    expect(shapeActivityLog(data([prNode()]))).toEqual([
      {
        type: "pr-merged",
        private: false,
        repo: "VIKTORVAV99/personal-website",
        message: "bump all deps",
        url: "https://github.com/VIKTORVAV99/personal-website/pull/586",
        timestamp: "2026-07-16T21:00:26Z",
      },
    ]);
  });

  it("shapes a public opened issue with its creation time", () => {
    expect(shapeActivityLog(data([], [issueNode()]))).toEqual([
      {
        type: "issue-opened",
        private: false,
        repo: "home-assistant/core",
        message: "Sensor state stops updating",
        url: "https://github.com/home-assistant/core/issues/12345",
        timestamp: "2026-07-15T09:30:00Z",
      },
    ]);
  });

  it("interleaves PRs and issues by timestamp, newest first", () => {
    const log = shapeActivityLog(
      data(
        [
          prNode({ mergedAt: "2026-07-16T00:00:00Z", title: "newest pr" }),
          prNode({ mergedAt: "2026-07-10T00:00:00Z", title: "oldest pr" }),
        ],
        [issueNode({ createdAt: "2026-07-12T00:00:00Z", title: "middle issue" })],
      ),
    );
    expect(log.map((entry) => [entry.type, entry.message])).toEqual([
      ["pr-merged", "newest pr"],
      ["issue-opened", "middle issue"],
      ["pr-merged", "oldest pr"],
    ]);
  });

  it("redacts entries unless the repo is explicitly public", () => {
    const log = shapeActivityLog(
      data(
        [prNode({ repository: { nameWithOwner: "x/y", isPrivate: true } })],
        [issueNode({ repository: undefined })],
      ),
    );
    expect(log).toEqual([
      {
        type: "pr-merged",
        private: true,
        repo: null,
        message: null,
        url: null,
        timestamp: "2026-07-16T21:00:26Z",
      },
      {
        type: "issue-opened",
        private: true,
        repo: null,
        message: null,
        url: null,
        timestamp: "2026-07-15T09:30:00Z",
      },
    ]);
  });

  it("uses the right timestamp field per type", () => {
    // A PR node without mergedAt or an issue without createdAt is unusable.
    expect(
      shapeActivityLog(data([prNode({ mergedAt: undefined, createdAt: "2026-07-01T00:00:00Z" })])),
    ).toEqual([]);
    expect(
      shapeActivityLog(
        data([], [issueNode({ createdAt: undefined, mergedAt: "2026-07-01T00:00:00Z" })]),
      ),
    ).toEqual([]);
  });

  it("keeps only the first line of a title and truncates at 72 characters", () => {
    const log = shapeActivityLog(
      data([prNode({ title: "subject line\n\nbody" })], [issueNode({ title: "x".repeat(100) })]),
    );
    expect(log.map((entry) => entry.message)).toContain("subject line");
    expect(log.map((entry) => entry.message)).toContain(`${"x".repeat(71)}…`);
  });

  it("tolerates a missing title on a public entry", () => {
    const log = shapeActivityLog(data([prNode({ title: undefined })]));
    expect(log).toHaveLength(1);
    expect(log[0].message).toBeNull();
  });

  it("skips malformed nodes", () => {
    const log = shapeActivityLog(
      data(
        [null, "not a node", {}, prNode({ url: undefined }), prNode()],
        [issueNode({ createdAt: 9 })],
      ),
    );
    expect(log).toHaveLength(1);
  });

  it("returns an empty log for unusable responses", () => {
    expect(shapeActivityLog(null)).toEqual([]);
    expect(shapeActivityLog({})).toEqual([]);
    expect(shapeActivityLog({ prs: { nodes: "nope" }, issues: {} })).toEqual([]);
  });
});
