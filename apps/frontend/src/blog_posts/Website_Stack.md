---
title: "Website: Tech Stack - Building a personal website with SvelteKit and Cloudflare Workers"
date: 2026-03-29
last_updated: 2026-03-30
description: "A deep dive into the technical stack behind this website, focusing on SvelteKit, MDsveX for markdown blog posts, TailwindCSS v4, and Cloudflare Workers hosting."
tags: ["SvelteKit", "MDsveX", "TailwindCSS", "Cloudflare", "Vite"]
---

**TL;DR:** Svelte and SvelteKit for the framework; TailwindCSS v4 for styling; MDsveX for markdown blog posts; Vite and Oxc for dev tooling; Cloudflare Workers for hosting and domain management.

## Core stack

### Framework: Svelte and SvelteKit

I've tried both Angular and React extensively before, but Angular felt a bit heavy for the task and React just isn't opinionated enough (no batteries included). So, it was time for something new. I made this choice years ago but didn't build a blog before. After my [website revamp](/blog/hello-world) a week or so ago I decided it was time to make a blog post about it.

So I picked Svelte, or more accurately SvelteKit, the meta framework around Svelte that comes with all the features I need. Vue was also in the running but Svelte's syntax and SvelteKit's features won me over. It was as similar to pure HTML and JS I could find at the time and the fact that SvelteKit compiles all the code means it sends less code to the browser which is just a win for everyone involved.

