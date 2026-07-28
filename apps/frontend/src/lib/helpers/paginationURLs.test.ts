import { buildPaginationURLs, pageURL } from "$lib/helpers/paginationURLs";
import { describe, expect, it } from "bun:test";

describe("pageURL", () => {
  it("leaves page 1 at the base, unsuffixed", () => {
    expect(pageURL("/blog", 1)).toBe("/blog");
  });

  it("appends /page/N beyond page 1", () => {
    expect(pageURL("/blog", 2)).toBe("/blog/page/2");
  });

  it("works for relative nav hrefs and absolute SEO URLs alike", () => {
    expect(pageURL("/blog/tag/vite", 3)).toBe("/blog/tag/vite/page/3");
    expect(pageURL("https://viktor.andersson.tech/blog", 3)).toBe(
      "https://viktor.andersson.tech/blog/page/3",
    );
  });
});

describe("buildPaginationURLs", () => {
  it("omits prev on the first page and next on the last", () => {
    expect(buildPaginationURLs("/blog", 1, 3)).toEqual({
      canonicalURL: "/blog",
      prevURL: undefined,
      nextURL: "/blog/page/2",
    });
    expect(buildPaginationURLs("/blog", 3, 3)).toEqual({
      canonicalURL: "/blog/page/3",
      prevURL: "/blog/page/2",
      nextURL: undefined,
    });
  });

  it("points prev at the bare base from page 2", () => {
    expect(buildPaginationURLs("/blog", 2, 3)).toEqual({
      canonicalURL: "/blog/page/2",
      prevURL: "/blog",
      nextURL: "/blog/page/3",
    });
  });

  it("omits both on a single-page listing", () => {
    expect(buildPaginationURLs("/blog", 1, 1)).toEqual({
      canonicalURL: "/blog",
      prevURL: undefined,
      nextURL: undefined,
    });
  });
});
