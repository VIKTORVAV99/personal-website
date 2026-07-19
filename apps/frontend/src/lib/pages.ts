import { BLOG_DESCRIPTION } from "$lib/config";

export interface SiteLink {
  /** Path relative to the site root. Empty string is the homepage. */
  path: string;
  /** Human-readable title, used as llms.txt link text. */
  title: string;
  /** One-line description, used as llms.txt link description. */
  description: string;
}

export interface SitePage extends SiteLink {
  /** sitemap.xml <priority>. */
  priority: string;
  /** sitemap.xml <changefreq>. */
  changefreq: string;
}

/** Canonical list of top-level pages, shared by sitemap.xml and llms.txt. */
export const SITE_PAGES: SitePage[] = [
  {
    path: "",
    title: "Home",
    description: "Overview and latest writing",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    path: "/about",
    title: "About",
    description: "Background, skills, and contact",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/activity",
    title: "Activity",
    description: "Live GitHub contribution log",
    priority: "0.7",
    changefreq: "daily",
  },
  {
    path: "/history",
    title: "History",
    description: "Career and education timeline",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/blog",
    title: "Blog",
    description: BLOG_DESCRIPTION,
    priority: "0.9",
    changefreq: "weekly",
  },
];

/** Machine-readable endpoints, surfaced in llms.txt's Optional section (never in the sitemap). */
export const RESOURCE_LINKS: SiteLink[] = [
  { path: "/rss.xml", title: "RSS feed", description: "Blog posts as an RSS feed" },
  { path: "/sitemap.xml", title: "Sitemap", description: "All indexed URLs" },
];
