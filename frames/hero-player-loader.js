// Keep native module loading outside Babel's in-browser JSX transformation.
window.loadHeroAsciiPlayer = function loadHeroAsciiPlayer() {
  return import('../assets/home/ascii-surface/web-player.mjs');
};
