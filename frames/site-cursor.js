/** Paul Wong reference: a translucent disc morphs into a narrow text caret. */
const siteCursorReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Sample the reference spring (mass 1, stiffness 390, damping 35).
// CSS transitions remain interruptible when the pointer crosses text rapidly.
const siteCursorSpring = (() => {
  const damping = 35 / 2;
  const frequency = Math.sqrt(390 - damping * damping);
  const samples = Array.from({ length: 41 }, (_, index) => {
    const time = index / 40 * .42;
    const value = 1 - Math.exp(-damping * time) *
      (Math.cos(frequency * time) + damping / frequency * Math.sin(frequency * time));
    return `${index === 40 ? 1 : value.toFixed(5)} ${(index / 40 * 100).toFixed(1)}%`;
  });
  const easing = `linear(${samples.join(', ')})`;
  return CSS.supports('transition-timing-function', easing)
    ? easing : 'cubic-bezier(0.22, 1, 0.36, 1)';
})();

function getSiteCursorStyle(cur, C, dark) {
  const text = cur.mode === 'text';
  const caseHover = cur.mode === 'case';
  return {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 200,
    left: cur.x,
    top: cur.y,
    transform: 'translate(-50%,-50%)',
    transition: siteCursorReducedMotion.matches ? 'none' :
      `width 420ms ${siteCursorSpring}, height 420ms ${siteCursorSpring}, ` +
      `border-radius 420ms ${siteCursorSpring}, opacity 120ms ease`,
    opacity: cur.visible ? 1 : 0,
    boxSizing: 'border-box',
    width: caseHover ? 78 : text ? 2 : 24,
    height: caseHover ? 78 : 24,
    borderRadius: text ? 1 : caseHover ? 39 : 12,
    background: caseHover ? C.accent : 'rgba(255, 255, 255, 0.24)',
    mixBlendMode: caseHover ? 'normal' : 'exclusion',
    backdropFilter: caseHover ? 'none' : 'blur(3px)',
    WebkitBackdropFilter: caseHover ? 'none' : 'blur(3px)',
    border: 'none',
    boxShadow: 'none',
  };
}

window.getSiteCursorStyle = getSiteCursorStyle;
