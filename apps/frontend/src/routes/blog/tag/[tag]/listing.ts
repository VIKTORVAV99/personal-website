import {
  createBreadcrumbListSchema,
  createCollectionPageRefSchema,
  createCollectionPageSchema,
  createDefinedTermSchema,
  createItemListSchema,
} from "structured-data-generators";

import type { BlogPostMeta } from "#lib/blog.ts";

import { getPostsForTag, isTagIndexable, paginatePosts, slugifyTag } from "#lib/blog.ts";
import { SITE_URL } from "#lib/config.ts";
import { pageTitle } from "#lib/helpers/pageTitle.ts";
import { buildPaginationURLs } from "#lib/helpers/paginationURLs.ts";
import { ROBOTS, SITE_WEBSITE_REF } from "#lib/seo/index.ts";

/** Shared load logic for /blog/tag/[tag] and /blog/tag/[tag]/page/[page]. */
export const loadTagListing = (tag: string, page: number, posts: BlogPostMeta[]) => {
  const tagSlug = slugifyTag(tag);

  const filtered = getPostsForTag(posts, tagSlug);

  // Derive display name from the first matching post's original tag (newest post wins)
  const displayTag = filtered[0]?.tags?.find((t) => slugifyTag(t) === tagSlug) ?? tagSlug;

  const paginated = paginatePosts(filtered, page);
  const totalPosts = filtered.length;
  const robots = isTagIndexable(filtered) ? ROBOTS.default : ROBOTS.thinArchive;

  const baseURL = `${SITE_URL}/blog/tag/${tagSlug}`;
  const { canonicalURL, prevURL, nextURL } = buildPaginationURLs(
    baseURL,
    paginated.currentPage,
    paginated.totalPages,
  );

  const description = `Browse ${totalPosts} blog ${totalPosts === 1 ? "post" : "posts"} tagged with "${displayTag}".`;

  const structuredData = [
    createCollectionPageSchema({
      inLanguage: "en",
      name: `Posts tagged "${displayTag}"`,
      description,
      url: canonicalURL,
      mainEntity: createItemListSchema(filtered.map((p) => `${SITE_URL}/blog/${p.slug}`)),
      isPartOf: [createCollectionPageRefSchema(`${SITE_URL}/blog`), SITE_WEBSITE_REF],
      about: createDefinedTermSchema({ name: displayTag }),
    }),
    createBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: `#${displayTag}` },
    ]),
  ];

  return {
    ...paginated,
    tag: tagSlug,
    displayTag,
    title: pageTitle(`#${displayTag}${page > 1 ? ` — Page ${page}` : ""}`),
    robots,
    description,
    structuredData,
    canonicalURL,
    prevURL,
    nextURL,
  };
};
