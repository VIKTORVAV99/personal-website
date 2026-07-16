<script lang="ts">
  import { page } from "$app/state";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import StatusPage from "$components/StatusPage.svelte";
  import Highlight from "$components/Highlight.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
</script>

<SEO
  title={`Error ${page.status}`}
  description={page.error?.message || "An unexpected error occurred."}
  noIndex={true}
/>

<StatusPage
  icon={TriangleAlert}
  title={`Error ${page.status}`}
  description={page.error?.message || "Something went wrong. Please try again later."}
  href="/"
>
  {#snippet buttonContent()}cd <Highlight>~</Highlight>/{/snippet}
</StatusPage>
