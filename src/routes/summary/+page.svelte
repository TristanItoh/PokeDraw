<script>
  import { goto } from '$app/navigation';
  import { userDrawings, chosenPokemonsForDrawing } from '$lib/stores/drawingStore.js';
  import ky from 'ky';

  let drawings = [];
  let showOriginals = false;
  let originalPokemons = [];

  // Subscribe to the userDrawings store to get the user's drawings
  const unsubscribeDrawings = userDrawings.subscribe(value => {
    drawings = value;
  });

  // Subscribe to the chosenPokemonsForDrawing store to get the Pokémon selected for this game
  const unsubscribeChosen = chosenPokemonsForDrawing.subscribe(async value => {
    if (value.length > 0) {
      // Fetch original Pokémon data
      originalPokemons = value.map(pokemon => ({
        ...pokemon,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
      }));
    }
  });

  function handlePlayAgain() {
    // Clear the drawings from previous games
    userDrawings.set([]);
    goto('/draw');
  }

  function toggleOriginals() {
    showOriginals = !showOriginals;
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-8">
  <h1 class="text-6xl font-bold font-['Fredoka'] text-amber-600 mb-12 select-none">
    {showOriginals ? 'Original Pokémon:' : 'Your Drawings:'}
  </h1>
  <div class="grid grid-cols-4 bg-white rounded-lg shadow-xl divide-x-2 divide-y-2 divide-amber-300 overflow-hidden">
    {#if showOriginals}
      {#each originalPokemons as pokemon, i (pokemon.id)}
        <div class="relative w-64 h-64 cursor-pointer hover:bg-amber-50 transition-colors group">
          <img
            class="w-full h-full object-contain"
            style="image-rendering: pixelated;"
            src={pokemon.spriteUrl}
            alt={pokemon.name}
          />
          <div class="absolute bottom-0 left-0 right-0 p-2 text-center">
            <span class="text-3xl font-['Fredoka'] text-amber-300 capitalize group-hover:text-amber-300 transition-colors">
              {pokemon.name}
            </span>
          </div>
        </div>
      {/each}
    {:else}
      {#each drawings as drawing, i (drawing.pokemonName)}
        <div class="relative w-64 h-64 cursor-pointer hover:bg-amber-50 transition-colors group">
          <img
            class="w-full h-full object-contain"
            style="image-rendering: pixelated;"
            src={drawing.imageDataUrl}
            alt={`Your drawing of ${drawing.pokemonName}`}
          />
          <div class="absolute bottom-0 left-0 right-0 p-2 text-center">
            <span class="text-3xl font-['Fredoka'] text-amber-300 capitalize group-hover:text-amber-300 transition-colors">
              {drawing.pokemonName}
            </span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <div class="flex flex-row gap-4">
    <button on:click={handlePlayAgain} class="rounded-2xl w-60 h-20 bg-green-500 p-2 mt-10 text-white text-3xl font-['Fredoka'] hover:bg-green-600 transition-colors flex items-center justify-center no-underline">
      Play Again!
    </button>
    <button on:click={toggleOriginals} class="rounded-2xl w-60 h-20 bg-blue-400 p-2 mt-10 text-white text-3xl font-['Fredoka'] hover:bg-blue-600 transition-colors flex items-center justify-center no-underline">
      {showOriginals ? 'See Yours' : 'See Originals'}
    </button>
  </div>
</div>