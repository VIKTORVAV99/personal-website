import type { Handle } from "@sveltejs/kit";

import { ifNoneMatchHits, weakEtag } from "$lib/helpers/etag";

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    preload: ({ type }) => type === "css" || type === "font",
  });

  // Add an ETag to SSR HTML responses and return 304 when If-None-Match matches.
  if (
    event.request.method === "GET" &&
    response.status === 200 &&
    response.headers.get("content-type")?.startsWith("text/html")
  ) {
    const body = await response.arrayBuffer();
    const etag = await weakEtag(body);
    const headers = new Headers(response.headers);
    headers.set("etag", etag);
    if (!headers.has("cache-control")) {
      headers.set("cache-control", "no-cache");
    }

    if (ifNoneMatchHits(event.request.headers.get("if-none-match"), etag)) {
      return new Response(null, { status: 304, headers });
    }
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};
