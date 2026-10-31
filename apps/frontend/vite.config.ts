import type { Highlighter } from "shiki";

import adapter from "@sveltejs/adapter-cloudflare";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { FontaineTransform } from "fontaine";
import { escapeSvelte, mdsvex } from "mdsvex";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

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
      "Cannot derive version.name: no git repository, and no commit SHA in the " +
        "environment (WORKERS_CI_COMMIT_SHA / CF_PAGES_COMMIT_SHA / GITHUB_SHA). Building " +
        "with a constant version would silently break SvelteKit's new-deployment detection.",
    );
  }
};

// Created on the first code block, so config loads that compile no markdown
// (svelte-kit sync, svelte-check) skip loading shiki.
let shikiHighlighter: Promise<Highlighter> | undefined;
const getShikiHighlighter = () =>
  (shikiHighlighter ??= import("shiki").then(({ createHighlighter }) =>
    createHighlighter({
      themes: ["github-dark"],
      langs: ["yaml", "javascript", "typescript", "svelte", "html", "css", "bash", "json"],
    }),
  ));

export default defineConfig({
  plugins: [
    FontaineTransform.vite({
      fallbacks: {
        Inter: ["Arial"],
        "Monaspace Neon": ["Courier New"],
      },
      resolvePath: (id) => resolve(import.meta.dirname, "src", id),
    }),
    tailwindcss(),
    imagetools({
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|svg|tiff|webp)(\?.*)?$/,
      exclude: /[?&]enhanced/,
    }),
    enhancedImages(),
    sveltekit({
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
          layout: resolve(import.meta.dirname, "./src/lib/mdsvex/layout.svelte"),
          highlight: {
            highlighter: async (code, lang) => {
              const html = (await getShikiHighlighter()).codeToHtml(code, {
                lang: lang || "text",
                theme: "github-dark",
              });
              const escaped = escapeSvelte(html).replace(/`/g, "&#96;").replace(/\$/g, "&#36;");
              return `{@html \`${escaped}\`}`;
            },
          },
        }),
      ],
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
    }),
  ],
  preview: {
    port: 8888,
  },
  build: {
    rolldownOptions: {
      output: {
        comments: false,
      },
    },
    assetsInlineLimit: (filePath) => {
      // Don't inline favicons as this prevents Google Image Bot from indexing them.
      // Which in turn prevents the favicon from showing up in search results
      // and when sharing links on social media.
      if (
        filePath.endsWith("favicon.svg") ||
        filePath.endsWith("apple-touch-icon.png") ||
        filePath.endsWith("icon-48x48.png") ||
        filePath.endsWith("icon-96x96.png")
      ) {
        return false;
      }
      // For other files use the default limit of 4kb
      return undefined;
    },
  },
});
