import type { BlogPostMeta } from "$lib/blog";

import { slugFromPath } from "$lib/blog";

const WORDS_PER_MINUTE = 200;

/** Words in the post body, frontmatter stripped. */
const countWords = (raw: string): number => {
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  return body.match(/\S+/g)?.length ?? 0;
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
      const wordCount = countWords(raw);

      posts.push({
        ...metadata,
        slug,
        moduleSlug,
        readingTime: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
        wordCount,
      } as BlogPostMeta);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
