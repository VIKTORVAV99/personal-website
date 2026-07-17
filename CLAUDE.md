# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Bun workspaces monorepo for my personal website, deployed to Cloudflare Workers:
- **apps/frontend/** — SvelteKit personal website (Svelte 5, Tailwind CSS v4, adapter-cloudflare)
- **apps/backend/** — Hono API worker proxying the GitHub API (authenticated via Secrets Store binding with `GITHUB_PORTFOLIO_TOKEN`)

## Commands

```bash
bun install                  # install all workspace deps (run from root)
bun run dev                  # start both frontend + backend dev servers
bun run dev:frontend         # start only frontend (Vite)
bun run dev:backend          # start only backend (Wrangler)
bun run build                # production build (frontend only)
bun run lint                 # oxlint across all apps
bun run format               # oxfmt across all apps
bun run format:check         # check formatting without writing
bun run test:unit            # bun test across all apps
bun run check:ci             # svelte-kit sync + svelte-check (strict)
```

Run a single test file: `cd apps/frontend && bun test src/components/timeline/nodes.test.ts`
Update snapshots: `cd apps/frontend && bun test --update-snapshots`

All root scripts use `bun --filter` to proxy into workspaces. You can also run workspace scripts directly: `cd apps/frontend && bun run build`.

## Architecture

### Frontend (apps/frontend/)

SvelteKit file-based routing with Svelte 5 runes (`$props()`, `$state()`, etc.).

**Fully prerendered (one exception):** the root `+layout.ts` sets `prerender = true` (and `trailingSlash = "never"`), so every route — including the `sitemap.xml` endpoint — is generated at build time and served as static assets. There is no runtime SSR: load functions run at build time, and query strings cannot drive routing or pagination. The single exception is `src/routes/api/[...path]/+server.ts` (`prerender = false`), a runtime GET proxy that forwards `/api/*` to the backend worker over the `BACKEND` service binding — this is how client-side code reaches the backend same-origin, with no CORS and no public backend URL.

**Path aliases** (defined in svelte.config.js):
- `$blogs` → `./src/blog_posts`
- `$components` → `./src/components`
- `$data` → `./src/data`
- `$images` → `./src/images`
- `$lib` → `./src/lib`
- `$interfaces` → `./src/interfaces`

**Key directories:**
- `src/routes/` — Pages and endpoints (+page.svelte, +page.server.ts, +server.ts, +layout.svelte)
- `src/components/` — Reusable Svelte components
- `src/components/timeline/` — Git-graph style timeline; layout math lives in plain TS modules (nodes, lanes, overlap, leader lines) with co-located tests
- `src/blog_posts/` — Markdown blog posts processed by mdsvex
- `src/data/metadata.ts` — Static content (timeline entries)
- `src/interfaces/` — TypeScript interfaces (ProjectConfig, TimelineEntry)
- `src/lib/seo/` — Structured data (JSON-LD) schemas, person/org data, and SEO component
- `src/lib/helpers/` — Utility functions (formatDate, paginationURLs)
- `src/lib/config.ts` — Site-wide constants (SITE_URL, fallback OG image)
- `src/fonts/` — Self-hosted variable font subsets (Inter, Monaspace Neon)
- `src/theme.css` — Tailwind v4 @theme color tokens, base element styles (headings, links) — no tailwind.config.js
- `src/app.css` — @font-face declarations and custom utilities (.page-container)

**Styling:** Tailwind CSS v4 using @theme syntax in theme.css. Dark mode via `.dark` class (hardcoded on `<html>` in app.html — the site is dark-only).

**Images/fonts:** `@sveltejs/enhanced-img` and `vite-imagetools` handle image processing (e.g. the OG image is an SVG rasterized to webp at build time); `fontaine` generates font fallback metrics.

**Blog:** Markdown files in `src/blog_posts/` with YAML frontmatter (title, date, last_updated, description, tags). Processed by mdsvex with Shiki highlighting. Listing at `/blog`, posts at `/blog/[slug]` (slug = lowercased filename), tag pages at `/blog/tag/[tag]`.

**SEO:** Custom `SEO.svelte` component injects JSON-LD structured data, Open Graph tags, Twitter Card tags, canonical URLs, and robots meta into `<svelte:head>`. Schema types include Person, WebSite, BlogPosting, ProfilePage, CollectionPage, BreadcrumbList, and SoftwareSourceCode. `sitemap.xml` is a prerendered endpoint; `robots.txt` is a static asset.

**Service worker:** `src/service-worker.ts` is deliberately a kill switch — it deletes all caches and unregisters itself, cleaning up after a previous offline-first iteration. Don't add caching logic back without replacing this behavior intentionally.

**Legacy routes:** `/projects/*` returns `410 Gone` (the projects section was removed; the route exists to signal link rot).

**Data is static** — timeline entries and blog posts are defined in source files, no database.

### Backend (apps/backend/)

Hono app on Cloudflare Workers, reachable only through the frontend's `BACKEND` service binding (`workers_dev: false` — no public URL). Entry point src/index.ts keeps the app as one chained builder and exports `AppType` so the frontend gets a typed client via `hc<AppType>` from `hono/client`. Cache middleware applies to all routes (1-hour max-age; only 200s are cached, so upstream failures aren't).

All activity data comes from a single GraphQL round trip per cache miss: a search for the user's merged PRs (`is:pr is:merged author:…` — the events feed was abandoned because its ~100-event window rarely holds 15 merges) plus windowed contribution counts. PRs in private repos are redacted to type + timestamp only, enforced in the shaper with a redact-by-default rule for repos not explicitly marked public. GraphQL requires a token — without one (e.g. local dev before provisioning a secret) the endpoint returns an empty log and null counts. `GITHUB_PORTFOLIO_TOKEN` must be a **classic** PAT with `repo` + `read:user` scopes: fine-grained PATs are bounded to one resource owner, so GitHub silently omits org-owned private activity — no fine-grained permission fixes this. GitHub API access lives in `src/github/` with three seams — adding a feature is additive:
- `client.ts` — shared `githubFetch` (base URL, required headers, auth, error mapping) and `getGithubToken` (reads the Secrets Store binding, falls back to unauthenticated in local dev)
- one pure shaper module per feature (e.g. `latestActivity.ts`) with co-located fixture tests — no fetch or Hono imports
- `routes.ts` — chained sub-app mounted at `/github` in index.ts via `.route()`, which preserves RPC types

The frontend consumes it client-side through the typed client in `src/lib/api.ts` (see the `/api/*` proxy note above), which derives response DTO types from `AppType` via `InferResponseType` — the backend exports `AppType` and nothing else. The single `/github/activity` endpoint returns everything at once (`{ log, contributions }`); consumers are the homepage `LatestActivity.svelte` widget (first log entry + counts) and the `/activity` page (full client-rendered git log), both built on the shared `ActivityLine.svelte` and `ContributionsSummary.svelte`.

## Testing

Bun's built-in test runner. Tests are co-located with source files (`*.test.ts` next to the code they test); route-level tests live in `src/tests/` (e.g. sitemap). Snapshots live in `__snapshots__/*.snap`.

```typescript
import { describe, it, expect } from "bun:test";
```

## Tooling

- **Formatter:** oxfmt (no config file, uses defaults)
- **Linter:** oxlint (no config file, uses defaults, lints `src/` only)
- **No Prettier or ESLint** — uses Rust-based tooling exclusively
- **Engine constraint:** `.npmrc` has `engine-strict=true`, requires Bun v1+

## CI Pipeline (.github/workflows/CI.yaml)

Jobs run on push to main, PRs, and weekly schedule:
1. **oxfmt** — format check
2. **oxlint** — lint (depends on oxfmt)
3. **svelte-check** — type checking (depends on oxfmt)
4. **test** — unit tests (depends on oxfmt, syncs SvelteKit first)
5. **build** — production build + upload artifact (depends on oxlint, svelte-check, test)
6. **CodeQL** — security analysis (independent)

Deploy job exists but is commented out.
