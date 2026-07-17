const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * DAY],
  ["month", 30 * DAY],
  ["week", 7 * DAY],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const relativeTime = (date: string, now: number = Date.now()): string => {
  const elapsed = new Date(date).getTime() - now;
  for (const [unit, milliseconds] of UNITS) {
    if (Math.abs(elapsed) >= milliseconds) {
      return formatter.format(Math.trunc(elapsed / milliseconds), unit);
    }
  }
  return "just now";
};
