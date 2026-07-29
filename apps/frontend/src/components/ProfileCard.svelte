<script lang="ts">
  // @ts-expect-error — Vite enhanced:img query string not resolvable by svelte-check
  import portrait from "$images/Viktor_Andersson.jpeg?w=96;192&enhanced";
  import Link from "$components/Link.svelte";
  import { SITE_AUTHOR, SOCIAL_LINKS } from "$lib/config";

  let { as = "h2" }: { as?: "h1" | "h2" } = $props();
</script>

<div class="flex gap-8 items-center w-full">
  <enhanced:img
    src={portrait}
    alt={`Portrait of ${SITE_AUTHOR}`}
    class="rounded-full w-24 h-24 min-w-24 min-h-24 object-cover"
    fetchpriority="high"
  />
  <div class="flex flex-col gap-0.5">
    <svelte:element this={as} class="text-2xl">{SITE_AUTHOR}</svelte:element>
    <p class="text-base text-surface-300">Software Engineer</p>
    <p class="text-sm text-surface-300">Malmö, Sweden</p>
    <div class="flex flex-wrap gap-4 text-sm mt-1">
      {#each SOCIAL_LINKS as social}
        <Link href={social.href} rel={social.rel} mono>{social.label}</Link>
      {/each}
    </div>
  </div>
</div>
