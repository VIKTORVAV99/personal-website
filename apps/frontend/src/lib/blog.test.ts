import {
  getAllTagSlugs,
  getPostsForTag,
  isTagIndexable,
  slugFromPath,
  slugifyTag,
} from "$lib/blog";
import { describe, expect, it } from "bun:test";

import { makePost, postsTagged } from "../tests/fixtures/posts";

describe("slugFromPath", () => {
  it("lowercases the filename and turns underscores into hyphens", () => {
    expect(slugFromPath("/src/blog_posts/Hello_World.md")).toBe("hello-world");
    expect(slugFromPath("/src/blog_posts/Flowtracing_Go_Brrrr.md")).toBe("flowtracing-go-brrrr");
  });

  it("leaves a filename without underscores alone beyond lowercasing", () => {
    expect(slugFromPath("/src/blog_posts/Changelog.md")).toBe("changelog");
  });

  it("keeps existing hyphens", () => {
    expect(slugFromPath("/src/blog_posts/Hello-World.md")).toBe("hello-world");
  });
});

describe("slugifyTag", () => {
  it("lowercases and collapses non-alphanumeric runs", () => {
    expect(slugifyTag("Google Cloud")).toBe("google-cloud");
    expect(slugifyTag("Node.js")).toBe("node-js");
  });

  it("strips leading and trailing dashes", () => {
    expect(slugifyTag("...Vite!")).toBe("vite");
  });

  it("is idempotent", () => {
    const slug = slugifyTag("Google Cloud");
    expect(slugifyTag(slug)).toBe(slug);
  });

  it("returns an empty string for punctuation-only tags", () => {
    expect(slugifyTag("+++")).toBe("");
  });
});

describe("getAllTagSlugs", () => {
  it("dedupes tags that differ raw but share a slug", () => {
    const posts = postsTagged("google-cloud", 2, (i) =>
      i === 0 ? ["Google Cloud"] : ["google-cloud"],
    );
    expect(getAllTagSlugs(posts)).toEqual(["google-cloud"]);
  });

  it("drops tags that slugify to an empty string", () => {
    expect(getAllTagSlugs([makePost({ slug: "a", tags: ["+++", "vite"] })])).toEqual(["vite"]);
  });

  it("sorts the slugs and tolerates posts without tags", () => {
    const posts = [makePost({ slug: "a", tags: ["vite", "arm"] }), makePost({ slug: "b" })];
    expect(getAllTagSlugs(posts)).toEqual(["arm", "vite"]);
  });
});

describe("getPostsForTag", () => {
  it("matches on slug, not raw tag text", () => {
    const posts = postsTagged("google-cloud", 3, (i) =>
      i === 2 ? ["vite"] : [i === 0 ? "Google Cloud" : "google-cloud"],
    );
    expect(getPostsForTag(posts, "google-cloud").map((p) => p.slug)).toEqual([
      "google-cloud-0",
      "google-cloud-1",
    ]);
  });

  it("preserves the order of the input posts", () => {
    const posts = postsTagged("vite", 3, (i) => (i === 1 ? ["arm"] : ["vite"]));
    expect(getPostsForTag(posts, "vite").map((p) => p.slug)).toEqual(["vite-0", "vite-2"]);
  });
});

describe("isTagIndexable", () => {
  it("excludes tags with no posts", () => {
    expect(isTagIndexable([])).toBe(false);
  });
});
