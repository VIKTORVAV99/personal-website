import {
  createBreadcrumbListSchema,
  createCollectionPageSchema,
  createItemListSchema,
} from "structured-data-generators";

import { getAllPosts } from "#lib/blog.server.ts";
import { paginatePosts } from "#lib/blog.ts";
import { BLOG_DESCRIPTION, SITE_URL } from "#lib/config.ts";
import { buildPaginationURLs } from "#lib/helpers/paginationURLs.ts";
import { SITE_WEBSITE_REF } from "#lib/seo/index.ts";

/** Shared load logic for /blog and /blog/page/[page]. */
export const loadBlogListing = (page: number) => {
  const posts = getAllPosts();
  const paginated = paginatePosts(posts, page);

  const { canonicalURL, prevURL, nextURL } = buildPaginationURLs(
    `${SITE_URL}/blog`,
    paginated.currentPage,
    paginated.totalPages,
  );

  const structuredData = [
    createCollectionPageSchema({
      inLanguage: "en",
      name: "Blog",
      description: BLOG_DESCRIPTION,
      url: canonicalURL,
      mainEntity: createItemListSchema(posts.map((p) => `${SITE_URL}/blog/${p.slug}`)),
      isPartOf: SITE_WEBSITE_REF,
    }),
    createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "Blog" }]),
  ];

  return {
    ...paginated,
    description: BLOG_DESCRIPTION,
    structuredData,
    canonicalURL,
    prevURL,
    nextURL,
  };
};
