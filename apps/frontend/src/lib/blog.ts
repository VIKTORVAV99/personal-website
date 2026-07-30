export const PAGE_SIZE = 15;

export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  last_updated?: string;
  tags?: string[];
  slug: string;
  /** Slug derived from the filename, used to look the post's module up in the glob. */
  moduleSlug?: string;
  /** Overrides the `<title>` tag; the `title` still drives the heading and social cards. */
  seo_title?: string;
  /** Social card image, absolute or site-root relative. Falls back to the hero banner. */
  image?: string;
  image_alt?: string;
  readingTime: number;
  wordCount: number;
}

// Glob-free by design: the client reaches this module for slugFromPath/slugifyTag, so
// an eager import.meta.glob here would pull every post into the client bundle. Post
// loading lives in $lib/blog.server.ts (build-time) and $lib/blog-loader.ts (per-post).
export const slugFromPath = (path: string): string | undefined =>
  path.split("/").at(-1)?.replace(/\.md$/, "").toLowerCase().replaceAll("_", "-");

export const slugifyTag = (tag: string): string =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Minimum posts before a tag listing is worth indexing. Drives both the robots meta and sitemap membership. */
export const TAG_INDEX_MIN_POSTS = 4;

export const getAllTagSlugs = (posts: BlogPostMeta[]): string[] =>
  [...new Set(posts.flatMap((p) => p.tags ?? []).map(slugifyTag))].filter(Boolean).sort();

export const getPostsForTag = (posts: BlogPostMeta[], tagSlug: string): BlogPostMeta[] =>
  posts.filter((p) => p.tags?.some((t) => slugifyTag(t) === tagSlug));

export const isTagIndexable = (tagPosts: BlogPostMeta[]): boolean =>
  tagPosts.length >= TAG_INDEX_MIN_POSTS;

export const paginatePosts = (posts: BlogPostMeta[], currentPage: number) => {
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const pagedPosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return { pagedPosts, currentPage, totalPages };
};

/** Parses a `page` route param. Returns undefined for anything but a positive integer. */
export const parsePageParam = (raw: string): number | undefined => {
  if (!/^[1-9]\d*$/.test(raw)) return undefined;
  return Number(raw);
};
