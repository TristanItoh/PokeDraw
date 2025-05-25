<style>
  .bg-circles {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 200vw; /* Ensure it's large enough to cover screen when rotated */
    height: 200vh; /* Ensure it's large enough to cover screen when rotated */
    overflow: hidden;
    z-index: 0;
    transform: translate(-50%, -50%) rotate(15deg);
  }

  .circle-grid-left, .circle-grid-right {
    position: absolute;
    width: 100%; /* Fill the rotated parent */
    height: 100%; /* Fill the rotated parent */
    background-size: 60px 120px;
    background-position: 0 0;
  }

  .circle-grid-left {
    background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 6px, transparent 6px);
    background-position-y: 0px;
    animation: scroll-left 2s linear infinite;
  }

  .circle-grid-right {
    background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 6px, transparent 6px);
    background-position-y: 60px;
    animation: scroll-right 2s linear infinite;
  }

  @keyframes scroll-left {
    0% { background-position-x: 60px; }
    100% { background-position-x: 0px; }
  }

  @keyframes scroll-right {
    0% { background-position-x: 0px; }
    100% { background-position-x: 60px; }
  }
</style>

<div class="bg-circles">
  <div class="circle-grid-left"></div>
  <div class="circle-grid-right"></div>
</div> 