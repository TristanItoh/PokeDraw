<script>
  import '../app.css';
  import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Global background elements -->
<div class="fixed inset-0 bg-amber-200" style="z-index: -1;"></div>
<AnimatedBackground />

<!-- Page content wrapper with transition -->
<div class="min-h-screen relative overflow-hidden" style="z-index: 1;">
  {#key $page.url.pathname}
    <div
      class="absolute w-full"
      in:fly={{ x: 300, duration: 400, easing: quintOut }}
      out:fly={{ x: -300, duration: 400, easing: quintOut }}
    >
      <slot />
    </div>
  {/key}
</div>

<style>
  div :global(.min-h-screen) {
    min-height: 100vh;
    position: relative;
    width: 100%;
    top: 0;
    left: 0;
  }
</style>
