import { getAllPosts, paginatePosts } from "$lib/blog";
import { SITE_URL } from "$lib/config";
import { buildPaginationURLs } from "$lib/helpers/paginationURLs";
import {
  createBreadcrumbListSchema,
  createCollectionPageSchema,
  createItemListSchema,
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

  const description = "Thoughts on software engineering, climate tech, and open source.";

  const structuredData = [
    createCollectionPageSchema({
      name: "Blog",
      description,
      url: canonicalURL,
      mainEntity: createItemListSchema(allSlugs.map((slug) => `${SITE_URL}/blog/${slug}`)),
    }),
    createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "Blog" }]),
  ];

  return { ...paginated, allSlugs, description, structuredData, canonicalURL, prevURL, nextURL };
};
