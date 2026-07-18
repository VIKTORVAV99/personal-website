// Weak ETag from the first 128 bits of a SHA-256 hash of the response bytes.
export const weakEtag = async (body: ArrayBuffer): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", body);
  const hex = new Uint8Array(digest, 0, 16).toHex();
  return `W/"${hex}"`;
};

// True when an If-None-Match header matches the etag, allowing a tag list or "*".
export const ifNoneMatchHits = (header: string | null, etag: string): boolean => {
  if (header === null) return false;
  return header
    .split(",")
    .map((tag) => tag.trim())
    .some((tag) => tag === "*" || tag === etag);
};
