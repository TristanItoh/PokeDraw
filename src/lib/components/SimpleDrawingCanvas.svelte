<script>
  import { onMount } from 'svelte';

  export let width = 500;
  export let height = 500;
  export let brushColor = '#000000';
  export let brushSize = 5;

  let canvas;
  let ctx;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let lastKnownPos = { x: 0, y: 0 };

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    }
  });

  function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    [lastX, lastY] = [
      e.clientX - rect.left,
      e.clientY - rect.top
    ];
    lastKnownPos = { x: lastX, y: lastY };
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
    isDrawing = false;
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
</script>

<svelte:window on:mouseup={handleWindowMouseUp} />

<canvas
  bind:this={canvas}
  {width}
  {height}
  on:mousedown={startDrawing}
  on:mousemove={draw}
  on:mouseup={stopDrawing}
  class="touch-none"
></canvas>

<style>
  canvas {
    touch-action: none;
  }
</style> 