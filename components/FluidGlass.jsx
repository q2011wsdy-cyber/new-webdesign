/**
 * DOM adaptation of the React Bits FluidGlass lens interaction.
 * Uses the real card artwork, magnification and SVG displacement; no WebGL/model
 * dependency. Kept separate so the original Three.js renderer can replace it.
 */
function FluidGlass({ children, lensProps = {} }) {
  const hostRef = React.useRef(null);
  const filterId = React.useId().replace(/:/g, '');
  const scale = lensProps.scale || 0.3;

  React.useEffect(() => {
    const host = hostRef.current;
    const tile = host.parentElement;
    const lens = host.querySelector('.fluid-glass-lens');
    const artwork = host.querySelector('.fluid-glass-artwork');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, previous = 0, active = false;
    let x = 0, y = 0, targetX = 0, targetY = 0, radius = 80;
    const zoom = 1.2;
    const measure = () => {
      const { width, height } = tile.getBoundingClientRect();
      radius = Math.min(96, Math.max(64, width * scale / 2));
      lens.style.width = lens.style.height = `${radius * 2}px`;
      artwork.style.width = `${width}px`;
      artwork.style.height = `${height}px`;
    };
    const paint = () => {
      lens.style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      artwork.style.transform = `translate3d(${radius - x * zoom}px, ${radius - y * zoom}px, 0) scale(${zoom})`;
    };
    const tick = now => {
      const delta = Math.min((now - (previous || now - 16)) / 1000, .05);
      previous = now;
      const damping = 1 - Math.exp(-delta / .075);
      x += (targetX - x) * damping;
      y += (targetY - y) * damping;
      paint();
      frame = active && (Math.abs(x - targetX) > .05 || Math.abs(y - targetY) > .05)
        ? requestAnimationFrame(tick) : 0;
    };
    const move = event => {
      if (!active) return;
      const rect = tile.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
    };
    const enter = event => {
      if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
      measure();
      const rect = tile.getBoundingClientRect();
      x = targetX = event.clientX - rect.left;
      y = targetY = event.clientY - rect.top;
      paint();
      active = true;
      host.dataset.active = 'true';
    };
    const leave = () => {
      active = false;
      host.dataset.active = 'false';
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const resize = new ResizeObserver(() => { measure(); paint(); });
    resize.observe(tile);
    tile.addEventListener('pointerenter', enter);
    tile.addEventListener('pointermove', move);
    tile.addEventListener('pointerleave', leave);
    tile.addEventListener('pointercancel', leave);
    motion.addEventListener('change', leave);
    pointer.addEventListener('change', leave);
    window.addEventListener('blur', leave);
    return () => {
      leave(); resize.disconnect();
      tile.removeEventListener('pointerenter', enter);
      tile.removeEventListener('pointermove', move);
      tile.removeEventListener('pointerleave', leave);
      tile.removeEventListener('pointercancel', leave);
      motion.removeEventListener('change', leave);
      pointer.removeEventListener('change', leave);
      window.removeEventListener('blur', leave);
    };
  }, [scale]);

  return <div ref={hostRef} className="fluid-glass" aria-hidden="true">
    <svg width="0" height="0" className="fluid-glass-filter" focusable="false">
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="5" result="ripple" />
          <feDisplacementMap in="SourceGraphic" in2="ripple" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
    <div className="fluid-glass-lens">
      <div className="fluid-glass-surface">
        <div className="fluid-glass-artwork" style={{ filter: `url(#${filterId}) saturate(1.08)` }}>{children}</div>
        <div className="fluid-glass-shine" />
      </div>
    </div>
  </div>;
}
window.FluidGlass = FluidGlass;
