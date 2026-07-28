import type { BlogPostMeta } from "$lib/blog";

export const makePost = (overrides: Partial<BlogPostMeta> & { slug: string }): BlogPostMeta => ({
  title: overrides.slug,
  description: overrides.slug,
  date: "2026-01-01",
  readingTime: 1,
  ...overrides,
});

/**
 * `count` posts tagged `tag`, newest first — the order getAllPosts() returns.
 * `tagsFor` overrides the raw tag strings per post, for slug-normalization cases.
 */
export const postsTagged = (
  tag: string,
  count: number,
  tagsFor: (i: number) => string[] = () => [tag],
): BlogPostMeta[] =>
  Array.from({ length: count }, (_, i) =>
    makePost({
      slug: `${tag}-${i}`,
      tags: tagsFor(i),
      date: `2026-01-${String(count - i).padStart(2, "0")}`,
    }),
  );
