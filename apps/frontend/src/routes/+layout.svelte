<script lang="ts">
  import iconSVG from "$lib/assets/favicon.svg";
  import appleTouchIcon from "$lib/assets/apple-touch-icon.png";
  import icon48 from "$lib/assets/icon-48x48.png";
  import icon96 from "$lib/assets/icon-96x96.png";
  import "../app.css";
  import Menu from "@lucide/svelte/icons/menu";
  import { afterNavigate } from "$app/navigation";
  import { page, navigating } from "$app/state";
  import Highlight from "$components/Highlight.svelte";
  import { type Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const links = [
    { href: "/", label: "Home", name: "" },
    { href: "/about", label: "About", name: "about" },
    { href: "/activity", label: "Activity", name: "activity" },
    { href: "/history", label: "History", name: "history" },
    { href: "/blog", label: "Blog", name: "blog" },
  ] as const;

  let open = $state(false);
  let mobileMenu = $state<HTMLDetailsElement>();
  const year = $derived(new Date().getFullYear());

  let { children }: { children: Snippet } = $props();

  afterNavigate(() => {
    open = false;
  });

  // Global navigation progress bar. The delay tells a real wait (an SSR route
  // load) from an instant navigation, so prerendered pages don't flash it.
  let showProgress = $state(false);

  $effect(() => {
    if (!navigating.to) {
      showProgress = false;
      return;
    }
    const timer = setTimeout(() => (showProgress = true), 200);
    return () => clearTimeout(timer);
  });

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Indeterminate creep toward ~90% (no built-in fits a horizontal-only scale).
  // The `fade` out reverts to the scaleX(1) base, so completion snaps to full.
  const creep = (_node: Element, { duration = 8000 } = {}) => {
    if (reduceMotion()) return { duration: 0 };
    return { duration, easing: cubicOut, css: (t: number) => `transform: scaleX(${0.9 * t})` };
  };

  // The home link only matches exactly; section links also match their subpages
  // (e.g. /blog/some-post keeps Blog marked active).
  const isActive = (href: string) =>
    href === "/"
      ? page.url.pathname === "/"
      : page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<svelte:window
  onkeydown={(event) => {
    if (open && event.key === "Escape") open = false;
  }}
  onclick={(event) => {
    if (open && mobileMenu && !mobileMenu.contains(event.target as Node)) open = false;
  }}
/>

{#snippet navbarLinks()}
  {#each links as link}
    <a
      href={link.href}
      class="text-lg md:text-center whitespace-nowrap max-md:py-2 max-md:px-4 rounded-full underline-offset-4 font-medium min-w-20 outline-none"
      aria-label={link.label}
      aria-current={isActive(link.href) ? "page" : undefined}
    >
      {#if isActive(link.href)}
        <span class="inline-block">&nbsp;</span>>
      {:else}
        cd
      {/if}
      <Highlight>~</Highlight>/{link.name}
    </a>
  {/each}
{/snippet}

<svelte:head>
  <link rel="icon" href={iconSVG} type="image/svg+xml" sizes="any" />
  <link rel="icon" href={icon48} type="image/png" sizes="48x48" />
  <link rel="icon" href={icon96} type="image/png" sizes="96x96" />
  <link rel="apple-touch-icon" href={appleTouchIcon} />
</svelte:head>

{#if showProgress}
  <div
    class="nav-progress"
    aria-hidden="true"
    in:creep
    out:fade={{ duration: reduceMotion() ? 0 : 300, easing: cubicOut }}
  ></div>
{/if}

<!-- #region Header -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded-full glass-surface px-4 py-2 font-mono text-sm"
  >
    Skip to content
  </a>
  <!-- Padding instead of margin: w-full plus horizontal margins would
       overflow the viewport on browsers with classic scrollbars -->
  <header class="sticky top-0 z-10 w-full p-4">
    <!-- Desktop nav -->
    <nav
      aria-label="Main"
      class="hidden md:flex font-mono w-full max-w-4xl mx-auto justify-evenly items-center gap-4 lg:gap-8 py-4 px-4 lg:px-8 rounded-full glass-surface"
    >
      {@render navbarLinks()}
    </nav>
    <!-- Mobile nav -->
    <details class="relative md:hidden" bind:open bind:this={mobileMenu}>
      <summary
        aria-label="Navigation menu"
        class="list-none cursor-pointer rounded-full glass-surface p-3 text-surface-50 outline-none w-fit"
      >
        <Menu size={24} />
      </summary>
      <nav
        aria-label="Main"
        class="absolute flex flex-col gap-1 justify-start top-full mt-2 z-50 rounded-2xl glass-surface py-4 px-4 font-mono"
      >
        {@render navbarLinks()}
      </nav>
    </details>
  </header>
  <!-- #endregion -->
  <!-- #region Main -->
  <main id="main-content" tabindex="-1" class="flex-1 flex px-4 md:px-8 lg:px-0 flex-col outline-none">
    {@render children()}
  </main>
  <!-- #endregion -->
  <!-- #region Footer -->
  <footer class="flex flex-col w-full mt-8 mb-2 justify-center items-center">
    <small>{year} &copy; Viktor Andersson </small>
    <small
      >Source code licensed under <a
        href="https://github.com/VIKTORVAV99/personal-website/blob/main/LICENSE"
        rel="license">MIT license</a
      ></small
    >
  </footer>
  <!-- #endregion -->

<style>
  .nav-progress {
    position: fixed;
    inset: 0 0 auto 0;
    height: 2px;
    background: var(--color-accent);
    transform-origin: left;
    z-index: 50;
  }
</style>
