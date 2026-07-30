import type { BlogPostMeta } from "$lib/blog";

import { slugFromPath } from "$lib/blog";

const WORDS_PER_MINUTE = 200;

const calculateReadingTime = (raw: string): number => {
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  const words = body.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/**
 * Server-only: the eager globs below compile to static imports of every post, so
 * anything the client can reach must not import this module. The `.server` suffix
 * makes SvelteKit enforce that — see $lib/blog.ts for the glob-free helpers.
 */
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
    const moduleSlug = slugFromPath(path);
    const slug = (metadata?.slug as string | undefined) ?? moduleSlug;

    if (metadata && slug && moduleSlug) {
      posts.push({
        ...metadata,
        slug,
        moduleSlug,
        readingTime: calculateReadingTime(raw),
      } as BlogPostMeta);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
