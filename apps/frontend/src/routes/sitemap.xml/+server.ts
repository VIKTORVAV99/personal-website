export const prerender = true;
import { getAllPosts, getAllTags, slugifyTag } from "$lib/blog";
import { SITE_URL } from "$lib/config";
import { PROFILE_DATE_MODIFIED } from "$lib/seo/person";

interface SitemapPage {
  path: string;
  priority: string;
  changefreq: string;
  lastmod: string;
}

const profileLastmod = PROFILE_DATE_MODIFIED.split("T")[0];

export const _staticPages = [
  { path: "", priority: "1.0", changefreq: "weekly", lastmod: profileLastmod },
  { path: "/blog", priority: "0.9", changefreq: "weekly", lastmod: profileLastmod },
  { path: "/about", priority: "0.8", changefreq: "monthly", lastmod: profileLastmod },
  { path: "/history", priority: "0.8", changefreq: "monthly", lastmod: profileLastmod },
];

export const _buildSitemapXml = (pages: SitemapPage[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

export const GET = async () => {
  const allPosts = getAllPosts();

  const blogPages = allPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: new Date(post.last_updated || post.date).toISOString().split("T")[0],
  }));

  // lastmod for /blog = newest post's last_updated or date
  const newestPostDate = new Date(allPosts[0].last_updated || allPosts[0].date)
    .toISOString()
    .split("T")[0];

  // lastmod for homepage = newest post's original date (homepage only uses slugs)
  const newestPostOriginalDate = new Date(allPosts[0].date).toISOString().split("T")[0];

  const tagPages = getAllTags(allPosts)
    .map((tag) => {
      const tagSlug = slugifyTag(tag);
      const tagPosts = allPosts.filter((p) => p.tags?.some((t) => slugifyTag(t) === tagSlug));
      if (tagPosts.length < 4) return null;
      const lastmod = new Date(tagPosts[0].last_updated || tagPosts[0].date)
        .toISOString()
        .split("T")[0];
      return { path: `/blog/tag/${tagSlug}`, priority: "0.6", changefreq: "weekly", lastmod };
    })
    .filter(Boolean) as SitemapPage[];

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

  return new Response(_buildSitemapXml(allPages), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
