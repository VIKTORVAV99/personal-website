<script lang="ts">
  // @ts-expect-error — Vite enhanced:img query string not resolvable by svelte-check
  import portrait from "$images/Viktor_Andersson.jpeg?w=96;192&enhanced";
  import Link from "$components/Link.svelte";

  let { as = "h2" }: { as?: "h1" | "h2" } = $props();
</script>

<div class="flex gap-8 items-center w-full">
  <enhanced:img
    src={portrait}
    alt="Portrait of Viktor Andersson"
    class="rounded-full w-24 h-24 min-w-24 min-h-24 object-cover"
    fetchpriority="high"
  />
  <div class="flex flex-col gap-0.5">
    <svelte:element this={as} class="text-2xl">Viktor Andersson</svelte:element>
    <p class="text-base text-surface-300">Software Engineer</p>
    <p class="text-sm text-surface-400">Malmö, Sweden</p>
    <div class="flex flex-wrap gap-4 text-sm mt-1">
      <Link href="https://www.linkedin.com/in/viktor-va-andersson/" mono>open linkedin</Link>
      <Link href="https://github.com/viktorvav99" mono>open github</Link>
    </div>
  </div>
</div>
