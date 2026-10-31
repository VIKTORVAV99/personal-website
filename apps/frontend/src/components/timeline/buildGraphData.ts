import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import type { GraphData, TimelineMode } from "./types";

import { TOTAL_MONTHS, LANE_SPACING, COMPACT_LANE_SPACING } from "./constants";
import { assignLanes, buildLaneLayout } from "./lanes";
import { buildLeaderLines } from "./leaderLines";
import { buildLifeNodes, buildBranchNodes } from "./nodes";
import { resolveDesktopOverlap } from "./overlap";

export const buildGraphData = (
  entries: TimelineEntry[],
  pxPerMonth: number,
  measuredHeightsByEntry?: Map<TimelineEntry, number>,
  mode: TimelineMode = "desktop",
): GraphData => {
  const spacing = mode === "compact" ? COMPACT_LANE_SPACING : LANE_SPACING;
  const { branches, leftLaneCount, rightLaneCount } = assignLanes(entries, mode);

  const { graphWidth, laneX } = buildLaneLayout(leftLaneCount, rightLaneCount, spacing, mode);

  const nodes = [...buildLifeNodes(entries), ...buildBranchNodes(branches)];

  // In compact mode, all cards appear on the right
  if (mode === "compact") {
    for (const node of nodes) {
      node.side = "right";
    }
  }

  const { totalGridRows } = resolveDesktopOverlap(
    nodes,
    pxPerMonth,
    TOTAL_MONTHS,
    measuredHeightsByEntry,
  );

  const leaderLines = buildLeaderLines(nodes, laneX, graphWidth, pxPerMonth, laneX(0));

  return { branches, nodes, graphWidth, laneX, totalGridRows, mode, leaderLines };
};
