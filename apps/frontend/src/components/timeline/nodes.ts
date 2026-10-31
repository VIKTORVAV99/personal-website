import type { TimelineEntry } from "#interfaces/timelineEntry.ts";

import { MIN_SPAN, COLOR_LIFE } from "./constants";
import {
  monthToRow,
  entryStartAbsMonth,
  entryEndAbsMonth,
  type CommitNode,
  type Branch,
} from "./types";

export const buildLifeNodes = (entries: TimelineEntry[]): CommitNode[] => {
  const nodes: CommitNode[] = [];
  for (const entry of entries) {
    if (entry.type === "life") {
      const start = entryStartAbsMonth(entry);
      const row = monthToRow(start);
      const gridRowEnd = row + MIN_SPAN;
      nodes.push({
        lane: 0,
        branchId: "__life",
        row,
        gridRow: row,
        gridRowEnd,
        color: COLOR_LIFE,
        entry,
        side: "right",
      });
    }
  }
  return nodes;
};

export const buildBranchNodes = (branches: Branch[]): CommitNode[] => {
  const nodes: CommitNode[] = [];
  for (const branch of branches) {
    for (let i = 0; i < branch.entries.length; i++) {
      const entry = branch.entries[i];
      const sectionStartRow = i === 0 ? branch.forkRow : monthToRow(entryStartAbsMonth(entry));
      const sectionEndRow =
        i === branch.entries.length - 1 ? branch.endRow : monthToRow(entryEndAbsMonth(entry));
      const row = (sectionStartRow + sectionEndRow) / 2;
      const gridRow = Math.round(row);
      let gridRowEnd = monthToRow(entryStartAbsMonth(entry)) + 1;
      if (gridRowEnd - gridRow < MIN_SPAN) gridRowEnd = gridRow + MIN_SPAN;
      nodes.push({
        lane: branch.lane,
        branchId: branch.id,
        row,
        gridRow,
        gridRowEnd,
        color: branch.color,
        entry,
        side: branch.side,
      });
    }
  }
  return nodes;
};
