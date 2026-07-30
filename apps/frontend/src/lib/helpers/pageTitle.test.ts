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

  it("keeps the suffix when the full title lands on 60 chars", () => {
    const section = "s".repeat(41);
    expect(pageTitle(section)).toBe(`${section} | ${SITE_AUTHOR}`);
    expect(pageTitle(section)).toHaveLength(60);
  });

  it("drops the suffix when the full title would pass 60 chars", () => {
    const section = "s".repeat(42);
    expect(pageTitle(section)).toBe(section);
  });

  it("returns a long post title unchanged", () => {
    const title = "Flowtracing Go Brrrr - Making our pipeline faster, cheaper and greener with ARM";
    expect(pageTitle(title)).toBe(title);
  });
});
