export const prerender = true;
import type { BlogPostMeta } from "$lib/blog";

import { getAllTagSlugs, getPostsForTag, isTagIndexable } from "$lib/blog";
import { getAllPosts } from "$lib/blog.server";
import { SITE_URL } from "$lib/config";
import { formatDate } from "$lib/helpers/formatDate";
import { SITE_PAGES } from "$lib/pages";
import { PROFILE_DATE_MODIFIED } from "$lib/seo/person";

interface SitemapPage {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

const profileLastmod = PROFILE_DATE_MODIFIED.split("T")[0];

const postLastmod = (post: BlogPostMeta): string => formatDate(post.last_updated || post.date);

// Pages whose content changes faster than the profile date can track. A hand-maintained
// lastmod on those is worse than none at all.
const LASTMOD_EXEMPT = new Set(["/activity"]);

export const _staticPages: SitemapPage[] = SITE_PAGES.map((page) => {
  const entry: SitemapPage = {
    path: page.path,
    priority: page.priority,
    changefreq: page.changefreq,
  };
  if (!LASTMOD_EXEMPT.has(page.path)) entry.lastmod = profileLastmod;
  return entry;
});

export const _tagSitemapPages = (posts: BlogPostMeta[]): SitemapPage[] =>
  getAllTagSlugs(posts).flatMap((tagSlug) => {
    const tagPosts = getPostsForTag(posts, tagSlug);
    if (!isTagIndexable(tagPosts)) return [];
    return [
      {
        path: `/blog/tag/${tagSlug}`,
        priority: "0.6",
        changefreq: "weekly",
        lastmod: postLastmod(tagPosts[0]),
      },
    ];
  });

export const _buildSitemapXml = (pages: SitemapPage[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) =>
    [
      "  <url>",
      `    <loc>${SITE_URL}${page.path}</loc>`,
      ...(page.lastmod ? [`    <lastmod>${page.lastmod}</lastmod>`] : []),
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  )
  .join("\n")}
</urlset>`;

export const GET = async () => {
  const allPosts = getAllPosts();

  const blogPages = allPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: postLastmod(post),
  }));

  // lastmod for /blog = newest post's last_updated or date
  const newestPostDate = postLastmod(allPosts[0]);

  // lastmod for homepage = newest post's original date (homepage only uses slugs)
  const newestPostOriginalDate = formatDate(allPosts[0].date);

  const tagPages = _tagSitemapPages(allPosts);

  const allPages = [
    ..._staticPages.map((p) => {
      const page = Object.assign({}, p);
      if (page.path === "") page.lastmod = newestPostOriginalDate;
      if (page.path === "/blog") page.lastmod = newestPostDate;
      return page;
    }),
    ...blogPages,
    ...tagPages,
  ];

  // Prerendered: only the body survives the build; caching is the asset layer's job.
  return new Response(_buildSitemapXml(allPages), {
    headers: { "Content-Type": "application/xml" },
  });
};
