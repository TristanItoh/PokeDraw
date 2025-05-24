<script>
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<div
  in:fly={{ x: 300, duration: 600, easing: quintOut }}
  out:fly={{ x: -300, duration: 600, easing: quintOut }}
>
  <slot />
</div>