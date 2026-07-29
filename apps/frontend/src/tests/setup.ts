import { setSystemTime } from "bun:test";

// Freeze time before any module loads so date-derived constants (CURRENT_YEAR
// and CURRENT_MONTH in $lib/helpers/currentDate, computed at import time) and
// their snapshots stay stable as real time moves on.
// Bump this date together with any affected snapshots.
setSystemTime(new Date("2026-04-01T00:00:00Z"));
