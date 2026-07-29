import { describe, it, expect } from "bun:test";

import { _buildSitemapXml, _staticPages } from "../../routes/sitemap.xml/+server";

const buildDate = "2026-03-20";

// Only pages that already carry a lastmod get the fixed date — forcing one on would mask
// the lastmod-less entries the sitemap deliberately emits.
const testPages = [
  ..._staticPages.map((p) => Object.assign({}, p, p.lastmod ? { lastmod: buildDate } : {})),
  { path: "/blog/hello-world", priority: "0.7", changefreq: "monthly", lastmod: buildDate },
];

describe("sitemap.xml", () => {
  it("should produce valid XML", () => {
    const xml = _buildSitemapXml(testPages);
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it("should include all static pages", () => {
    const xml = _buildSitemapXml(testPages);
    expect(xml).toContain("<loc>https://viktor.andersson.tech</loc>");
    expect(xml).toContain("<loc>https://viktor.andersson.tech/blog</loc>");
    expect(xml).toContain("<loc>https://viktor.andersson.tech/about</loc>");
    expect(xml).toContain("<loc>https://viktor.andersson.tech/history</loc>");
  });

  it("should include blog posts", () => {
    const xml = _buildSitemapXml(testPages);
    expect(xml).toContain("<loc>https://viktor.andersson.tech/blog/hello-world</loc>");
  });

  it("should leave /activity without a lastmod", () => {
    const activity = _staticPages.find((p) => p.path === "/activity");
    expect(activity).toBeDefined();
    expect(activity?.lastmod).toBeUndefined();
  });

  it("should omit the lastmod element for pages without one", () => {
    const xml = _buildSitemapXml([{ path: "/activity", priority: "0.7", changefreq: "daily" }]);
    expect(xml).toContain("<loc>https://viktor.andersson.tech/activity</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  it("should include domain", () => {
    const xml = _buildSitemapXml(testPages);
    expect(xml).toContain("https://viktor.andersson.tech");
  });

  it("should match snapshot", () => {
    const xml = _buildSitemapXml(testPages);
    // Replace date patterns with a placeholder
    const normalized = xml.replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD");
    expect(normalized).toMatchSnapshot();
  });
});
