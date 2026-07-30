<script lang="ts">
  import { version } from "$app/environment";
  import Highlight from "$components/Highlight.svelte";
  import Link from "$components/Link.svelte";
  import { LICENSE_URL, SITE_AUTHOR, SOCIAL_LINKS } from "$lib/config";
  import { CURRENT_YEAR } from "$lib/helpers/currentDate";

  // First 8 chars of kit.version.name — see appVersion() in svelte.config.js.
  const build = version.slice(0, 8);
</script>

{#snippet prompt(command: string)}
  <span class="text-surface-300" aria-hidden="true"><Highlight>~</Highlight> $ {command}</span>
{/snippet}

<footer class="w-full page-gutters mt-8 mb-2">
  <div class="page-width flex flex-col gap-4 font-mono text-sm">
    <hr class="border-surface-700" />

    <div class="flex flex-col gap-1">
      {@render prompt("ls elsewhere/")}
      <ul class="flex flex-wrap gap-x-6 gap-y-1">
        {#each SOCIAL_LINKS as social}
          <li>
            <Link href={social.href} rel={social.rel} class="text-surface-100">{social.label}</Link>
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex flex-col gap-1">
      {@render prompt("cat LICENSE")}
      <p class="flex flex-wrap items-center gap-x-2 text-surface-100">
        <span>
          <Link href={LICENSE_URL} rel="license" aria-label="MIT license">MIT</Link>
          &copy; {CURRENT_YEAR} {SITE_AUTHOR}
        </span>
        <span class="text-surface-300 whitespace-nowrap">
          <span class="sr-only">Build</span>
          <span aria-hidden="true">#</span>
          {build}
        </span>
      </p>
    </div>
  </div>
</footer>
