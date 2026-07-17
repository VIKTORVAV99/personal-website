<script lang="ts">
  import { hasContributions, type Contributions } from "$lib/api";

  let { contributions }: { contributions: Contributions } = $props();
</script>

{#if hasContributions(contributions)}
  <hr class="w-full border-surface-700 my-1" />
  <span class="text-surface-300">Contributions in the past {contributions.days} days:</span>
  <span class="text-surface-300">{contributions.publicCount} public</span>
  <span class="text-surface-300">{contributions.privateCount} private</span>
{/if}
