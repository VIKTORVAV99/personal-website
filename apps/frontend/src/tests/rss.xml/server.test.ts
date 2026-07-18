import { describe, it, expect } from "bun:test";

import { _buildRssXml, _channel } from "../../routes/rss.xml/+server";

const pubDate = "Fri, 20 Mar 2026 00:00:00 GMT";

const testItems = [
  {
    title: "Hello & <World>",
    link: "https://viktor.andersson.tech/blog/hello_world",
    description: 'A "quoted" post',
    pubDate,
  },
];

describe("rss.xml", () => {
  it("should produce valid XML", () => {
    const xml = _buildRssXml(testItems, pubDate);
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
  });

  it("should include channel metadata + self-referencing atom:link", () => {
    const xml = _buildRssXml(testItems, pubDate);
    expect(xml).toContain(`<link>${_channel.link}</link>`);
    expect(xml).toContain(`<atom:link href="${_channel.feedURL}" rel="self"`);
    expect(xml).toContain(`<lastBuildDate>${pubDate}</lastBuildDate>`);
  });

  it("should include item link + permalink guid", () => {
    const xml = _buildRssXml(testItems, pubDate);
    expect(xml).toContain("<link>https://viktor.andersson.tech/blog/hello_world</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://viktor.andersson.tech/blog/hello_world</guid>',
    );
  });

  it("should escape XML special characters in free-text fields", () => {
    const xml = _buildRssXml(testItems, pubDate);
    expect(xml).toContain("<title>Hello &amp; &lt;World&gt;</title>");
    expect(xml).toContain("<description>A &quot;quoted&quot; post</description>");
    // The raw, unescaped form must not leak through and break the document.
    expect(xml).not.toContain("<World>");
  });

  it("should match snapshot", () => {
    const xml = _buildRssXml(testItems, pubDate);
    expect(xml).toMatchSnapshot();
  });
});
