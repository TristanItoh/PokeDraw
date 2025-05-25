<script>
  import { onMount } from 'svelte';

  export let width = 500;
  export let height = 500;
  export let brushColor = '#000000';
  export let brushSize = 5;
  export let currentTool = 'brush'; // Add this line

  let canvas;
  let ctx;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let lastKnownPos = { x: 0, y: 0 };
  let undoStack = [];
  let redoStack = [];

  // Save the initial state
  function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // Clear redo stack when new action is performed
  }

  // Load a state from URL
  function loadState(url) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
    };
  }

  function undo() {
    if (undoStack.length > 1) { // Keep at least one state
      redoStack.push(undoStack.pop()); // Move current state to redo stack
      loadState(undoStack[undoStack.length - 1]); // Load previous state
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      const state = redoStack.pop();
      undoStack.push(state);
      loadState(state);
    }
  }

  // Handle keyboard shortcuts
  function handleKeyboard(e) {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (
      (e.key === 'y' && (e.ctrlKey || e.metaKey)) || 
      (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
    ) {
      e.preventDefault();
      redo();
    }
  }

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      saveState(); // Save initial blank state
    }
  });

  // Modify existing drawing functions to save state after changes
  function startDrawing(e) {
    if (currentTool === 'brush') {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      [lastX, lastY] = [
        e.clientX - rect.left,
        e.clientY - rect.top
      ];
      lastKnownPos = { x: lastX, y: lastY };
    } else if (currentTool === 'bucket') {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      floodFill(x, y, brushColor);
      saveState(); // Save state after flood fill
    }
  }

  // Update the floodFill function to be more precise
  function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const startPos = (startY * width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];

    const fillColorRGB = hexToRgb(fillColor);
    
    // If we're already on the target color, don't fill
    if (colorsMatch(startR, startG, startB, fillColorRGB.r, fillColorRGB.g, fillColorRGB.b)) {
      return;
    }

    // Use a Set to track visited pixels more efficiently
    const visited = new Set();
    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      
      const pos = (y * width + x) * 4;
      if (!colorsMatch(pixels[pos], pixels[pos + 1], pixels[pos + 2], startR, startG, startB)) continue;

      // Mark as visited
      visited.add(key);

      // Fill the pixel
      pixels[pos] = fillColorRGB.r;
      pixels[pos + 1] = fillColorRGB.g;
      pixels[pos + 2] = fillColorRGB.b;
      pixels[pos + 3] = 255;

      // Add adjacent pixels
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Make the color matching more precise
  function colorsMatch(r1, g1, b1, r2, g2, b2) {
    const threshold = 5; // Reduced threshold for more precise matching
    return Math.abs(r1 - r2) <= threshold &&
           Math.abs(g1 - g2) <= threshold &&
           Math.abs(b1 - b2) <= threshold;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if the mouse is within canvas bounds
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      ctx.beginPath();
      
      // If we're using the eraser (white), make the line slightly bigger
      ctx.lineWidth = brushColor === '#ffffff' ? brushSize + 4 : brushSize;
      
      // If we're coming back into the canvas, start from the edge
      if (lastX < 0 || lastX > width || lastY < 0 || lastY > height) {
        ctx.moveTo(x, y);
      } else {
        ctx.moveTo(lastX, lastY);
      }
      
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.stroke();
      
      [lastX, lastY] = [x, y];
      lastKnownPos = { x, y };
    } else {
      // Store the last known position even when outside
      lastKnownPos = { 
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y))
      };
    }
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      saveState(); // Save state after drawing ends
    }
  }

  // Handle when mouse leaves the window entirely
  function handleWindowMouseUp() {
    if (isDrawing) {
      stopDrawing();
    }
  }

  export function getDrawingDataURL() {
    return canvas?.toDataURL();
  }

  export function clearCanvas() {
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Export undo/redo functions for parent component
  export const controls = {
    undo,
    redo
  };
</script>

<svelte:window 
  on:mouseup={handleWindowMouseUp}
  on:keydown={handleKeyboard}
/>

<canvas
  bind:this={canvas}
  {width}
  {height}
  on:mousedown={startDrawing}
  on:mousemove={draw}
  on:mouseup={stopDrawing}
  class="touch-none"
  style="cursor: {currentTool === 'bucket' ? 'crosshair' : 'default'}"
></canvas>

<style>
  canvas {
    touch-action: none;
  }
</style>