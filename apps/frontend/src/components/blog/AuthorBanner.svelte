<script lang="ts">
  // @ts-expect-error — Vite enhanced:img query string not resolvable by svelte-check
  import portrait from "$images/Viktor_Andersson.jpeg?w=40;80&enhanced";
  import { SITE_AUTHOR } from "$lib/config";
</script>

<hr class="border-surface-700" />
<div class="flex items-center gap-3">
  <enhanced:img
    src={portrait}
    alt={`Portrait of ${SITE_AUTHOR}`}
    class="rounded-full w-10 h-10 object-cover"
    fetchpriority="high"
  />
  <a href="/" class="text-base text-surface-100 hover:text-accent transition-colors font-medium">{SITE_AUTHOR}</a>
</div>
<hr class="border-surface-700" />
