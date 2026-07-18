import { describe, expect, it } from "bun:test";

import { ifNoneMatchHits, weakEtag } from "./etag";

const encode = (text: string): ArrayBuffer => new TextEncoder().encode(text).buffer as ArrayBuffer;

describe("weakEtag", () => {
  it("is deterministic for identical input", async () => {
    expect(await weakEtag(encode("hello"))).toBe(await weakEtag(encode("hello")));
  });

  it("emits a weak, hex-quoted tag", async () => {
    expect(await weakEtag(encode("hello"))).toMatch(/^W\/"[0-9a-f]+"$/);
  });

  it("differs for different input", async () => {
    expect(await weakEtag(encode("hello"))).not.toBe(await weakEtag(encode("world")));
  });
});

describe("ifNoneMatchHits", () => {
  const etag = 'W/"abc123"';

  it("misses when the header is absent", () => {
    expect(ifNoneMatchHits(null, etag)).toBe(false);
  });

  it("hits on an exact echo-back", () => {
    expect(ifNoneMatchHits(etag, etag)).toBe(true);
  });

  it("hits when the tag appears in a comma-separated list", () => {
    expect(ifNoneMatchHits(`W/"old", ${etag}`, etag)).toBe(true);
  });

  it("hits on the wildcard", () => {
    expect(ifNoneMatchHits("*", etag)).toBe(true);
  });

  it("misses on a non-matching tag", () => {
    expect(ifNoneMatchHits('W/"nope"', etag)).toBe(false);
  });
});
