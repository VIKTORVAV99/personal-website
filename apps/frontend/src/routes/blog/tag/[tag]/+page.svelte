<script lang="ts">
  import type { PageData } from './$types';
  import TagListing from "./TagListing.svelte";

  let { data }: { data: PageData } = $props();
</script>

<TagListing {data} />
