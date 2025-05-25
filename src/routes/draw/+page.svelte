<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import ky from 'ky'
  import { chosenPokemonsForDrawing, currentDrawingStep, userDrawings } from '$lib/stores/drawingStore.js'

  let allPokemons = []
  let localChosenPokemons = []

  function getPokemonIdFromUrl(url) {
    const parts = url.split('/')
    return parts[parts.length - 2]
  }

  function getRandomPokemons(arr, num) {
    if (num > arr.length) {
      console.warn('Requested more Pokémon than available. Returning all.')
      return [...arr]
    }
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, num)
  }

  onMount(async () => {
    try {
      const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=151'
      const data = await ky.get(apiUrl).json()
      
      // Process to include ID and spriteUrl
      allPokemons = data.results.map(pokemon => {
        const id = getPokemonIdFromUrl(pokemon.url)
        return {
          ...pokemon,
          id: id,
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        }
      })

      if (allPokemons.length > 0) {
        localChosenPokemons = getRandomPokemons(allPokemons, 4)
      }
    } catch (error) {
      console.error("Failed to fetch Pokémon:", error)
      // Optionally set localChosenPokemons to some default or error state if API fails
    }
  })

  function handleBeginDrawing() {
    if (localChosenPokemons.length === 4) {
      // Clear previous drawings
      userDrawings.set([]);

      chosenPokemonsForDrawing.set(localChosenPokemons)
      currentDrawingStep.set(0)
      goto(`/drawing/${localChosenPokemons[0].id}`)
    } else {
      alert("Please wait for Pokémon to load or refresh the page.")
    }
  }
</script>

<!-- Background elements were here, now they are global -->

<div class="flex flex-col items-center justify-center min-h-screen p-8">
  <h1 class="text-6xl font-bold font-['Fredoka'] text-amber-600 mb-12 select-none">Your Pokedex:</h1>
  <div class="grid grid-cols-4 bg-white rounded-lg shadow-xl divide-x-2 divide-y-2 divide-amber-300 overflow-hidden">
    {#each localChosenPokemons as pokemon, i (pokemon.id)}
      <div class="relative w-64 h-64 cursor-pointer hover:bg-amber-50 transition-colors group">
        <img
          class="w-full h-full object-contain "
          style="image-rendering: pixelated;"
          src={pokemon.spriteUrl}
          alt={pokemon.name}
        />
        <div class="absolute bottom-0 left-0 right-0 p-2  text-center">
          <span class="text-3xl font-['Fredoka'] text-amber-300 capitalize group-hover:text-amber-300 transition-colors">
            {pokemon.name}
          </span>
        </div>
      </div>
    {:else}
      <!-- Show placeholders or loading state while fetching -->
      {#each Array(4) as _, i}
        <div class="w-64 h-64 flex flex-col items-center justify-center p-3 text-2xl font-['Fredoka'] text-gray-400 relative group">
          <div class="w-full h-full p-4 bg-gray-100 rounded flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-300 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-20 text-center">
            <span class="text-xl font-['Fredoka'] text-white capitalize">
              Loading...
            </span>
          </div>
        </div>
      {/each}
    {/each}
  </div>
  <button 
    on:click={handleBeginDrawing} 
    class="rounded-2xl w-60 h-20 bg-green-400 mt-10 p-2 text-white text-4xl font-['Fredoka']
    hover:bg-green-500 hover:translate-y-[4px] hover:shadow-[0_4px_0_rgb(22,163,74)]
    active:translate-y-[4px] active:shadow-[0_4px_0_rgb(22,163,74)]
    transition-all shadow-[0_8px_0_rgb(22,163,74)]
    flex items-center justify-center no-underline">
    Begin!
  </button>
</div>