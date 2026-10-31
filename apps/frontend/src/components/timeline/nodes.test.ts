import { describe, it, expect } from "bun:test";

import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import type { Branch } from "./types";

import { COLOR_LIFE, MIN_SPAN } from "./constants";
import { buildLifeNodes, buildBranchNodes } from "./nodes";

describe("buildLifeNodes", () => {
  it("creates nodes only for life entries", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Born",
        organization: "Somewhere",
        type: "life",
        startYear: 1999,
        startMonth: 2,
        showDates: false,
      },
      {
        title: "Job",
        organization: "Corp",
        type: "work",
        startYear: 2020,
        showDates: true,
      },
    ];
    const nodes = buildLifeNodes(entries);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].entry.type).toBe("life");
  });

  it("assigns lane 0 and right side", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Born",
        organization: "X",
        type: "life",
        startYear: 1999,
        showDates: false,
      },
    ];
    const nodes = buildLifeNodes(entries);
    expect(nodes[0].lane).toBe(0);
    expect(nodes[0].side).toBe("right");
  });

  it("uses COLOR_LIFE and branchId __life", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Born",
        organization: "X",
        type: "life",
        startYear: 1999,
        showDates: false,
      },
    ];
    const nodes = buildLifeNodes(entries);
    expect(nodes[0].color).toBe(COLOR_LIFE);
    expect(nodes[0].branchId).toBe("__life");
  });

  it("sets gridRowEnd = row + MIN_SPAN", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Born",
        organization: "X",
        type: "life",
        startYear: 1999,
        showDates: false,
      },
    ];
    const nodes = buildLifeNodes(entries);
    expect(nodes[0].gridRowEnd).toBe(nodes[0].row + MIN_SPAN);
  });

  it("returns empty array when no life entries", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Job",
        organization: "Corp",
        type: "work",
        startYear: 2020,
        showDates: true,
      },
    ];
    expect(buildLifeNodes(entries)).toHaveLength(0);
  });
});

describe("buildBranchNodes", () => {
  it("creates one node per branch entry", () => {
    const branches: Branch[] = [
      {
        id: "test",
        type: "work",
        side: "right",
        lane: 1,
        entries: [
          {
            title: "Job A",
            organization: "Corp",
            type: "work",
            startYear: 2020,
            startMonth: 1,
            endYear: 2021,
            endMonth: 12,
            showDates: true,
          },
          {
            title: "Job B",
            organization: "Corp",
            type: "work",
            startYear: 2022,
            startMonth: 1,
            endYear: null,
            showDates: true,
          },
        ],
        forkRow: 10,
        endRow: 5,
        curveOffset: 3,
        isOngoing: true,
        color: "#3b82f6",
      },
    ];
    const nodes = buildBranchNodes(branches);
    expect(nodes).toHaveLength(2);
  });

  it("inherits lane, branchId, color, and side from branch", () => {
    const branches: Branch[] = [
      {
        id: "my-branch",
        type: "education",
        side: "left",
        lane: -1,
        entries: [
          {
            title: "School",
            organization: "Uni",
            type: "education",
            startYear: 2020,
            startMonth: 1,
            endYear: 2021,
            endMonth: 12,
            showDates: true,
          },
        ],
        forkRow: 10,
        endRow: 5,
        curveOffset: 3,
        isOngoing: false,
        color: "#22c55e",
      },
    ];
    const nodes = buildBranchNodes(branches);
    expect(nodes[0].lane).toBe(-1);
    expect(nodes[0].branchId).toBe("my-branch");
    expect(nodes[0].color).toBe("#22c55e");
    expect(nodes[0].side).toBe("left");
  });

  it("ensures gridRowEnd - gridRow >= MIN_SPAN", () => {
    const branches: Branch[] = [
      {
        id: "test",
        type: "work",
        side: "right",
        lane: 1,
        entries: [
          {
            title: "Short Job",
            organization: "Corp",
            type: "work",
            startYear: 2020,
            startMonth: 6,
            endYear: 2020,
            endMonth: 6,
            showDates: true,
          },
        ],
        forkRow: 10,
        endRow: 5,
        curveOffset: 3,
        isOngoing: false,
        color: "#3b82f6",
      },
    ];
    const nodes = buildBranchNodes(branches);
    expect(nodes[0].gridRowEnd - nodes[0].gridRow).toBeGreaterThanOrEqual(MIN_SPAN);
  });

  it("returns empty array for empty branches", () => {
    expect(buildBranchNodes([])).toHaveLength(0);
  });
});
