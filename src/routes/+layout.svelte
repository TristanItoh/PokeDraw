<script>
	import '../app.css';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Global background elements -->
<div class="fixed inset-0 bg-amber-200" style="z-index: -1;"></div>
<AnimatedBackground />

<!-- Page content wrapper -->
<div class="min-h-screen relative" style="z-index: 1;">
	{@render children()}
</div>
