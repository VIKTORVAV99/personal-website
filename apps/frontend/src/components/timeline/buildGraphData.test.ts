import type { TimelineEntry } from "$interfaces/timelineEntry";

import { timelineEntries } from "$data/metadata";
import { describe, it, expect } from "bun:test";

import { buildGraphData } from "./buildGraphData";
import { PX_PER_MONTH } from "./constants";

/** Strip the non-serializable `laneX` function for snapshot comparison. */
const snapshottable = (data: ReturnType<typeof buildGraphData>) => {
  const { laneX: _laneX, ...rest } = data;
  return rest;
};

describe("buildGraphData snapshot", () => {
  it("matches desktop snapshot", () => {
    // Time is pinned in src/tests/setup.ts (preloaded before any module),
    // so date-derived constants and this snapshot are stable across months.
    const result = buildGraphData(timelineEntries, PX_PER_MONTH);
    expect(snapshottable(result)).toMatchSnapshot();
  });
});

describe("buildGraphData — life entries", () => {
  it("excludes life entries from branches", () => {
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
        startMonth: 1,
        endYear: 2021,
        endMonth: 12,
        showDates: true,
      },
    ];
    const result = buildGraphData(entries, PX_PER_MONTH);
    expect(result.branches.every((b) => b.type !== "life")).toBe(true);
    // But life entries still produce nodes
    expect(result.nodes.some((n) => n.entry.type === "life")).toBe(true);
  });
});

describe("buildGraphData — grouping", () => {
  it("puts same-group entries into a single branch", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Role A",
        organization: "Corp",
        type: "work",
        startYear: 2020,
        startMonth: 1,
        endYear: 2021,
        endMonth: 6,
        showDates: true,
        group: "corp",
      },
      {
        title: "Role B",
        organization: "Corp",
        type: "work",
        startYear: 2021,
        startMonth: 7,
        endYear: null,
        showDates: true,
        group: "corp",
      },
    ];
    const result = buildGraphData(entries, PX_PER_MONTH);
    expect(result.branches).toHaveLength(1);
    expect(result.branches[0].entries).toHaveLength(2);
  });

  it("puts ungrouped entries into separate branches", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Job A",
        organization: "A",
        type: "work",
        startYear: 2020,
        startMonth: 1,
        endYear: 2020,
        endMonth: 12,
        showDates: true,
      },
      {
        title: "Job B",
        organization: "B",
        type: "work",
        startYear: 2021,
        startMonth: 1,
        endYear: 2021,
        endMonth: 12,
        showDates: true,
      },
    ];
    const result = buildGraphData(entries, PX_PER_MONTH);
    expect(result.branches).toHaveLength(2);
    expect(result.branches[0].entries).toHaveLength(1);
    expect(result.branches[1].entries).toHaveLength(1);
  });
});

describe("buildGraphData — lane assignment", () => {
  it("reuses lanes for non-overlapping same-side branches", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Job A",
        organization: "A",
        type: "work",
        startYear: 2018,
        startMonth: 1,
        endYear: 2019,
        endMonth: 12,
        showDates: true,
      },
      {
        title: "Job B",
        organization: "B",
        type: "work",
        startYear: 2021,
        startMonth: 1,
        endYear: 2022,
        endMonth: 12,
        showDates: true,
      },
    ];
    const result = buildGraphData(entries, PX_PER_MONTH);
    // Both are work → right side, non-overlapping → same lane
    expect(result.branches[0].lane).toBe(result.branches[1].lane);
  });
});

describe("buildGraphData — laneX", () => {
  it("laneX(0) returns the center x", () => {
    const result = buildGraphData(timelineEntries, PX_PER_MONTH);
    const center = result.laneX(0);
    // Branches at negative and positive lanes should be symmetric about center
    for (const branch of result.branches) {
      const bx = result.laneX(branch.lane);
      const mirrorLane = -branch.lane;
      const mirrorX = result.laneX(mirrorLane);
      // center - bx should equal mirrorX - center
      expect(center - bx).toBeCloseTo(mirrorX - center);
    }
  });
});
