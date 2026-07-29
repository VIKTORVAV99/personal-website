import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));

// SvelteKit defaults version.name to Date.now(), which lands in the client runtime chunk
// and re-hashes every chunk importing it — so every build busts the immutable asset cache
// even when nothing changed. Git tree hashes of the inputs that can alter this bundle keep
// it stable across deploys that don't touch them. `HEAD:path` is repo-root relative.
const treeVersion = () =>
  execSync("git rev-parse HEAD:apps/frontend HEAD:bun.lock", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim()
    .split("\n")
    .map((sha) => sha.slice(0, 12))
    .join("-");

// Every build platform exposes the commit it is building. Less precise than the tree
// hashes — any commit changes it — but still unique per deploy.
const platformCommit = () =>
  process.env.WORKERS_CI_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA;

// The footer displays the first 8 characters of this value.
// Never fall back to a constant. SvelteKit compares this value to decide a new deployment
// happened; freezing it silently disables that, and the failure only shows up as clients
// holding a stale manifest. Failing the build is the lesser evil.
const appVersion = () => {
  try {
    return treeVersion();
  } catch {
    const sha = platformCommit();
    if (sha) return sha.slice(0, 12);
    throw new Error(
      "Cannot derive kit.version.name: no git repository, and no commit SHA in the " +
        "environment (WORKERS_CI_COMMIT_SHA / CF_PAGES_COMMIT_SHA / GITHUB_SHA). Building " +
        "with a constant version would silently break SvelteKit's new-deployment detection.",
    );
  }
};

const shikiHighlighter = await createHighlighter({
  themes: ["github-dark"],
  langs: ["yaml", "javascript", "typescript", "svelte", "html", "css", "bash", "json"],
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
  runes: true,
  extensions: [".svelte", ".md"],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: [".md"],
      smartypants: {
        ellipses: true,
        quotes: true,
        dashes: "oldschool",
      },
      layout: resolve(__dirname, "./src/lib/mdsvex/layout.svelte"),
      highlight: {
        highlighter: (code, lang) => {
          const html = shikiHighlighter.codeToHtml(code, {
            lang: lang || "text",
            theme: "github-dark",
          });
          const escaped = escapeSvelte(html).replace(/`/g, "&#96;").replace(/\$/g, "&#36;");
          return `{@html \`${escaped}\`}`;
        },
      },
    }),
  ],
  kit: {
    adapter: adapter(),
    inlineStyleThreshold: Infinity,
    version: { name: appVersion() },
    prerender: {
      handleUnseenRoutes: ({ routes, message }) => {
        // Pagination routes legitimately produce zero pages until the post
        // count exceeds PAGE_SIZE; fail the build for anything else.
        const unexpected = routes.filter((id) => !id.endsWith("/page/[page]"));
        if (unexpected.length > 0) throw new Error(message);
      },
    },
    alias: {
      $blogs: "./src/blog_posts",
      $components: "./src/components",
      $data: "./src/data",
      $images: "./src/images",
      $lib: "./src/lib",
      $interfaces: "./src/interfaces",
    },
  },
};

export default config;
