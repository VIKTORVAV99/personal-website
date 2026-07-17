<script lang="ts">
  import Highlight from "$components/Highlight.svelte";
  let { path, subtitle, prefix = "~/" }: { path: string; subtitle?: string; prefix?: string } = $props();
</script>

<div class="w-full flex flex-col gap-2 border-b border-surface-700 pb-6">
  <h1 class="font-mono break-all" aria-label={path || 'Home'}>
    <Highlight>{prefix[0]}</Highlight>{prefix.slice(1)}{path}
  </h1>
  {#if subtitle}
    <p class="text-surface-300 text-lg">{subtitle}</p>
  {/if}
</div>
