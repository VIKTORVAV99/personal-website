interface PaginationURLs {
  canonicalURL: string;
  prevURL: string | undefined;
  nextURL: string | undefined;
}

// Pagination uses path segments (/page/2) rather than query strings, because
// the site is fully prerendered and query strings are ignored for static pages.
const pageURL = (baseURL: string, page: number): string =>
  page === 1 ? baseURL : `${baseURL}/page/${page}`;

export const buildPaginationURLs = (
  baseURL: string,
  currentPage: number,
  totalPages: number,
): PaginationURLs => {
  const canonicalURL = pageURL(baseURL, currentPage);
  const prevURL = currentPage > 1 ? pageURL(baseURL, currentPage - 1) : undefined;
  const nextURL = currentPage < totalPages ? pageURL(baseURL, currentPage + 1) : undefined;
  return { canonicalURL, prevURL, nextURL };
};
