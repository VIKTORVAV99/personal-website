<script lang="ts">
  import Highlight from "$components/Highlight.svelte";
  // heading: optional visually-hidden page <h1>.
  let {
    path,
    heading,
    subtitle,
    prefix = "~/",
  }: { path: string; heading?: string; subtitle?: string; prefix?: string } = $props();
</script>

<div class="w-full flex flex-col gap-2 border-b border-surface-700 pb-6">
  {#if heading}
    <h1 class="sr-only">{heading}</h1>
  {/if}
  <div class="font-mono break-all text-4xl font-bold text-surface-100" aria-hidden="true">
    <Highlight>{prefix[0]}</Highlight>{prefix.slice(1)}{path}
  </div>
  {#if subtitle}
    <p class="text-surface-300 text-lg">{subtitle}</p>
  {/if}
</div>
