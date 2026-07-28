import { TAG_INDEX_MIN_POSTS } from "$lib/blog";
import { ROBOTS } from "$lib/seo";
import { describe, expect, it } from "bun:test";

import { postsTagged } from "../../../../tests/fixtures/posts";
import { loadTagListing } from "./listing";

describe("loadTagListing", () => {
  it("slugifies the tag param rather than only lowercasing it", () => {
    const data = loadTagListing("Google Cloud", 1, postsTagged("google-cloud", 1));
    expect(data.tag).toBe("google-cloud");
    expect(data.canonicalURL).toBe("https://viktor.andersson.tech/blog/tag/google-cloud");
    expect(data.pagedPosts).toHaveLength(1);
  });

  it("derives displayTag from the newest matching post's raw tag", () => {
    const posts = postsTagged("google-cloud", 2, (i) =>
      i === 0 ? ["Google Cloud"] : ["google-cloud"],
    );
    expect(loadTagListing("google-cloud", 1, posts).displayTag).toBe("Google Cloud");
  });

  it("thins the robots directive below the threshold", () => {
    const posts = postsTagged("vite", TAG_INDEX_MIN_POSTS - 1);
    expect(loadTagListing("vite", 1, posts).robots).toBe(ROBOTS.thinArchive);
  });

  it("titles page 1 without a page number and later pages with one", () => {
    const posts = postsTagged("vite", 1);
    expect(loadTagListing("vite", 1, posts).title).toBe("Viktor Andersson | #vite");
    expect(loadTagListing("vite", 2, posts).title).toBe("Viktor Andersson | #vite — Page 2");
  });
});
