import { describe, it, expect } from "bun:test";

import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import { BRANCH_COLORS } from "./constants";
import { assignLanes, buildLaneLayout } from "./lanes";

const workEntry = (overrides: Partial<TimelineEntry> = {}): TimelineEntry => ({
  title: "Job",
  organization: "Corp",
  type: "work",
  startYear: 2020,
  startMonth: 1,
  endYear: 2021,
  endMonth: 12,
  showDates: true,
  ...overrides,
});

const eduEntry = (overrides: Partial<TimelineEntry> = {}): TimelineEntry => ({
  title: "School",
  organization: "Uni",
  type: "education",
  startYear: 2020,
  startMonth: 1,
  endYear: 2021,
  endMonth: 12,
  showDates: true,
  ...overrides,
});

describe("assignLanes", () => {
  it("excludes life entries from branches", () => {
    const entries: TimelineEntry[] = [
      {
        title: "Born",
        organization: "Somewhere",
        type: "life",
        startYear: 1999,
        showDates: false,
      },
      workEntry(),
    ];
    const { branches } = assignLanes(entries);
    expect(branches.every((b) => b.type !== "life")).toBe(true);
    expect(branches).toHaveLength(1);
  });

  it("groups entries with same group key into one branch", () => {
    const entries: TimelineEntry[] = [
      workEntry({
        title: "Role A",
        startYear: 2020,
        endYear: 2021,
        group: "corp",
      }),
      workEntry({
        title: "Role B",
        startYear: 2021,
        endYear: null,
        group: "corp",
      }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches).toHaveLength(1);
    expect(branches[0].entries).toHaveLength(2);
  });

  it("puts ungrouped entries into separate branches", () => {
    const entries: TimelineEntry[] = [
      workEntry({ title: "Job A", startYear: 2020, endYear: 2020 }),
      workEntry({ title: "Job B", startYear: 2021, endYear: 2021 }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches).toHaveLength(2);
  });

  it("reuses lanes for non-overlapping same-side branches", () => {
    const entries: TimelineEntry[] = [
      workEntry({ startYear: 2018, endYear: 2019 }),
      workEntry({ startYear: 2021, endYear: 2022 }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches[0].lane).toBe(branches[1].lane);
  });

  it("reuses lanes when one branch ends the same month another starts", () => {
    const entries: TimelineEntry[] = [
      workEntry({ startYear: 2018, startMonth: 1, endYear: 2020, endMonth: 6 }),
      workEntry({ startYear: 2020, startMonth: 6, endYear: 2022, endMonth: 12 }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches[0].lane).toBe(branches[1].lane);
  });

  it("reuses lanes when overlap is within curve transition length", () => {
    // IKEA 2022 ends Jan 2023, Electricity Maps starts Dec 2022 → 2-month overlap < FORK_CURVE_MONTHS (3)
    const entries: TimelineEntry[] = [
      workEntry({ startYear: 2022, startMonth: 6, endYear: 2023, endMonth: 1 }),
      workEntry({ startYear: 2022, startMonth: 12, endYear: 2025, endMonth: 12 }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches[0].lane).toBe(branches[1].lane);
  });

  it("assigns different lanes when one branch is contained within another", () => {
    // IKEA 2019 (Jun-Aug) is fully within Haganässkolan (Aug 2017 – Jun 2020)
    // Even though the overlap (2 months) < FORK_CURVE_MONTHS, containment forces separate lanes
    const entries: TimelineEntry[] = [
      workEntry({ startYear: 2017, startMonth: 8, endYear: 2020, endMonth: 6 }),
      workEntry({ startYear: 2019, startMonth: 6, endYear: 2019, endMonth: 8 }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches[0].lane).not.toBe(branches[1].lane);
  });

  it("assigns different lanes for overlapping same-side branches", () => {
    const entries: TimelineEntry[] = [
      workEntry({
        startYear: 2020,
        startMonth: 1,
        endYear: 2022,
        endMonth: 12,
      }),
      workEntry({
        startYear: 2021,
        startMonth: 1,
        endYear: 2023,
        endMonth: 12,
      }),
    ];
    const { branches } = assignLanes(entries);
    expect(branches[0].lane).not.toBe(branches[1].lane);
  });

  it("puts education on left, work on right", () => {
    const entries: TimelineEntry[] = [
      eduEntry({ startYear: 2020, endYear: 2021 }),
      workEntry({ startYear: 2020, endYear: 2021 }),
    ];
    const { branches } = assignLanes(entries);
    const edu = branches.find((b) => b.type === "education")!;
    const work = branches.find((b) => b.type === "work")!;
    expect(edu.side).toBe("left");
    expect(edu.lane).toBeLessThan(0);
    expect(work.side).toBe("right");
    expect(work.lane).toBeGreaterThan(0);
  });

  it("cycles through branch colors", () => {
    const entries: TimelineEntry[] = Array.from({ length: 12 }, (_, i) =>
      workEntry({
        title: `Job ${i}`,
        startYear: 2010 + i,
        endYear: 2010 + i,
      }),
    );
    const { branches } = assignLanes(entries);
    // 11th branch (index 10) wraps to BRANCH_COLORS[10 % length]
    expect(branches[10].color).toBe(BRANCH_COLORS[10 % BRANCH_COLORS.length]);
  });
});

describe("buildLaneLayout", () => {
  it("laneX(0) is the center", () => {
    const { laneX, graphWidth } = buildLaneLayout(2, 2, 40);
    expect(laneX(0)).toBe(graphWidth / 2);
  });

  it("laneX is symmetric around center", () => {
    const { laneX } = buildLaneLayout(2, 2, 40);
    const center = laneX(0);
    expect(center - laneX(-1)).toBe(laneX(1) - center);
    expect(center - laneX(-2)).toBe(laneX(2) - center);
  });

  it("uses spacing parameter correctly", () => {
    const { laneX } = buildLaneLayout(2, 2, 40);
    expect(laneX(1) - laneX(0)).toBe(40);
    expect(laneX(0) - laneX(-1)).toBe(40);
  });

  it("handles asymmetric lane counts (uses max)", () => {
    const { laneX } = buildLaneLayout(1, 3, 40);
    // maxLaneCount = 3, so graphWidth = (2*3+2)*40 = 320
    const center = laneX(0);
    expect(center - laneX(-1)).toBe(laneX(1) - center);
  });
});
