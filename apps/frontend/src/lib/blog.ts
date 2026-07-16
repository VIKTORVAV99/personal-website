export const PAGE_SIZE = 15;

export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  last_updated?: string;
  tags?: string[];
  slug: string;
  readingTime: number;
}

const WORDS_PER_MINUTE = 200;

const calculateReadingTime = (raw: string): number => {
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  const words = body.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export const slugFromPath = (path: string): string | undefined =>
  path.split("/").at(-1)?.replace(/\.md$/, "").toLowerCase();

export const getAllPosts = (): BlogPostMeta[] => {
  const modules = import.meta.glob("$blogs/*.md", { eager: true });
  const rawPaths = import.meta.glob("$blogs/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });
  const posts: BlogPostMeta[] = [];

  for (const path in modules) {
    const file = modules[path] as any;
    const metadata = file?.metadata as Record<string, any> | undefined;
    const raw = (rawPaths[path] as string) ?? "";
    const slug = slugFromPath(path);

    if (metadata && slug) {
      posts.push({ ...metadata, slug, readingTime: calculateReadingTime(raw) } as BlogPostMeta);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllTags = (posts: BlogPostMeta[]): string[] => {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tagSet.add(tag.toLowerCase());
    }
  }
  return [...tagSet].sort();
};

export const slugifyTag = (tag: string): string =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
