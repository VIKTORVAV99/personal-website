import { LICENSE_URL, SITE_AUTHOR, SITE_URL } from "$lib/config";
import { describe, it, expect } from "bun:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appHtml = await Bun.file(
  resolve(dirname(fileURLToPath(import.meta.url)), "../app.html"),
).text();

describe("app.html", () => {
  // app.html is a static template and cannot import from $lib, so these
  // literals are the one place the constants are duplicated.
  it("declares the same license URL as LICENSE_URL", () => {
    const href = appHtml.match(/<link\s+rel="license"\s+href="([^"]+)"/)?.[1];
    expect(href).toBe(LICENSE_URL);
  });

  it("declares the same author as SITE_AUTHOR", () => {
    const content = appHtml.match(/<meta\s+name="author"\s+content="([^"]+)"/)?.[1];
    expect(content).toBe(SITE_AUTHOR);
  });

  it("hardcodes no other absolute URL to the site or repo", () => {
    const urls = [...appHtml.matchAll(/https?:\/\/[^"'\s>]+/g)].map((m) => m[0]);
    const unexpected = urls.filter((u) => u !== LICENSE_URL && !u.startsWith(SITE_URL));
    expect(unexpected).toEqual([]);
  });
});
