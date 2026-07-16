<script lang="ts">
  import { page } from "$app/state";
  import FileQuestionMark from "@lucide/svelte/icons/file-question-mark";
  import StatusPage from "$components/StatusPage.svelte";
  import Highlight from "$components/Highlight.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
</script>

<SEO
  title={`Blog Post Error ${page.status}`}
  description={page.error?.message || "Sorry, there was a problem loading this blog post."}
  noIndex={true}
/>

<StatusPage
  icon={FileQuestionMark}
  title={`Blog Post Error ${page.status}`}
  description={page.error?.message || "Sorry, there was a problem loading this blog post."}
  href="/blog"
>
  {#snippet buttonContent()}cd <Highlight>~</Highlight>/blog{/snippet}
</StatusPage>
