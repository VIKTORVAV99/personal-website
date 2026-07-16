import { setSystemTime } from "bun:test";

// Freeze time before any module loads so date-derived constants (e.g. the
// timeline's CURRENT_YEAR/CURRENT_MONTH, computed at import time) and their
// snapshots stay stable as real time moves on.
// Bump this date together with any affected snapshots.
setSystemTime(new Date("2026-04-01T00:00:00Z"));
