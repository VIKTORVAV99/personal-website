// UTC, read from a single Date instance.
const now = new Date();

export const CURRENT_YEAR = now.getUTCFullYear();
export const CURRENT_MONTH = now.getUTCMonth() + 1;
