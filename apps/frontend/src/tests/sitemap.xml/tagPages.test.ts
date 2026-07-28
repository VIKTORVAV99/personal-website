import { TAG_INDEX_MIN_POSTS } from "$lib/blog";
import { ROBOTS } from "$lib/seo";
import { describe, expect, it } from "bun:test";

import { loadTagListing } from "../../routes/blog/tag/[tag]/listing";
import { _tagSitemapPages } from "../../routes/sitemap.xml/+server";
import { makePost, postsTagged } from "../fixtures/posts";

describe("_tagSitemapPages", () => {
  it("emits one entry for raw tags that share a slug", () => {
    const posts = postsTagged("google-cloud", TAG_INDEX_MIN_POSTS, (i) =>
      i % 2 === 0 ? ["Google Cloud"] : ["google-cloud"],
    );
    expect(_tagSitemapPages(posts).map((p) => p.path)).toEqual(["/blog/tag/google-cloud"]);
  });

  it("never emits a bare /blog/tag/ for punctuation-only tags", () => {
    const posts = postsTagged("vite", TAG_INDEX_MIN_POSTS, () => ["+++", "vite"]);
    expect(_tagSitemapPages(posts).map((p) => p.path)).toEqual(["/blog/tag/vite"]);
  });

  it("takes lastmod from the newest post, preferring last_updated", () => {
    const posts = postsTagged("vite", TAG_INDEX_MIN_POSTS);
    posts[0] = makePost({ ...posts[0], last_updated: "2026-06-15" });
    expect(_tagSitemapPages(posts)[0].lastmod).toBe("2026-06-15");
  });
});

// Sitemap membership and the emitted robots directive read the same threshold via
// isTagIndexable. This pins them to one verdict so a change can't move only one.
describe("tag indexing threshold", () => {
  for (const count of [0, TAG_INDEX_MIN_POSTS - 1, TAG_INDEX_MIN_POSTS, TAG_INDEX_MIN_POSTS + 1]) {
    it(`agrees between sitemap and robots meta for ${count} posts`, () => {
      const posts = postsTagged("vite", count);
      const inSitemap = _tagSitemapPages(posts).some((p) => p.path === "/blog/tag/vite");
      expect(inSitemap).toBe(loadTagListing("vite", 1, posts).robots === ROBOTS.default);
    });
  }
});
