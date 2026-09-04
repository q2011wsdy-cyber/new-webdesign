/**
 * 全站共用顶栏：品牌文案、导航、主题切换、吸附与实底背景。
 * 修改此处即可同步首页与各作品详情页。
 */

function getAsciiThemePalette(dark) {
  return {
    bg: 'var(--color-bg)', fg: 'var(--color-fg)', dim: 'var(--color-dim)',
    faint: 'var(--color-faint)', mute: 'var(--color-muted)', bigFg: 'var(--color-display)',
    heading: 'var(--color-heading)', line: 'var(--color-line)', dot: 'var(--color-dot)',
    green: 'var(--color-success)', accent: 'var(--color-accent)', chatBg: 'var(--color-chat-bg)',
    linkBorder: 'var(--color-link-border)', chip: 'var(--color-chip)', chipText: 'var(--color-chip-text)',
    curText: 'var(--color-cursor-text)', curDefault: 'var(--color-cursor-default)',
  };
}

/** 导航顺序与锚点 id（与首页 section id 一致） */
const SITE_NAV_ROUTES = [
  { label: 'work', hash: 'works' },
  { label: 'writing', hash: 'writing' },
  { label: 'lab', hash: 'lab' },
  { label: 'about', hash: 'about' },
];

function ScrambledBrand({ text, linkProbe = {} }) {
  const [displayText, setDisplayText] = React.useState(text);
  const [isScrambling, setIsScrambling] = React.useState(false);
  const timerRef = React.useRef(0);
  const runIdRef = React.useRef(0);

  React.useEffect(() => {
    setDisplayText(text);
    return () => window.clearInterval(timerRef.current);
  }, [text]);

  const scramble = (event) => {
    if (linkProbe.onMouseEnter) linkProbe.onMouseEnter(event);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.clearInterval(timerRef.current);
    const runId = ++runIdRef.current;
    const chars = 'x.x';
    const revealFrames = text.split('').map((character) => character === ' ' ? 0 : 4 + Math.floor(Math.random() * 11));
    let frame = 0;
    setIsScrambling(true);
    timerRef.current = window.setInterval(() => {
      if (runId !== runIdRef.current) return;
      setDisplayText(text.split('').map((character, index) => {
        if (character === ' ' || frame >= revealFrames[index]) return character;
        return chars[(index * 7 + frame * 3) % chars.length];
      }).join(''));
      frame += 1;
      if (frame >= 15) {
        window.clearInterval(timerRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 30);
  };

  return (
    <span
      className={`site-scrambled-brand${isScrambling ? ' is-scrambling' : ''}`}
      onMouseEnter={scramble}
      onMouseLeave={linkProbe.onMouseLeave}
      onMouseMove={linkProbe.onMouseMove}
      style={{ display: 'inline-block', minWidth: `${text.length}ch`, whiteSpace: 'pre' }}
      aria-hidden="true">
      {displayText}
    </span>
  );
}

/**
 * @param {object} props
 * @param {string} [props.brand] 左侧品牌文案，默认 Super lee
 * @param {object} props.linkProbe 光标 hover
 * @param {boolean} props.dark
 * @param {string} props.theme
 * @param {function} props.setTheme
 * @param {string} [props.closeHref] 详情页关闭入口；传入后显示在右侧控制组
 * @param {string} [props.homeHrefPrefix] 详情页填 'ascii-terminal.html'，首页留空
 * @param {string} [props.brandHref] 点击品牌回首页，默认 ascii-terminal.html
 * @param {function} [props.anchorClickFactory] 首页：(href) => (e) => void；详情页不传
 * @param {function} [props.closeOnClick] 详情页关闭动画完成后跳转；不传时保持普通链接
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
  closeHref,
  closeOnClick,
}) {
  const C = getAsciiThemePalette(dark);
  const liquidControlsRef = React.useRef(null);

  React.useEffect(() => {
    let frame = 0;
    const updateLiquidRefraction = () => {
      frame = 0;
      const shift = -((window.scrollY || window.pageYOffset || 0) % 96) * 0.28;
      if (liquidControlsRef.current) liquidControlsRef.current.style.setProperty('--liquid-scroll-shift', `${shift.toFixed(2)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLiquidRefraction);
    };
    updateLiquidRefraction();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  const topbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 'var(--page-gutter)',
    paddingRight: 'var(--page-gutter)',
    paddingBottom: 10,
    color: C.faint,
    fontSize: 11,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'transparent',
    pointerEvents: 'none',
  };
  const topbarSpacerStyle = {
    height: 72,
    marginTop: -20,
    marginBottom: 24,
    pointerEvents: 'none',
  };
  const navLinks = {
    display: 'flex',
    gap: 0,
    alignItems: 'center',
    pointerEvents: 'auto',
    width: closeHref ? 154 : 'fit-content',
    height: 'var(--control-height)',
    '--liquid-scroll-shift': '0px',
    '--glass-fill': dark ? 'rgba(8,8,8,.24)' : 'rgba(255,255,255,.68)',
    '--glass-edge': dark
      ? 'inset 1.75px 1.75px 1px -1px #fff, inset -1.75px -1.75px 2px -1px #fff, inset 0 0 1px .25px rgba(255,255,255,.1)'
      : 'inset 0 1px 0 rgba(255,255,255,.96), inset 0 -1px 0 rgba(255,255,255,.44)',
    '--glass-sheen': dark
      ? 'radial-gradient(120% 140% at 18% -38%, rgba(255,255,255,.13) 0%, rgba(255,255,255,.03) 36%, rgba(0,0,0,.12) 100%)'
      : 'radial-gradient(120% 140% at 18% -38%, rgba(255,255,255,.96) 0%, rgba(255,255,255,.34) 42%, rgba(222,218,206,.18) 100%)',
    '--glass-outer-shadow': 'var(--shadow-glass)',
    '--glass-surface-background': 'linear-gradient(-75deg, #ffffff0d, #ffffff38, #ffffff0d)',
    '--glass-surface-shadow-hover': 'inset 0 .125em .125em #0000000d, inset 0 -.125em .125em #ffffff80, 0 .15em .05em -.1em #00000040, 0 0 .05em .1em inset #ffffff80, 0 0 0 0 #fff',
    '--glass-surface-shadow-active': 'inset 0 .125em .125em #0000000d, inset 0 -.125em .125em #ffffff80, 0 .125em .125em -.125em #0003, 0 0 .1em .25em inset #fff3, 0 .225em .05em 0 #0000000d, 0 .25em 0 0 #ffffffbf, inset 0 .25em .05em 0 #00000026',
  };

  return (
    <>
      <svg aria-hidden="true" width="0" height="0" focusable="false" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <filter id="site-liquid-lens" x="-20%" y="-35%" width="140%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.055" numOctaves="1" seed="9" result="liquid-noise" />
            <feDisplacementMap in="SourceGraphic" in2="liquid-noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div aria-hidden="true" style={topbarSpacerStyle} />
      <div style={topbarStyle}>
      <style>{`
        .site-scrambled-brand.is-scrambling {
          animation: site-brand-flicker 150ms steps(2, end) 3;
        }
        @keyframes site-brand-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: .68; }
        }
        .site-liquid-controls {
          position: relative;
          isolation: isolate;
          box-sizing: border-box;
          height: var(--control-height);
          padding: 4px;
          border: 0;
          border-radius: var(--radius-pill);
          background: var(--glass-fill);
          box-shadow: var(--glass-outer-shadow);
          -webkit-backdrop-filter: blur(8px) saturate(1.65) contrast(1.08);
          backdrop-filter: blur(8px) saturate(1.65) contrast(1.08);
        }
        @supports (backdrop-filter: url("#site-liquid-lens")) {
          .site-liquid-controls {
            backdrop-filter: url("#site-liquid-lens") blur(8px) saturate(1.65) contrast(1.08);
          }
        }
        .site-liquid-controls::before {
          content: '';
          position: absolute;
          z-index: 0;
          inset: 0;
          border-radius: inherit;
          background: var(--glass-sheen);
          background-position: center var(--liquid-scroll-shift);
          background-size: 125% 175%;
          transition: background-position 180ms cubic-bezier(.16,1,.3,1);
          pointer-events: none;
        }
        .site-liquid-controls::after {
          content: '';
          position: absolute;
          z-index: 3;
          inset: 0;
          border-radius: inherit;
          box-shadow: var(--glass-edge);
          pointer-events: none;
        }
        .site-liquid-button {
          position: relative;
          z-index: 1;
          flex: 1 1 0;
          height: var(--control-inner-height);
          min-width: 0;
          border: 0;
          border-radius: var(--radius-pill);
          background: transparent;
          box-shadow: none;
          transition:
            transform var(--duration-normal) var(--ease-out),
            background var(--duration-normal) var(--ease-out),
            box-shadow var(--duration-normal) var(--ease-out);
        }
        .site-liquid-controls[data-control-count="2"] .site-liquid-button {
          flex: 0 0 auto;
        }
        .site-liquid-button:hover {
          background: var(--glass-surface-background);
          box-shadow: var(--glass-surface-shadow-hover);
        }
        .site-liquid-button:active {
          background: var(--glass-surface-background);
          box-shadow: var(--glass-surface-shadow-active);
          transform: translateY(1px) scale(.98);
        }
        @media (prefers-reduced-motion: reduce) {
          .site-scrambled-brand { animation: none !important; }
          .site-liquid-controls,
          .site-liquid-button { transition: none; }
        }
      `}</style>
      <a
        href={brandHref}
        style={{
          color: C.faint,
          textDecoration: 'none',
          fontSize: 'var(--font-size-brand)',
          lineHeight: 1,
          pointerEvents: 'auto',
        }}
        aria-label="回到首页">
        <ScrambledBrand text={brand} linkProbe={linkProbe} />
      </a>
      <div
        className="site-liquid-controls"
        data-control-count={closeHref ? 3 : 2}
        style={navLinks}
        ref={liquidControlsRef}>
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
        {closeHref && (
          <a
            className="site-liquid-button"
            href={closeHref}
            onClick={closeOnClick}
            {...linkProbe}
            style={{
              color: C.mute,
              padding: '0 9px',
              cursor: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              textDecoration: 'none',
              fontSize: 18,
              fontWeight: 300,
            }}
            aria-label="关闭案例详情，回到作品列表">
            ×
          </a>
        )}
      </div>
      </div>
    </>
  );
}

window.getAsciiThemePalette = getAsciiThemePalette;
window.SITE_NAV_ROUTES = SITE_NAV_ROUTES;
window.SiteTopbar = SiteTopbar;
