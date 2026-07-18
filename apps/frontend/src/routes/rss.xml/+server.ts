export const prerender = true;
import { getAllPosts } from "$lib/blog";
import { SITE_URL } from "$lib/config";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export const _channel = {
  title: "Viktor Andersson",
  link: `${SITE_URL}/blog`,
  description: "Thoughts on software engineering, climate tech, and open source.",
  feedURL: `${SITE_URL}/rss.xml`,
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const _buildRssXml = (items: RssItem[], lastBuildDate: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(_channel.title)}</title>
    <link>${_channel.link}</link>
    <description>${escapeXml(_channel.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${_channel.feedURL}" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

export const GET = async () => {
  const posts = getAllPosts();

  const items = posts.map((post) => ({
    title: post.title,
    link: `${SITE_URL}/blog/${post.slug}`,
    description: post.description,
    pubDate: new Date(post.date).toUTCString(),
  }));

  const newest = posts[0];
  const lastBuildDate = new Date(newest?.last_updated || newest?.date || Date.now()).toUTCString();

  return new Response(_buildRssXml(items, lastBuildDate), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
