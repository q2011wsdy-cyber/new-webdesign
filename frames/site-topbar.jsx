/**
 * 全站共用顶栏：品牌文案、导航、主题切换、吸附与实底背景。
 * 修改此处即可同步首页与各作品详情页。
 */

function getAsciiThemePalette(dark) {
  return dark ? {
    bg: '#0b0b0b', fg: '#e6e6e6', dim: '#666', faint: '#777', mute: '#888',
    bigFg: '#f0e8d8', heading: '#aaa', line: '#2a2a2a', dot: '#222',
    green: '#6fb36f', accent: '#d97757', chatBg: '#0e0e0e',
    linkBorder: '#555', chip: '#333', chipText: '#bbb',
    curText: '#e6e6e6', curDefault: '#6fb36f',
  } : {
    bg: '#ffffff', fg: '#1a1714', dim: '#8a8578', faint: '#7a7568', mute: '#6f6a5d',
    bigFg: '#1a1714', heading: '#5a5448', line: '#c8c2b3', dot: '#d8d2c3',
    green: '#3d7a4a', accent: '#c15528', chatBg: '#ebe6d8',
    linkBorder: '#a8a295', chip: '#c8c2b3', chipText: '#3a3630',
    curText: '#1a1714', curDefault: '#3d7a4a',
  };
}

/** 导航顺序与锚点 id（与首页 section id 一致） */
const SITE_NAV_ROUTES = [
  { label: 'work', hash: 'works' },
  { label: 'writing', hash: 'writing' },
  { label: 'lab', hash: 'lab' },
  { label: 'about', hash: 'about' },
];

/**
 * @param {object} props
 * @param {string} [props.brand] 左侧品牌文案，默认 Super lee
 * @param {object} props.linkProbe 光标 hover
 * @param {boolean} props.dark
 * @param {string} props.theme
 * @param {function} props.setTheme
 * @param {string} [props.homeHrefPrefix] 详情页填 'ascii-terminal.html'，首页留空
 * @param {string} [props.brandHref] 点击品牌回首页，默认 ascii-terminal.html
 * @param {function} [props.anchorClickFactory] 首页：(href) => (e) => void；详情页不传
 */
