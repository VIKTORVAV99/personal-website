import { getAllPosts, paginatePosts } from "$lib/blog";
import { BLOG_DESCRIPTION, SITE_URL } from "$lib/config";
import { buildPaginationURLs } from "$lib/helpers/paginationURLs";
import {
  createBreadcrumbListSchema,
  createCollectionPageSchema,
  createItemListSchema,
  SITE_WEBSITE_REF,
} from "$lib/seo";

/** Shared load logic for /blog and /blog/page/[page]. */
export const loadBlogListing = (page: number) => {
  const posts = getAllPosts();
  const paginated = paginatePosts(posts, page);
  const allSlugs = posts.map((p) => p.slug);

  const { canonicalURL, prevURL, nextURL } = buildPaginationURLs(
    `${SITE_URL}/blog`,
    paginated.currentPage,
    paginated.totalPages,
  );

  const structuredData = [
    createCollectionPageSchema({
      name: "Blog",
      description: BLOG_DESCRIPTION,
      url: canonicalURL,
      mainEntity: createItemListSchema(allSlugs.map((slug) => `${SITE_URL}/blog/${slug}`)),
      isPartOf: SITE_WEBSITE_REF,
    }),
    createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "Blog" }]),
  ];

  return {
    ...paginated,
    allSlugs,
    description: BLOG_DESCRIPTION,
    structuredData,
    canonicalURL,
    prevURL,
    nextURL,
  };
};
