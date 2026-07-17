import { Hono } from "hono";
import { cache } from "hono/cache";
import type { GithubEnv } from "./github/client";
import { githubRoutes } from "./github/routes";

// DEV comes from .dev.vars, which wrangler reads only for local dev —
// deployed workers never see it.
type Bindings = GithubEnv & { DEV?: string };

const cacheMiddleware = cache({
  cacheName: "portfolio-backend",
  cacheControl: "max-age=3600",
});

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", async (c, next) => {
    // Applies to every route on purpose: all responses are cacheable for an
    // hour, and this caps upstream (GitHub) calls regardless of traffic.
    // Local dev opts out entirely — no worker cache, no browser cache — so
    // iteration always sees live data.
    if (c.env.DEV !== "true") {
      return cacheMiddleware(c, next);
    }
    await next();
    c.res.headers.set("Cache-Control", "no-store");
  })
  .get("/", (c) => {
    console.log("Received request at /");
    return c.json({ message: "Hello from backend worker!" });
  })
  .route("/github", githubRoutes);

export type AppType = typeof app;

export default app;