function SiteTopbar({
  brand = 'Super lee',
  brandHref = 'ascii-terminal.html',
  linkProbe,
  dark,
  theme,
  setTheme,
  lang = 'en',
  setLang,
  homeHrefPrefix = '',
  anchorClickFactory,
}) {
  const C = getAsciiThemePalette(dark);
  const topbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -20,
    marginLeft: -32,
    marginRight: -32,
    marginBottom: 24,
    paddingTop: 20,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 10,
    color: C.faint,
    fontSize: 11,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: C.bg,
  };
  const navLinks = {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    '--glass-x': '50%',
    '--glass-y': '12%',
    '--glass-shadow-x': '0px',
    '--glass-shadow-y': '3px',
    '--glass-low': dark ? 'rgba(255,255,255,.025)' : 'rgba(255,255,255,.05)',
    '--glass-mid': dark ? 'rgba(255,255,255,.11)' : 'rgba(255,255,255,.22)',
    '--glass-glow-core': dark ? 'rgba(255,255,255,.34)' : 'rgba(255,255,255,.96)',
    '--glass-glow-soft': dark ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.24)',
    '--glass-cast': dark ? 'rgba(0,0,0,.48)' : 'rgba(76,61,36,.18)',
    '--glass-edge-dark': dark ? 'rgba(0,0,0,.72)' : 'rgba(0,0,0,.5)',
    '--glass-edge-light': dark ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.5)',
    '--glass-depth': dark
      ? 'inset 0 1.75px 1.75px rgba(0,0,0,.34), inset 0 -1.75px 1.75px rgba(255,255,255,.16), 0 3.5px 1.75px -1.75px rgba(0,0,0,.52), inset 0 0 1.4px 3.5px rgba(255,255,255,.08)'
      : 'inset 0 1.75px 1.75px rgba(0,0,0,.05), inset 0 -1.75px 1.75px rgba(255,255,255,.5), 0 3.5px 1.75px -1.75px rgba(0,0,0,.2), inset 0 0 1.4px 3.5px rgba(255,255,255,.2)',
    '--glass-button-depth': dark
      ? 'inset 0 1px 1.5px rgba(0,0,0,.3), inset 0 -1px 1.5px rgba(255,255,255,.18), 0 2px 1.5px -1px rgba(0,0,0,.4)'
      : 'inset 0 1px 1.5px rgba(0,0,0,.04), inset 0 -1px 1.5px rgba(255,255,255,.58), 0 2px 1.5px -1px rgba(0,0,0,.13)',
  };
  const moveGlassLight = (e) => {
    const node = e.currentTarget;
    const rect = node.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    node.style.setProperty('--glass-x', `${(x * 100).toFixed(1)}%`);
    node.style.setProperty('--glass-y', `${(y * 100).toFixed(1)}%`);
    node.style.setProperty('--glass-shadow-x', `${((.5 - x) * 5).toFixed(2)}px`);
    node.style.setProperty('--glass-shadow-y', `${(2 + (.5 - y) * 4).toFixed(2)}px`);
  };
  const resetGlassLight = (e) => {
    const node = e.currentTarget;
    node.style.setProperty('--glass-x', '50%');
    node.style.setProperty('--glass-y', '12%');
    node.style.setProperty('--glass-shadow-x', '0px');
    node.style.setProperty('--glass-shadow-y', '3px');
  };

  return (
    <div style={topbarStyle}>
      <style>{`
        .site-liquid-controls {
          position: relative;
          isolation: isolate;
          padding: 4px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(-75deg, var(--glass-low), var(--glass-mid), var(--glass-low));
          box-shadow:
            var(--glass-depth),
            var(--glass-shadow-x) var(--glass-shadow-y) 9px -4px var(--glass-cast);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          transition:
            --glass-x 140ms cubic-bezier(.16,1,.3,1),
            --glass-y 140ms cubic-bezier(.16,1,.3,1),
            box-shadow 180ms ease;
        }
        .site-liquid-controls::before {
          content: '';
          position: absolute;
          z-index: 0;
          inset: 1px;
          border-radius: inherit;
          background: radial-gradient(
            circle 38px at var(--glass-x) var(--glass-y),
            var(--glass-glow-core) 0%,
            var(--glass-glow-soft) 38%,
            transparent 72%
          );
          opacity: .16;
          transition: opacity 280ms ease;
          pointer-events: none;
        }
        .site-liquid-controls:hover::before {
          opacity: .86;
        }
        .site-liquid-controls::after {
          content: '';
          position: absolute;
          z-index: 3;
          inset: -.5px 0 0 -.5px;
          padding: 1px;
          border-radius: inherit;
          background:
            radial-gradient(
              circle 28px at var(--glass-x) var(--glass-y),
              var(--glass-edge-light),
              transparent 72%
            ),
            conic-gradient(
              from -75deg,
              var(--glass-edge-dark), transparent 5%, transparent 40%,
              var(--glass-edge-dark) 50%, transparent 60%, transparent 95%,
              var(--glass-edge-dark)
            ),
            linear-gradient(var(--glass-edge-light), var(--glass-edge-light));
          box-shadow: inset 0 0 0 .5px var(--glass-edge-light);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .site-liquid-button {
          position: relative;
          z-index: 1;
          height: 34px;
          min-width: 46px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          box-shadow: none;
          transition:
            transform 240ms cubic-bezier(.16,1,.3,1),
            background 240ms ease,
            box-shadow 240ms ease;
        }
        .site-liquid-button:hover {
          background: linear-gradient(-75deg, var(--glass-low), var(--glass-mid), var(--glass-low));
          box-shadow: var(--glass-button-depth);
          transform: scale(1.02);
        }
        .site-liquid-button:active {
          transform: scale(.96);
        }
        @media (prefers-reduced-motion: reduce) {
          .site-liquid-controls,
          .site-liquid-button { transition: none; }
        }
        @media (hover: none) {
          .site-liquid-controls::before { opacity: .26; }
        }
      `}</style>
      <a
        href={brandHref}
        {...linkProbe}
        style={{ color: C.faint, textDecoration: 'none', fontSize: 14, lineHeight: 1 }}
        aria-label="回到首页">
        {brand}
      </a>
      <div
        className="site-liquid-controls"
        style={navLinks}
        onPointerMove={moveGlassLight}
        onPointerLeave={resetGlassLight}>
        <button
          className="site-liquid-button"
          {...linkProbe}
          type="button"
          onClick={() => setLang && setLang(lang === 'en' ? 'zh' : 'en')}
          style={{
            color: C.mute,
            padding: '0 9px',
            cursor: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
          aria-label={lang === 'en' ? '切换为中文' : 'Switch to English'}>
          {lang === 'en' ? '中' : 'EN'}
        </button>
        <button
          className="site-liquid-button"
          {...linkProbe}
          type="button"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          style={{
            color: C.mute,
            padding: '0 9px',
            cursor: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 0,
          }}
          aria-label={dark ? '切换为浅色' : '切换为深色'}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

window.getAsciiThemePalette = getAsciiThemePalette;
window.SITE_NAV_ROUTES = SITE_NAV_ROUTES;
window.SiteTopbar = SiteTopbar;
