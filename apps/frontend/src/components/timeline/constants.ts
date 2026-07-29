import { timelineEntries } from "$data/metadata";
import { CURRENT_YEAR, CURRENT_MONTH } from "$lib/helpers/currentDate";

// Layout constants
const lifeEntry = timelineEntries.find((e) => e.type === "life");
export const ORIGIN_YEAR = lifeEntry?.startYear ?? 1999;
export const ORIGIN_MONTH = lifeEntry?.startMonth ?? 1;
const PX_PER_YEAR = 96;
export const PX_PER_MONTH = PX_PER_YEAR / 12;
export const TOTAL_MONTHS = (CURRENT_YEAR - ORIGIN_YEAR) * 12 + CURRENT_MONTH;
export const MIN_SPAN = 3;
export const GRAPH_TOP_PADDING_PX = 12;
export const FORK_CURVE_MONTHS = 3;

// Graph constants
export const LANE_SPACING = 40;
export const NODE_RADIUS = 7;
export const LINE_WIDTH = 2;
export const COMPACT_LANE_SPACING = NODE_RADIUS * 2; // 14px
export const DOT_MARGIN = 2;
export const LEADER_CHANNEL_GAP = 8;
export const MAX_LEADER_CHANNELS = 5;

// Colors
export const COLOR_LIFE = "var(--color-secondary-400)";

export const BRANCH_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#8b5cf6", // violet
];
