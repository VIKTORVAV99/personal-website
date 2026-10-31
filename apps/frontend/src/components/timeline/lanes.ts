import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import {
  BRANCH_COLORS,
  FORK_CURVE_MONTHS,
  MAX_LEADER_CHANNELS,
  LEADER_CHANNEL_GAP,
} from "./constants";
import {
  monthToRow,
  entryStartAbsMonth,
  entryEndAbsMonth,
  type Branch,
  type TimelineMode,
} from "./types";

export interface AssignLanesResult {
  branches: Branch[];
  leftLaneCount: number;
  rightLaneCount: number;
}

export interface LaneLayout {
  graphWidth: number;
  laneX: (lane: number) => number;
}

export const assignLanes = (
  entries: TimelineEntry[],
  mode: TimelineMode = "desktop",
): AssignLanesResult => {
  // Group entries into branches
  const groupMap = new Map<string, TimelineEntry[]>();
  let ungroupedIdx = 0;

  for (const entry of entries) {
    if (entry.type === "life") continue;
    const key = entry.group ?? `__ungrouped_${ungroupedIdx++}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(entry);
  }

  // Sort each group's entries by startYear ascending
  for (const [, groupEntries] of groupMap) {
    groupEntries.sort((a, b) => entryStartAbsMonth(a) - entryStartAbsMonth(b));
  }

  // Assign branches to lanes (reuse lanes when branches don't overlap in time)
  const branches: Branch[] = [];

  // Pre-compute date ranges; sort by span ascending so shorter branches get inner lanes
  const groupsWithStart = [...groupMap.entries()].map(([id, entries]) => ({
    id,
    entries,
    earliestStart: Math.min(...entries.map((e) => entryStartAbsMonth(e))),
    latestEnd: Math.max(...entries.map((e) => entryEndAbsMonth(e))),
  }));
  groupsWithStart.sort((a, b) => {
    const spanA = a.latestEnd - a.earliestStart;
    const spanB = b.latestEnd - b.earliestStart;
    return spanA - spanB || a.earliestStart - b.earliestStart;
  });

  // Track which time ranges occupy each lane
  const laneOccupancy = new Map<number, Array<{ start: number; end: number }>>();
  let nextLeftLane = -1;
  let nextRightLane = 1;

  const findReusableLane = (side: "left" | "right", start: number, end: number): number | null => {
    for (const [lane, ranges] of laneOccupancy) {
      if (side === "left" && lane >= 0) continue;
      if (side === "right" && lane <= 0) continue;
      const overlaps = ranges.some((r) => {
        const overlap = Math.min(end, r.end) - Math.max(start, r.start);
        if (overlap <= 0) return false;
        const contained = (start >= r.start && end <= r.end) || (r.start >= start && r.end <= end);
        return contained || overlap > FORK_CURVE_MONTHS;
      });
      if (!overlaps) return lane;
    }
    return null;
  };

  let branchColorIdx = 0;
  for (const { id, entries: groupEntries, earliestStart, latestEnd } of groupsWithStart) {
    const type = groupEntries[0].type;
    const side: "left" | "right" =
      mode === "compact" ? "left" : type === "education" ? "left" : "right";
    const span = latestEnd - earliestStart;
    const curveOffset = Math.min(FORK_CURVE_MONTHS, Math.floor(span / 2));
    const isOngoing = groupEntries.some((e) => e.endYear === null);

    let lane = findReusableLane(side, earliestStart, latestEnd);
    if (lane === null) {
      lane = side === "left" ? nextLeftLane-- : nextRightLane++;
    }

    if (!laneOccupancy.has(lane)) laneOccupancy.set(lane, []);
    laneOccupancy.get(lane)!.push({ start: earliestStart, end: latestEnd });

    branches.push({
      id,
      type,
      side,
      lane,
      entries: groupEntries,
      forkRow: monthToRow(earliestStart) - curveOffset,
      endRow: isOngoing ? monthToRow(latestEnd) : monthToRow(latestEnd) + curveOffset,
      curveOffset,
      isOngoing,
      color: BRANCH_COLORS[branchColorIdx++ % BRANCH_COLORS.length],
    });
  }

  const leftLaneCount = Math.abs(Math.min(0, ...branches.map((b) => b.lane)));
  const rightLaneCount = Math.max(0, ...branches.map((b) => b.lane));

  return { branches, leftLaneCount, rightLaneCount };
};

export const buildLaneLayout = (
  leftLaneCount: number,
  rightLaneCount: number,
  spacing: number,
  mode: TimelineMode = "desktop",
): LaneLayout => {
  if (mode === "compact") {
    const leaderChannelWidth = MAX_LEADER_CHANNELS * LEADER_CHANNEL_GAP;
    const graphWidth = (leftLaneCount + 2) * spacing + leaderChannelWidth;

    // lane 0 (trunk) sits at the right side of the branch area
    const laneX = (lane: number): number => (leftLaneCount + 1) * spacing + lane * spacing;

    return { graphWidth, laneX };
  }

  const maxLaneCount = Math.max(leftLaneCount, rightLaneCount);
  const graphWidth = (2 * maxLaneCount + 2) * spacing;

  const laneX = (lane: number): number => (maxLaneCount + lane) * spacing + spacing;

  return { graphWidth, laneX };
};
