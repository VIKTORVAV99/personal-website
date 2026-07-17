import type { AppType } from "portfolio-backend";

import { hc, type InferResponseType } from "hono/client";

// Typed client for the backend worker, reached through the same-origin
// /api/[...path] proxy. The backend package exports AppType and nothing else —
// response types are derived from the route schema here, so they describe the
// JSON actually received over the wire.
export const api = hc<AppType>("/api");

export type ActivityResponse = InferResponseType<typeof api.github.activity.$get, 200>;
export type LatestActivity = ActivityResponse["log"][number];
export type Contributions = ActivityResponse["contributions"];
