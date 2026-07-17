import { describe, expect, it } from "bun:test";

import { relativeTime } from "./relativeTime";

const NOW = new Date("2026-07-16T12:00:00Z").getTime();

describe("relativeTime", () => {
  it("formats minutes", () => {
    expect(relativeTime("2026-07-16T11:57:00Z", NOW)).toBe("3 minutes ago");
  });

  it("formats hours", () => {
    expect(relativeTime("2026-07-16T07:00:00Z", NOW)).toBe("5 hours ago");
  });

  it("formats days with natural phrasing", () => {
    expect(relativeTime("2026-07-15T11:00:00Z", NOW)).toBe("yesterday");
  });

  it("formats weeks", () => {
    expect(relativeTime("2026-07-01T12:00:00Z", NOW)).toBe("2 weeks ago");
  });

  it("formats months", () => {
    expect(relativeTime("2026-05-10T12:00:00Z", NOW)).toBe("2 months ago");
  });

  it("formats years", () => {
    expect(relativeTime("2024-07-16T12:00:00Z", NOW)).toBe("2 years ago");
  });

  it("falls back to 'just now' under a minute", () => {
    expect(relativeTime("2026-07-16T11:59:30Z", NOW)).toBe("just now");
  });
});
