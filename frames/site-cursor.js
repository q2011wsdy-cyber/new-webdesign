/**
 * 参考 azumbrunnen.me：空白处为圆形光标，悬停文本区域为竖线文本光标（caret）。
 * cur: { x, y, mode: 'default'|'text'|'link', visible }
 */
function getSiteCursorStyle(cur, C, dark) {
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const base = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 200,
    left: cur.x,
    top: cur.y,
    transform: 'translate(-50%,-50%)',
    transition:
      `width 0.22s ${ease}, height 0.22s ${ease}, border-radius 0.22s ${ease}, ` +
      `background 0.15s ease, border 0.15s ease, opacity 0.12s ease, box-shadow 0.15s ease`,
    opacity: cur.visible ? 1 : 0,
    boxSizing: 'border-box',
  };

  if (cur.mode === 'link') {
    return {
      ...base,
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: C.accent,
      border: 'none',
      boxShadow: dark
        ? '0 0 0 1px rgba(255,255,255,0.12)'
        : '0 0 0 1px rgba(0,0,0,0.08)',
    };
  }

  if (cur.mode === 'text') {
    return {
      ...base,
      width: 2,
      height: 22,
      borderRadius: 1,
      background: C.curText,
      border: 'none',
      boxShadow: 'none',
      animation: 'ascii-caret-blink 1.05s steps(1, end) infinite',
    };
  }

  return {
    ...base,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: dark ? 'rgba(255,255,255,0.94)' : 'rgba(26,23,20,0.9)',
    border: 'none',
    boxShadow: dark
      ? '0 0 0 1px rgba(255,255,255,0.18), 0 2px 12px rgba(0,0,0,0.35)'
      : '0 0 0 1px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.08)',
  };
}

window.getSiteCursorStyle = getSiteCursorStyle;
