import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import type { CommitNode } from "./types";

export const resolveDesktopOverlap = (
  nodes: CommitNode[],
  pxPerMonth: number,
  baseTotalRows: number,
  measuredHeightsByEntry?: Map<TimelineEntry, number>,
): { totalGridRows: number } => {
  for (const side of ["left", "right"] as const) {
    const sideNodes = nodes.filter((n) => n.side === side).sort((a, b) => a.gridRow - b.gridRow);
    for (const node of sideNodes) {
      const measuredHeight = measuredHeightsByEntry?.get(node.entry);
      if (measuredHeight != null) {
        const minSpan = Math.max(2, Math.ceil(measuredHeight / pxPerMonth) + 1);
        node.gridRowEnd = node.gridRow + minSpan;
      } else if (node.gridRowEnd - node.gridRow < 2) {
        node.gridRowEnd = node.gridRow + 2;
      }
    }
    let nextRow = -Infinity;
    for (const node of sideNodes) {
      if (node.gridRow < nextRow) {
        const shift = nextRow - node.gridRow;
        node.gridRow += shift;
        node.gridRowEnd += shift;
      }
      nextRow = node.gridRowEnd;
    }
  }

  const totalGridRows = Math.max(baseTotalRows, ...nodes.map((n) => n.gridRowEnd));
  return { totalGridRows };
};
