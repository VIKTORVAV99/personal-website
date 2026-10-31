import { describe, it, expect } from "bun:test";

import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import type { CommitNode } from "./types";

import { PX_PER_MONTH } from "./constants";
import { resolveDesktopOverlap } from "./overlap";

const makeNode = (overrides: Partial<CommitNode> = {}): CommitNode => ({
  lane: 1,
  branchId: "test",
  row: 10,
  gridRow: 10,
  gridRowEnd: 13,
  color: "#3b82f6",
  entry: {
    title: "Test",
    organization: "Corp",
    type: "work",
    startYear: 2020,
    showDates: true,
  } as TimelineEntry,
  side: "right",
  ...overrides,
});

describe("resolveDesktopOverlap", () => {
  it("shifts overlapping same-side nodes down", () => {
    const nodes = [
      makeNode({ gridRow: 10, gridRowEnd: 20, side: "right" }),
      makeNode({ gridRow: 15, gridRowEnd: 25, side: "right" }),
    ];
    resolveDesktopOverlap(nodes, PX_PER_MONTH, 100);
    // Second node should be shifted so it doesn't overlap
    expect(nodes[1].gridRow).toBeGreaterThanOrEqual(nodes[0].gridRowEnd);
  });

  it("does not shift nodes on opposite sides", () => {
    const nodes = [
      makeNode({ gridRow: 10, gridRowEnd: 20, side: "left" }),
      makeNode({ gridRow: 10, gridRowEnd: 20, side: "right" }),
    ];
    resolveDesktopOverlap(nodes, PX_PER_MONTH, 100);
    // Nodes on different sides should not affect each other
    expect(nodes[0].gridRow).toBe(10);
    expect(nodes[1].gridRow).toBe(10);
  });

  it("expands small cards to a minimal fallback before measurement", () => {
    const entry: TimelineEntry = {
      title: "A reasonably long title for a card",
      organization: "Corp",
      type: "work",
      startYear: 2020,
      showDates: true,
      description: "A description",
      location: "City",
    };
    const nodes = [makeNode({ gridRow: 10, gridRowEnd: 11, side: "right", entry })];
    resolveDesktopOverlap(nodes, PX_PER_MONTH, 100);
    expect(nodes[0].gridRowEnd - nodes[0].gridRow).toBe(2);
  });

  it("shrinks large chronological gridRowEnd to match measured height", () => {
    const entry: TimelineEntry = {
      title: "Long-duration entry",
      organization: "University",
      type: "education",
      startYear: 2020,
      showDates: true,
    };
    const nodes = [makeNode({ gridRow: 10, gridRowEnd: 28, side: "right", entry })];
    const measuredHeights = new Map<TimelineEntry, number>([[entry, PX_PER_MONTH * 5.5]]);

    resolveDesktopOverlap(nodes, PX_PER_MONTH, 100, measuredHeights);

    expect(nodes[0].gridRowEnd).toBe(17);
  });

  it("uses measured card height when provided", () => {
    const entry: TimelineEntry = {
      title: "Measured card",
      organization: "Corp",
      type: "work",
      startYear: 2020,
      showDates: true,
    };
    const nodes = [makeNode({ gridRow: 10, gridRowEnd: 11, side: "right", entry })];
    const measuredHeights = new Map<TimelineEntry, number>([[entry, PX_PER_MONTH * 7.2]]);

    resolveDesktopOverlap(nodes, PX_PER_MONTH, 100, measuredHeights);

    expect(nodes[0].gridRowEnd - nodes[0].gridRow).toBe(9);
  });
});
