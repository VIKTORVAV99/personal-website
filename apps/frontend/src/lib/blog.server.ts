import type { BlogPostMeta } from "$lib/blog";
import type { Component } from "svelte";

import { slugFromPath } from "$lib/blog";
import { render } from "svelte/server";

interface PostModule {
  default: Component;
  metadata?: Record<string, unknown>;
}

/**
 * Server-only: these eager globs compile to static imports of every post, so anything the
 * client can reach must not import this module. The `.server` suffix makes SvelteKit enforce
 * that — see $lib/blog.ts for the glob-free helpers.
 *
 * Kept inside functions rather than at module scope so importing this module never evaluates
 * them: `import.meta.glob` is a Vite construct that does not exist under `bun test`, and the
 * sitemap tests import a route that re-exports from here.
 */
const postModules = () => import.meta.glob<PostModule>("$blogs/*.md", { eager: true });

const postSources = () =>
  import.meta.glob<string>("$blogs/*.md", { eager: true, query: "?raw", import: "default" });

const WORDS_PER_MINUTE = 200;

const calculateReadingTime = (raw: string): number => {
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  const words = body.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export const getAllPosts = (): BlogPostMeta[] => {
  const modules = postModules();
  const sources = postSources();
  const posts: BlogPostMeta[] = [];

  for (const path in modules) {
    const metadata = modules[path].metadata;
    const slug = slugFromPath(path);

    if (metadata && slug) {
      const readingTime = calculateReadingTime(sources[path] ?? "");
      posts.push({ ...metadata, slug, readingTime } as BlogPostMeta);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Renders a post to an HTML string, so its content reaches the browser as markup instead of
 * a client chunk. Callers validate the slug against getAllPosts first; both read one glob.
 */
export const renderPostBody = (slug: string): string => {
  const modules = postModules();
  const path = Object.keys(modules).find((p) => slugFromPath(p) === slug);
  if (!path) throw new Error(`Blog post "${slug}" has no module`);
  return render(modules[path].default).body;
};
