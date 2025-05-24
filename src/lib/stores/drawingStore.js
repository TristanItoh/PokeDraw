import { writable } from 'svelte/store';

// Store for the 4 Pokémon chosen for drawing
export const chosenPokemonsForDrawing = writable([]);

// Store for tracking which Pokémon we're currently drawing (0-3)
export const currentDrawingStep = writable(0);

// Store for saving the user's drawings
export const userDrawings = writable([]);

// Later, you might add an array here to store the actual drawings
// export const userDrawings = writable([]); 