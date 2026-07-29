import { SITE_AUTHOR } from "$lib/config";
import { describe, it, expect } from "bun:test";

import { pageTitle } from "./pageTitle";

describe("pageTitle", () => {
  it("puts the section first, separated by a pipe", () => {
    expect(pageTitle("About")).toBe("About | Viktor Andersson");
  });

  it("returns the bare author when no section is given", () => {
    expect(pageTitle()).toBe(SITE_AUTHOR);
  });

  it("reads the same for a post title as for a section", () => {
    expect(pageTitle("A post about Svelte")).toBe("A post about Svelte | Viktor Andersson");
  });
});
