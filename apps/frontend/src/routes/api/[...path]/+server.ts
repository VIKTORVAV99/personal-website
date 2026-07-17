import type { RequestHandler } from "./$types";

// The one runtime route on an otherwise fully prerendered site: proxies
// same-origin /api/* requests to the backend worker over the BACKEND service
// binding, so the backend needs no public URL and the browser needs no CORS.
export const prerender = false;

export const GET: RequestHandler = async ({ params, url, platform }) => {
  const backend = platform?.env?.BACKEND;
  if (!backend) {
    return new Response(null, { status: 503 });
  }
  const search = new URLSearchParams(url.search);
  if (import.meta.env.DEV) {
    // The backend caches responses by URL for an hour; a throwaway param makes
    // every dev request unique so local iteration always sees live data.
    search.set("_", Date.now().toString());
  }
  const query = search.toString();
  // The hostname is ignored by service bindings; only the path and query matter.
  const upstream = await backend.fetch(
    `https://portfolio-backend/${params.path}${query === "" ? "" : `?${query}`}`,
  );
  // Re-wrap instead of returning directly: in dev the binding is emulated via
  // wrangler's platform proxy, whose Response fails SvelteKit's instanceof check.
  const headers = new Headers();
  upstream.headers.forEach((value: string, key: string) => headers.set(key, value));
  if (import.meta.env.DEV) {
    // Don't let the browser cache API responses while iterating locally;
    // in production the upstream max-age is exactly what we want.
    headers.set("cache-control", "no-store");
  }
  return new Response(upstream.body as ReadableStream | null, {
    status: upstream.status,
    headers,
  });
};
