<script lang="ts">
  let { publicCount, privateCount }: { publicCount: number; privateCount: number } = $props();
</script>

<hr class="w-full border-surface-500 my-1" />
<span class="text-surface-400">Contributions in the past week:</span>
<span class="text-surface-400">{publicCount} public</span>
<span class="text-surface-400">{privateCount} private</span>
