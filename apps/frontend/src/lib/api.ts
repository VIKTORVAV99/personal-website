import type { AppType } from "portfolio-backend";

import { hc, type InferResponseType } from "hono/client";

// Binds the backend's AppType once: reused to build a per-request server client
// (fetchActivityServer) and to derive the response DTOs below. The backend
// package exports AppType and nothing else, so these types describe the JSON
// actually received over the wire.
const createClient = hc<AppType>;

type Client = ReturnType<typeof createClient>;
type ActivityResponse = InferResponseType<Client["github"]["activity"]["$get"], 200>;
export type LatestActivity = ActivityResponse["log"][number];
export type Contributions = ActivityResponse["contributions"];

// The BACKEND service binding, sourced from its one declaration in app.d.ts
// (Fetcher itself is a workers-types global the frontend tsconfig doesn't carry).
type BackendBinding = NonNullable<App.Platform["env"]>["BACKEND"];

// The /activity page fetches server-side, straight over the BACKEND service
// binding — no public URL, no proxy. A 200 is a usable body; anything else
// means "no data", which the page renders as its error state.
export const fetchActivityServer = async (
  backend: BackendBinding,
): Promise<ActivityResponse | null> => {
  const client = createClient("https://portfolio-backend", {
    fetch: backend.fetch.bind(backend) as typeof globalThis.fetch,
  });
  const response = await client.github.activity.$get();
  return response.status === 200 ? await response.json() : null;
};

// The one place that decides when the contributions summary is worth showing;
// doubles as the type guard that narrows away the null.
export const hasContributions = (
  contributions: Contributions,
): contributions is NonNullable<Contributions> =>
  contributions !== null && contributions.publicCount + contributions.privateCount > 0;
