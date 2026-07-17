import { Hono } from "hono";
import { cache } from "hono/cache";
import type { GithubEnv } from "./github/client";
import { githubRoutes } from "./github/routes";

type Bindings = GithubEnv;

const app = new Hono<{ Bindings: Bindings }>()
  .use(
    "*",
    // Applies to every route on purpose: all responses are cacheable for an hour,
    // and this caps upstream (GitHub) calls regardless of traffic.
    cache({
      cacheName: "portfolio-backend",
      cacheControl: "max-age=3600",
    }),
  )
  .get("/", (c) => {
    console.log("Received request at /");
    return c.json({ message: "Hello from backend worker!" });
  })
  .route("/github", githubRoutes);

export type AppType = typeof app;

export default app;
