import type { TimelineEntry } from "$interfaces/timelineEntry";

import { CURRENT_YEAR, CURRENT_MONTH } from "$lib/helpers/currentDate";

import {
  ORIGIN_YEAR,
  ORIGIN_MONTH,
  TOTAL_MONTHS,
  PX_PER_MONTH,
  GRAPH_TOP_PADDING_PX,
} from "./constants";

export interface Branch {
  id: string;
  type: TimelineEntry["type"];
  side: "left" | "right";
  lane: number;
  entries: TimelineEntry[];
  forkRow: number;
  endRow: number;
  curveOffset: number;
  isOngoing: boolean;
  color: string;
}

export interface CommitNode {
  lane: number;
  branchId: string;
  /** Chronological position — used for SVG dot placement. */
  row: number;
  /** Display position after overlap resolution — used for CSS grid placement. */
  gridRow: number;
  gridRowEnd: number;
  color: string;
  entry: TimelineEntry;
  side: "left" | "right";
}

export type TimelineMode = "desktop" | "compact";

export interface LeaderLine {
  points: Array<{ x: number; y: number }>;
  color: string;
}

export interface GraphData {
  branches: Branch[];
  nodes: CommitNode[];
  graphWidth: number;
  laneX: (lane: number) => number;
  totalGridRows: number;
  mode: TimelineMode;
  leaderLines: LeaderLine[];
}

export const toAbsoluteMonth = (year: number, month: number = 1): number =>
  (year - ORIGIN_YEAR) * 12 + month;

export const entryStartAbsMonth = (entry: TimelineEntry): number =>
  toAbsoluteMonth(entry.startYear ?? ORIGIN_YEAR, entry.startMonth ?? ORIGIN_MONTH);

export const entryEndAbsMonth = (entry: TimelineEntry): number => {
  if (entry.endYear === null) {
    return toAbsoluteMonth(CURRENT_YEAR, CURRENT_MONTH);
  }
  if (entry.endYear === undefined) {
    return toAbsoluteMonth(entry.startYear ?? ORIGIN_YEAR, entry.startMonth ?? ORIGIN_MONTH);
  }
  return toAbsoluteMonth(entry.endYear, entry.endMonth ?? 12);
};

export const monthToRow = (absMonth: number): number => TOTAL_MONTHS - absMonth + 1;

export const nodeY = (row: number, pxPerMonth: number = PX_PER_MONTH): number =>
  (row - 1) * pxPerMonth + pxPerMonth * 0.5 + GRAPH_TOP_PADDING_PX;

export const formatDate = (entry: TimelineEntry): string => {
  if (!entry.showDates || entry.startYear == null) return "";
  const startStr =
    entry.startMonth != null
      ? `${entry.startYear}/${String(entry.startMonth).padStart(2, "0")}`
      : `${entry.startYear}`;
  if (entry.endYear === null) return `${startStr} — Present`;
  if (entry.endYear != null) {
    const endStr =
      entry.endMonth != null
        ? `${entry.endYear}/${String(entry.endMonth).padStart(2, "0")}`
        : `${entry.endYear}`;
    if (startStr !== endStr) return `${startStr} — ${endStr}`;
  }
  return startStr;
};
