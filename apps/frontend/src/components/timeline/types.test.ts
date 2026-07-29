import type { TimelineEntry } from "$interfaces/timelineEntry";

import { describe, it, expect } from "bun:test";

import {
  ORIGIN_YEAR,
  ORIGIN_MONTH,
  TOTAL_MONTHS,
  PX_PER_MONTH,
  GRAPH_TOP_PADDING_PX,
} from "./constants";
import {
  toAbsoluteMonth,
  entryStartAbsMonth,
  entryEndAbsMonth,
  monthToRow,
  nodeY,
  formatDate,
} from "./types";

describe("toAbsoluteMonth", () => {
  it("returns 0 for the origin year and month", () => {
    expect(toAbsoluteMonth(ORIGIN_YEAR, ORIGIN_MONTH)).toBe(ORIGIN_MONTH);
  });

  it("returns 12 more for each year", () => {
    const base = toAbsoluteMonth(2000, 1);
    expect(toAbsoluteMonth(2001, 1)).toBe(base + 12);
  });

  it("defaults month to 1 when omitted", () => {
    expect(toAbsoluteMonth(2020)).toBe(toAbsoluteMonth(2020, 1));
  });

  it("handles specific date correctly", () => {
    // 2020 month 6 → (2020 - ORIGIN_YEAR) * 12 + 6
    expect(toAbsoluteMonth(2020, 6)).toBe((2020 - ORIGIN_YEAR) * 12 + 6);
  });
});

describe("entryStartAbsMonth", () => {
  it("uses entry startYear and startMonth", () => {
    const entry = {
      startYear: 2020,
      startMonth: 6,
    } as TimelineEntry;
    expect(entryStartAbsMonth(entry)).toBe(toAbsoluteMonth(2020, 6));
  });

  it("defaults to ORIGIN when startYear is undefined", () => {
    const entry = {} as TimelineEntry;
    expect(entryStartAbsMonth(entry)).toBe(toAbsoluteMonth(ORIGIN_YEAR, ORIGIN_MONTH));
  });

  it("defaults startMonth to ORIGIN_MONTH when absent", () => {
    const entry = { startYear: 2020 } as TimelineEntry;
    expect(entryStartAbsMonth(entry)).toBe(toAbsoluteMonth(2020, ORIGIN_MONTH));
  });
});

describe("entryEndAbsMonth", () => {
  it("uses endYear and endMonth for completed entries", () => {
    const entry = {
      startYear: 2020,
      endYear: 2021,
      endMonth: 6,
    } as TimelineEntry;
    expect(entryEndAbsMonth(entry)).toBe(toAbsoluteMonth(2021, 6));
  });

  it("returns current date for ongoing entries (endYear === null)", () => {
    const entry = {
      startYear: 2020,
      endYear: null,
    } as TimelineEntry;
    const now = new Date();
    expect(entryEndAbsMonth(entry)).toBe(
      toAbsoluteMonth(now.getUTCFullYear(), now.getUTCMonth() + 1),
    );
  });

  it("falls back to start date when endYear is undefined", () => {
    const entry = {
      startYear: 2020,
      startMonth: 3,
    } as TimelineEntry;
    expect(entryEndAbsMonth(entry)).toBe(toAbsoluteMonth(2020, 3));
  });

  it("defaults endMonth to 12 when absent", () => {
    const entry = {
      startYear: 2020,
      endYear: 2021,
    } as TimelineEntry;
    expect(entryEndAbsMonth(entry)).toBe(toAbsoluteMonth(2021, 12));
  });
});

describe("monthToRow", () => {
  it("converts absolute month to row (reverse chronological)", () => {
    expect(monthToRow(1)).toBe(TOTAL_MONTHS);
    expect(monthToRow(TOTAL_MONTHS)).toBe(1);
  });

  it("higher months → lower rows (more recent = top)", () => {
    expect(monthToRow(100)).toBeLessThan(monthToRow(50));
  });
});

describe("nodeY", () => {
  it("returns y position for row 1", () => {
    expect(nodeY(1)).toBe(PX_PER_MONTH * 0.5 + GRAPH_TOP_PADDING_PX);
  });

  it("increases by pxPerMonth per row", () => {
    const y1 = nodeY(1);
    const y2 = nodeY(2);
    expect(y2 - y1).toBeCloseTo(PX_PER_MONTH);
  });

  it("accepts custom pxPerMonth", () => {
    const px = 10;
    expect(nodeY(1, px)).toBe(px * 0.5 + GRAPH_TOP_PADDING_PX);
    expect(nodeY(2, px) - nodeY(1, px)).toBeCloseTo(px);
  });
});

describe("formatDate", () => {
  it("returns empty string when showDates is false", () => {
    const entry = { showDates: false, startYear: 2020 } as TimelineEntry;
    expect(formatDate(entry)).toBe("");
  });

  it("returns empty string when startYear is null", () => {
    const entry = { showDates: true } as TimelineEntry;
    expect(formatDate(entry)).toBe("");
  });

  it("returns year only when no months", () => {
    const entry = { showDates: true, startYear: 2020 } as TimelineEntry;
    expect(formatDate(entry)).toBe("2020");
  });

  it("returns year/month format", () => {
    const entry = {
      showDates: true,
      startYear: 2020,
      startMonth: 3,
    } as TimelineEntry;
    expect(formatDate(entry)).toBe("2020/03");
  });

  it("returns range for completed entries", () => {
    const entry = {
      showDates: true,
      startYear: 2020,
      startMonth: 1,
      endYear: 2021,
      endMonth: 6,
    } as TimelineEntry;
    expect(formatDate(entry)).toBe("2020/01 — 2021/06");
  });

  it("returns 'Present' for ongoing entries", () => {
    const entry = {
      showDates: true,
      startYear: 2020,
      startMonth: 1,
      endYear: null,
    } as TimelineEntry;
    expect(formatDate(entry)).toBe("2020/01 — Present");
  });

  it("returns single date when start equals end", () => {
    const entry = {
      showDates: true,
      startYear: 2020,
      startMonth: 6,
      endYear: 2020,
      endMonth: 6,
    } as TimelineEntry;
    expect(formatDate(entry)).toBe("2020/06");
  });
});
