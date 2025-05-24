<script>
  import { page } from '$app/stores';
  import { chosenPokemonsForDrawing, currentDrawingStep, userDrawings } from '$lib/stores/drawingStore.js';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import SimpleDrawingCanvas from '$lib/components/SimpleDrawingCanvas.svelte';

  let pokemonsToDraw = [];
  const unsubscribePokemons = chosenPokemonsForDrawing.subscribe(value => {
    pokemonsToDraw = value;
  });

  let step = 0;
  const unsubscribeStep = currentDrawingStep.subscribe(value => {
    step = value;
  });

  let currentPokemon;
  let showMemorizePhase = true;
  let memorizeCountdown = 5;
  let drawingCountdown = 30;
  let memorizeInterval;
  let drawingInterval;
  let canvasComponent;
  let currentColor = '#2c3e50'; // Default color

  const colors = [
    { name: 'Black', value: '#2c3e50' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Yellow', value: '#f1c40f' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Blue', value: '#3498db' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Brown', value: '#795548' },
    { name: 'Pink', value: '#ff838a' },
    { name: 'Eraser', value: '#ffffff' }
  ];

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function clearAllTimers() {
    if (memorizeInterval) clearInterval(memorizeInterval);
    if (drawingInterval) clearInterval(drawingInterval);
  }

  function startMemorizePhase() {
    clearAllTimers();
    showMemorizePhase = true;
    memorizeCountdown = 5;
    if (canvasComponent) canvasComponent.clearCanvas();
    memorizeInterval = setInterval(() => {
      memorizeCountdown -= 1;
      if (memorizeCountdown <= 0) {
        clearInterval(memorizeInterval);
        showMemorizePhase = false;
        startDrawingPhase();
      }
    }, 1000);
  }

  function startDrawingPhase() {
    clearAllTimers();
    showMemorizePhase = false;
    drawingCountdown = 30;
    drawingInterval = setInterval(() => {
      drawingCountdown -= 1;
      if (drawingCountdown <= 0) {
        saveAndNext(true);
      }
    }, 1000);
  }

  $: {
    if ($page.params.id && pokemonsToDraw && pokemonsToDraw.length > 0) {
      const pokemonIdFromRoute = $page.params.id;
      const newPokemon = pokemonsToDraw.find(p => p.id.toString() === pokemonIdFromRoute);
      
      if (newPokemon && (!currentPokemon || newPokemon.id !== currentPokemon.id)) {
        currentPokemon = newPokemon;
        startMemorizePhase();
      }
      
      const storeStep = pokemonsToDraw.findIndex(p => p.id.toString() === pokemonIdFromRoute);
      if (storeStep !== -1 && step !== storeStep) {
        currentDrawingStep.set(storeStep);
      }
    } else if (pokemonsToDraw && pokemonsToDraw.length > 0 && step < pokemonsToDraw.length && !$page.params.id) {
        goto(`/drawing/${pokemonsToDraw[step].id}`, { replaceState: true });
    }
  }

  function saveAndNext(isAutoNext = false) {
    if (!currentPokemon) return;
    clearAllTimers();

    const drawingData = canvasComponent?.getDrawingDataURL();
    if (drawingData) {
      console.log(`Drawing for ${currentPokemon.name} (auto-next: ${isAutoNext}):`, drawingData.substring(0, 50) + '...');
      userDrawings.update(drawings => {
        const existingIndex = drawings.findIndex(d => d.pokemonId === currentPokemon.id);
        if (existingIndex !== -1) {
          drawings[existingIndex] = { pokemonId: currentPokemon.id, pokemonName: currentPokemon.name, imageDataUrl: drawingData };
        } else {
          drawings.push({ pokemonId: currentPokemon.id, pokemonName: currentPokemon.name, imageDataUrl: drawingData });
        }
        return drawings;
      });
    } else {
      console.warn("Could not get drawing data.");
    }
    
    const nextStep = step + 1;
    if (nextStep < pokemonsToDraw.length) {
      currentDrawingStep.set(nextStep);
      goto(`/drawing/${pokemonsToDraw[nextStep].id}`);
    } else {
      goto('/summary');
    }
  }

  onMount(() => {
    if (pokemonsToDraw.length === 0) {
      goto('/draw'); 
      return;
    }

    return () => {
      unsubscribePokemons();
      unsubscribeStep();
      clearAllTimers();
    };
  });

  onDestroy(() => {
    clearAllTimers();
  });

</script>

<div class="flex flex-col items-center justify-center min-h-screen p-8 text-center">
  {#if currentPokemon}
    {#if showMemorizePhase}
      <div class="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold font-['Fredoka'] text-amber-700">
        {formatTime(memorizeCountdown)}
      </div>
      <h1 class="text-6xl font-bold font-['Fredoka'] text-amber-600 mb-8 capitalize">
        Memorize: {currentPokemon.name}!
      </h1>
      <div class="w-[400px] h-[400px] bg-white border-4 border-amber-400 rounded-lg shadow-xl mb-8 flex items-center justify-center">
        <img 
          src={currentPokemon.spriteUrl} 
          alt="Sprite of {currentPokemon.name}" 
          class="w-full h-full object-contain" 
          style="image-rendering: pixelated;"
        />
      </div>
    {:else}
      <!-- Drawing Phase -->
      <div class="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold font-['Fredoka'] text-red-600">
        {formatTime(drawingCountdown)}
      </div>
      <h1 class="text-6xl font-bold font-['Fredoka'] text-amber-600 mb-8 capitalize mt-14">
        Draw: {currentPokemon.name}!
      </h1>
      <div class="w-[400px] h-[400px] border-4 border-amber-400 rounded-lg shadow-xl mb-4 overflow-hidden">
        <SimpleDrawingCanvas 
          bind:this={canvasComponent} 
          width={492} 
          height={392} 
          brushColor={currentColor}
          brushSize={8}
        />
      </div>
      <div class="flex gap-2 justify-center mb-8">
        {#each colors as color}
          <button
            class="w-10 h-10 rounded-full shadow-md transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
            style="background-color: {color.value}; {currentColor === color.value ? 'transform: scale(1.1);' : ''}"
            on:click={() => currentColor = color.value}
            title={color.name}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <p class="text-2xl text-gray-500">Loading Pokémon data...</p>
  {/if}
</div> 