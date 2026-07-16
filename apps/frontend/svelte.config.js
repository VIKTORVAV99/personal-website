import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