|                      | [Angular](https://angular.dev) | [React](https://react.dev) | [Vue](https://vuejs.org) | [Svelte](https://svelte.dev) |
| -------------------- | ------------------------------ | -------------------------- | ------------------------ | ---------------------------- |
| Meta framework       | Built-in                       | Next.js (third-party)      | Nuxt (third-party)       | SvelteKit (official)         |
| Batteries included   | Yes                            | No (via Next.js)           | Partial (via Nuxt)       | Yes (via SvelteKit)          |
| Bundle size          | High                           | Medium                     | Medium                   | Low (compiler)               |
| HTML closeness       | Low                            | Low (JSX)                  | High                     | High                         |
| Rendering options    | SSR, SSG, CSR                  | CSR (SSR/SSG via Next.js)  | CSR (SSR/SSG via Nuxt)   | SSR, SSG, CSR, prerendered   |
| Reactivity           | Signals                        | Hooks + state libs         | Proxy-based refs         | Compiler-based (runes)       |
| Update pace (months) | ~6                             | ~24                        | ~24                      | ~18                          |

Angular updates way too frequently for my taste and the bundle size is just too big for a personal website, even though I do like the options it provides out of the box. React on the other hand doesn't provide enough out of the box to be a real candidate without several other NPM packages and I wanted to try something new anyway.

Vue was the biggest contender but SvelteKit being made by the same team as Svelte was a big benefit over the Vue and Nuxt split. The lower bundle size and compiler-based approach was also more interesting to me. On top of that pre-rendering pages would give amazing performance which was something I really wanted to focus on. Another nice thing is that Svelte's built-in reactivity and runes handle state so well that I don't need any third-party state management libraries. One less dependency to worry about.

### CSS Framework: TailwindCSS v4

For CSS I really had 3 different options to choose from:

|                  | Style tags           | [TailwindCSS](https://tailwindcss.com) | [CSS Modules](https://github.com/css-modules/css-modules) |
| ---------------- | -------------------- | -------------------------------------- | --------------------------------------------------------- |
| Scoping          | Component (built-in) | Global utilities                       | Component (automatic)                                     |
| Reusability      | Low (copy-paste)     | High (utility classes)                 | Medium (composable)                                       |
| Setup complexity | None                 | Plugin required                        | Plugin required                                           |

I chose Tailwind because I wanted something more than just plain CSS in style tags which are hard to maintain and re-use across components. So it was now between CSS Modules and Tailwind. As I already had prior experience with Tailwind and really liked it I went with that. Would really love to try CSS Modules for the next project though (if they are still relevant, you never know these days).

### Markdown Preprocessor

For the markdown preprocessor for the blog posts it was a clear choice to go with [MDsveX](https://mdsvex.pngwn.io), it has without a doubt the best integration with SvelteKit and even provides a plugin for the SvelteKit CLI if you need it.

But the most interesting thing is that you can inline Svelte components in the markdown to do cool interactive stuff... I am currently using this together with a blank MDsveX template to replace all `<a>` tags to my custom `<Link>` tag which automatically adds an icon to signal if it's an external link or not. Can't wait to do something more interactive with it though! Another cool feature I use is YAML frontmatter, something MDsveX has support for by default and is exposed as a metadata prop in Svelte. For example this is the frontmatter for this post:

```yaml
---
title: "Website: Stack - Building a personal website with SvelteKit and Cloudflare Workers"
date: 2026-03-25
last_updated: 2026-03-25
description: "A deep dive into the technical stack behind this website, focusing on SvelteKit, MDsveX for markdown blog posts, TailwindCSS v4, and Cloudflare Workers hosting."
tags: ["SvelteKit", "MDsveX", "TailwindCSS", "Cloudflare", "Vite"]
---
```

This YAML is converted to Svelte props which I then use for the blog post title, description, dates and tag links.

MDsveX also exposes the raw and formatted text as props. The raw text is what is driving the reading time calculations while the formatted text is what you are reading now.

Using markdown files with frontmatter also means there's no need for a database or a headless CMS. Everything lives in the git repo which keeps the whole setup simple and free to host.

## Dev tools

### Vite

[Vite](https://vite.dev) was not really a choice I made since it's what is powering SvelteKit but it's the choice I would have made anyway due to its speed and simplicity. It also helped that Tailwind and MDsveX have plugins for Vite that just make the integration really simple.

### Oxfmt and Oxlint

I used to use [Prettier](https://prettier.io) and [ESLint](https://eslint.org) but recently switched to [Oxfmt](https://oxc.rs/docs/formatter) and [Oxlint](https://oxc.rs/docs/linter). There wasn't a strict need for it, but I wanted to use the fastest tools available. So far it's been working great and is incredibly fast. It was a drop-in replacement switching from Prettier to Oxfmt and from ESLint to Oxlint. There's just one small (or big) exception: Oxfmt doesn't support formatting .svelte files just yet, but there are PRs open for it and issues tracking it right now. So currently I am formatting my .svelte files manually like a caveman... I can't wait for that to become automatic again!

## Domain management and hosting

I use Cloudflare for both domain management and hosting but let's dig into why for both.

### Domain management at Cloudflare

To manage the domain I went with [Cloudflare](https://www.cloudflare.com) for two primary reasons and one secondary reason.
The primary reasons are that their domain costs have zero overhead and they simply charge you the cost that the registry sets, which is very nice since this is just a hobby project. They also have a good interface for domain management and offer many of their features for free.

The secondary reason is that I simply was familiar with their domain and DNS products from my work at [Electricity Maps](https://www.electricitymaps.com).

### Hosting with Cloudflare Workers

For hosting this was a really simple choice and I went with Cloudflare here as well, since I already had the domain and dns configuration it felt like the natural choice. I originally used [Cloudflare Pages](https://pages.cloudflare.com) but recently migrated to [Cloudflare Workers](https://workers.cloudflare.com) without any issues. I had to migrate due to the fact that Pages are [effectively deprecated](https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/#start-with-workers) as Cloudflare has shifted all development to Workers which also support static assets.

While a big part of the motivation was to unify the interface and products I used it also has its advantages. Here they also have a very generous free tier, which is supported by their global datacenters that provide great performance for websites both large and small (like this one). The performance was especially important to me as it allows me to overengineer many aspects of this site and see how fast I can actually make it. The deployment setup is also really straightforward. I push to GitHub, the CI pipeline runs formatting, linting, type checks and tests, and then Cloudflare handles the build and deploys to their edge network.

## Wrap up

That's the full stack behind this website. It's a pretty simple setup but it covers everything I need and performs really well. Next up I'll dig into the performance side of things and just how far you can push a pre-rendered SvelteKit site. If you're curious to see how it all fits together the source code is available on [GitHub](https://github.com/VIKTORVAV99/personal-website). I'm always tweaking things so the repo is probably a bit ahead of what I've written about here.
