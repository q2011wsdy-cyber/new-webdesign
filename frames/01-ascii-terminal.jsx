// Frame 01 v2: ASCII Terminal — 带图作品网格 + 浮动 chatbot + 光标变形

if (typeof window.getSiteCursorStyle !== 'function') {
  window.getSiteCursorStyle = function getSiteCursorStyleFallback(cur, C) {
    return {
      position: 'absolute', pointerEvents: 'none', zIndex: 200, left: cur.x, top: cur.y,
      transform: 'translate(-50%,-50%)', opacity: cur.visible ? 1 : 0,
      width: 10, height: 10, borderRadius: '50%', background: (C && C.curDefault) || '#6fb36f',
    };
  };
}

// Low-fi ASCII-ish placeholder "images" — each work gets a unique pattern
const PATTERNS = [
  { bg: '#1a1410', fg: '#d97757', glyph: '▞▚' },
  { bg: '#10181a', fg: '#6fb3a8', glyph: '◢◣' },
  { bg: '#181018', fg: '#b87fd9', glyph: '░▒▓' },
  { bg: '#1a1a10', fg: '#d4c06f', glyph: '╱╲' },
  { bg: '#101a14', fg: '#6fd48e', glyph: '●○' },
  { bg: '#1a1010', fg: '#d96f6f', glyph: '▼▲' },
];

const SELECTED_WORKS_DOTS = [
  [2.08,50.08], [34.08,50.08], [58.049,50.08], [66.049,50.08], [74.049,50.08], [98.018,50.08], [130.018,50.08], [145.986,50.08], [177.986,50.08], [2.08,42.08], [10.08,42.08],
  [26.08,42.08], [34.08,42.08], [50.049,42.08], [82.049,42.08], [98.018,42.08], [122.018,42.08], [145.986,42.08], [169.986,42.08], [2.08,34.08], [18.08,34.08], [34.08,34.08],
  [50.049,34.08], [82.049,34.08], [98.018,34.08], [114.018,34.08], [145.986,34.08], [161.986,34.08], [2.08,26.08], [18.08,26.08], [34.08,26.08], [50.049,26.08], [82.049,26.08],
  [98.018,26.08], [106.018,26.08], [114.018,26.08], [122.018,26.08], [145.986,26.08], [153.986,26.08], [2.08,18.08], [34.08,18.08], [50.049,18.08], [82.049,18.08], [98.018,18.08],
  [130.018,18.08], [145.986,18.08], [161.986,18.08], [2.08,10.08], [34.08,10.08], [50.049,10.08], [82.049,10.08], [98.018,10.08], [130.018,10.08], [145.986,10.08], [169.986,10.08],
  [2.08,2.08], [34.08,2.08], [58.049,2.08], [66.049,2.08], [74.049,2.08], [98.018,2.08], [106.018,2.08], [114.018,2.08], [122.018,2.08], [145.986,2.08], [177.986,2.08],
];

function AsciiHeroSection({ dark, children }) {
  const fg = dark
    ? { textShadow: '0 2px 18px rgba(0,0,0,0.9), 0 0 32px rgba(0,0,0,0.65)' }
    : { textShadow: '0 1px 14px rgba(255,255,255,0.98), 0 0 24px rgba(255,255,255,0.85)' };

  return (
    <div id="about" style={{
      position: 'relative',
      minHeight: 'clamp(500px, 69vh, 560px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      paddingTop: '10vh',
      paddingBottom: '2vh',
    }}>
      <div style={{ ...fg, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function HeroDecodeText({ text, className, delay = 0, duration = 760 }) {
  const [rendered, setRendered] = React.useState(text);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRendered(text);
      return undefined;
    }
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}*+~';
    const characters = Array.from(text);
    const codeTailLength = Math.max(4, Math.round(characters.length * .22));
    let frame = 0;
    let start = 0;
    let lastPaint = -Infinity;

    const tick = (now) => {
      if (!start) start = now;
      const elapsed = now - start;
      const visibleProgress = Math.max(0, Math.min(1, (elapsed - delay) / duration));
      if (elapsed - lastPaint >= 42 || visibleProgress === 1) {
        // Resolve the actual copy while the line is still heavily blurred, so the
        // final sharp frame never exposes a single scrambled glyph or tail.
        const resolveLine = elapsed - delay >= duration * .42 || visibleProgress === 1;
        const tailProgress = Math.max(0, Math.min(1, (elapsed - delay - duration * .04) / (duration * .34)));
        const visibleTailLength = Math.ceil(codeTailLength * (1 - tailProgress));
        const scrambled = characters.map((character) => {
          if (/\s/.test(character)) return character;
          if (resolveLine) return character;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('') + Array.from({ length: visibleTailLength }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        setRendered(scrambled);
        lastPaint = elapsed;
      }
      if (visibleProgress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return <span
    className={`hero-decode ${className || ''}`}
    aria-label={text}
    style={{
      '--hero-decode-duration': `${duration}ms`,
      '--hero-decode-delay': `${delay}ms`,
    }}>
    {rendered}
  </span>;
}

function AsciiTile({ pat, t, k, img, theme, fillCell }) {
  const [hover, setHover] = React.useState(false);
  const tileRef = React.useRef(null);
  const dark = theme === 'dark';
  const resetMotion = (node) => {
    node.style.setProperty('--card-x', '0px');
    node.style.setProperty('--card-y', '0px');
    node.style.setProperty('--card-rx', '0deg');
    node.style.setProperty('--card-ry', '0deg');
  };
  const onPointerMove = (e) => {
    const node = tileRef.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty('--card-x', `${x * 14}px`);
    node.style.setProperty('--card-y', `${y * 10}px`);
    node.style.setProperty('--card-rx', `${y * -2.4}deg`);
    node.style.setProperty('--card-ry', `${x * 3}deg`);
  };
  // 外层 <a> 负责跳转；此处用 div 避免嵌套 <a>
  // fillCell：不规则网格里拉满单元格，不用固定 4:3
  return (
    <div
      ref={tileRef}
      className="work-tile"
      onMouseEnter={() => setHover(true)}
      onMouseMove={onPointerMove}
      onMouseLeave={(e) => {
        setHover(false);
        resetMotion(e.currentTarget);
      }}
      style={{
        display: 'block', textDecoration: 'none',
        background: pat.bg,
        border: 'none',
        borderRadius: 'var(--radius-card)',
        color: pat.fg,
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'none',
        transform: `perspective(1000px) translate3d(var(--card-x, 0px), var(--card-y, 0px), 0) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg)) scale(${hover ? 1.018 : 1})`,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        willChange: 'transform',
        transition: hover
          ? 'transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow .25s ease'
          : 'transform 420ms cubic-bezier(.16,1,.3,1), box-shadow .25s ease',
        ...(fillCell
          ? { height: '100%', minHeight: 140, aspectRatio: 'auto' }
          : { aspectRatio: '4/3' }),
        position: 'relative',
        overflow: 'hidden',
      }}>
      <img
        src={img}
        alt={t}
        draggable={false}
        style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        // 保持原始 4:3 素材完整显示；卡片比例变化时由底色承接余白，不裁切画面。
        objectFit: 'contain',
        cursor: 'none',
        filter: hover ? 'brightness(1.1) contrast(1.05)' : 'brightness(0.92)',
        transition: 'filter .2s, transform .5s cubic-bezier(.16,1,.3,1)',
        transform: hover ? 'scale(1.018)' : 'scale(1)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 30, left: 14, right: 14,
        fontSize: 13, color: '#f0f0f0', letterSpacing: -0.2,
      }}>{t}</div>
      <div style={{
        position: 'absolute', bottom: 10, left: 14, right: 14,
        fontSize: 10, letterSpacing: 1,
      }}>
        <span style={{ color: pat.fg }}>[{k}]</span>
      </div>
    </div>
  );
}

function AsciiTerminal() {
  const SiteTopbar = window.SiteTopbar;
  const [cur, setCur] = React.useState({ x: 0, y: 0, mode: 'default', visible: false });
  const [theme, setTheme] = React.useState(() => {
    return window.getAsciiInitialTheme ? window.getAsciiInitialTheme() : 'light';
  });
  const [chatOpen, setChatOpen] = React.useState(false);
  const [lang, setLang] = React.useState('zh');
  const [leavingCase, setLeavingCase] = React.useState(null);
  const [returnedFromCase, setReturnedFromCase] = React.useState(() => {
    try {
      const returned = sessionStorage.getItem('ascii-case-return-transition') === '1';
      sessionStorage.removeItem('ascii-case-return-transition');
      return returned;
    } catch (_) { return false; }
  });
  const dark = theme === 'dark';
  const C = window.getAsciiThemePalette(dark);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-theme', theme); } catch {}
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  React.useEffect(() => {
    if (!window.watchAsciiAutomaticTheme) return undefined;
    return window.watchAsciiAutomaticTheme(setTheme);
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-lang', lang); } catch {}
  }, [lang]);

  React.useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen]);

  React.useEffect(() => {
    if (!returnedFromCase) return;
    const timer = window.setTimeout(() => setReturnedFromCase(false), 620);
    return () => window.clearTimeout(timer);
  }, [returnedFromCase]);

  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setCur(c => ({ ...c, x: e.clientX - r.left, y: e.clientY - r.top, visible: true }));
    };
    const onLeave = () => setCur(c => ({ ...c, visible: false }));
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const setMode = (m) => setCur(c => ({ ...c, mode: m }));

  const s = {
    wrap: {
      background: C.bg,
      color: C.fg,
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--font-size-body)',
      lineHeight: 1.7,
      width: '100%',
      maxWidth: 'calc(var(--content-max-width) + 64px)',
      margin: '0 auto',
      minHeight: '100%',
      padding: 'var(--page-padding)',
      position: 'relative',
      cursor: 'none',
      transition: 'background-color var(--duration-normal) var(--ease-out), color var(--duration-normal) var(--ease-out)',
    },
    intro: {
      display: 'block',
      gap: 32,
      marginBottom: 0,
      width: 'min(100%, 1120px)',
    },
    bigLine: {
      fontSize: 'clamp(32px, 3.7vw, 43px)', lineHeight: 1.42, color: C.bigFg,
      letterSpacing: -0.3, fontFamily: 'inherit',
      maxWidth: 'min(1120px, 100%)',
    },
    heroLead: {
      display: 'block',
      position: 'relative',
      width: 'fit-content',
      marginBottom: 22,
      fontSize: 'clamp(22px, 2.6vw, 30px)',
      lineHeight: 1.2,
      letterSpacing: 0.6,
      textTransform: 'none',
      color: C.bigFg,
    },
    heroBody: {
      display: 'block',
      fontSize: 'clamp(28px, 2.95vw, 34px)',
      fontWeight: 400,
      lineHeight: 1.5,
      color: C.mute,
      maxWidth: '32ch',
    },
    dim: { color: C.dim },
    accent: { color: C.accent },
    sectionTitle: {
      color: C.faint, fontSize: 11, letterSpacing: 1.5,
      marginTop: 40, marginBottom: 16, textTransform: 'uppercase',
    },
    row: {
      display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px',
      padding: '8px 0', color: C.fg,
    },
    link: {
      color: C.fg, textDecoration: 'none',
      paddingBottom: 1,
    },
    footer: {
      marginTop: 60, paddingTop: 16, borderTop: `1px dashed ${C.line}`,
      color: C.faint, fontSize: 11,
      display: 'flex', justifyContent: 'space-between',
    },
    prompt: { color: C.green, marginRight: 6 },
    // Chat 对话框（由底部按钮弹出）
    chatDock: {
      width: 320,
      maxWidth: '100%',
      background: C.chatBg,
      border: `1px solid ${C.line}`,
      fontSize: 12,
      color: C.chipText,
      boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.55)' : '0 12px 40px rgba(60,50,30,0.2)',
      borderRadius: 2,
    },
    chatHead: {
      display: 'flex', justifyContent: 'space-between',
      padding: '8px 12px', borderBottom: `1px dashed ${C.line}`,
      color: C.faint, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
    },
    chatBody: { padding: '12px 14px', lineHeight: 1.55 },
    chatInput: {
      borderTop: `1px dashed ${C.line}`, padding: '10px 12px',
      color: C.mute, display: 'flex', alignItems: 'center', gap: 6,
    },
  };

  const copy = {
    en: {
      heroLead: "HI, i'm Super Lee",
      heroBody: 'I focus on crafting thoughtful and human-centered digital experiences.',
      heroBodyLines: [
        'I focus on crafting thoughtful and',
        'human-centered digital experiences.',
      ],
      worksTitle: 'selected works',
      writingTitle: 'writing',
      labTitle: 'lab',
      labBody: 'a place for half-baked ideas, generative toys, and tiny tools.',
      footerLeft: '@ 2026 · super lee',
      footerRight: 'v1.0 · updated 2026.07',
      works: [
        { n: '01', t: 'Huolala', y: '2025', k: 'product', pat: PATTERNS[0], img: 'assets/works/01-harbor.jpg', href: 'work-harbor.html' },
        { n: '02', t: 'Pimax', y: '2025', k: 'product', pat: PATTERNS[1], img: 'assets/works/02-spatial.jpg', href: 'work-pimax.html' },
        { n: '03', t: 'AI OS Concept', y: '2024', k: 'concept', pat: PATTERNS[2], img: 'assets/works/03-zixiang.jpg' },
        { n: '04', t: 'OPPO', y: '2024', k: 'product', pat: PATTERNS[3], img: 'assets/works/04-quiet.jpg' },
      ],
    },
    zh: {
      heroLead: "HI, i'm Super Lee",
      heroBody: '一位UX设计师、创造者和构建者，正在探索 AI 如何放大人的想象力。',
      heroBodyLines: [
        '一位UX设计师、创造者和构建者，正在探索',
        'AI 如何放大人的想象力。',
      ],
      worksTitle: 'selected works',
      writingTitle: 'writing',
      labTitle: 'lab',
      labBody: '一个放半成品想法、生成式玩具和微型工具的地方。',
      footerLeft: '@ 2026 · super lee',
      footerRight: 'v1.0 · 更新于 2026.07',
      works: [
        { n: '01', t: '货拉拉', y: '2025', k: 'product', pat: PATTERNS[0], img: 'assets/works/01-harbor.jpg', href: 'work-harbor.html' },
        { n: '02', t: 'pimax', y: '2025', k: 'product', pat: PATTERNS[1], img: 'assets/works/02-spatial.jpg', href: 'work-pimax.html' },
        { n: '03', t: 'ai os 概念探索', y: '2024', k: 'concept', pat: PATTERNS[2], img: 'assets/works/03-zixiang.jpg' },
        { n: '04', t: 'oppo', y: '2024', k: 'product', pat: PATTERNS[3], img: 'assets/works/04-quiet.jpg' },
      ],
    },
  };
  const text = copy[lang] || copy.en;

  const writings = [
    ['On the slow web', '6 min', '2025.03'],
    ['设计系统不是 UI kit', '9 min', '2024.11'],
    ['Designing for cursors', '4 min', '2024.06'],
  ];

  const cursorBlock = window.getSiteCursorStyle(cur, C, dark);

  const textProbe = {
    onMouseEnter: () => setMode('text'),
    onMouseLeave: () => setMode('default'),
  };
  const linkProbe = {
    onMouseEnter: () => setMode('link'),
    onMouseLeave: () => setMode('default'),
  };

  /** 同页 #锚点：显式滚动（#works / #writing / …） */
  const onNavClick = (href) => (e) => {
    if (!href.startsWith('#') || href.length < 2) return;
    const id = href.slice(1);
    const el = document.getElementById(id) || document.querySelector(`[id="${CSS.escape(id)}"]`);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      window.history.replaceState(null, '', href);
    } catch (_) {}
  };

  // 作品详情保留原生链接语义；点击时才接管，留出一小段“卡片进入页面”的过渡。
  const onWorkClick = (href) => (e) => {
    if (!href || href === '#' || leavingCase) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    setLeavingCase(href);
    try { sessionStorage.setItem('ascii-case-transition', '1'); } catch (_) {}
    window.setTimeout(() => { window.location.assign(href); }, 430);
  };

  return (
    <div ref={rootRef} style={s.wrap}>
      <style>{`
        @keyframes cursor-blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }
        @keyframes cur-pulse { 0%,50%{opacity:1} 50.01%,100%{opacity:0.25} }
        @keyframes ascii-caret-blink { 0%, 48% { opacity: 1; } 50%, 100% { opacity: 0.22; } }
        @keyframes avatar-float-up {
          from { opacity: 0; transform: translate3d(-12px, 34px, 0) scale(.72); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        .hero-avatar {
          position: absolute;
          left: min(calc(100% + 18px), calc(100vw - 132px));
          bottom: 6px;
          z-index: 5;
          width: clamp(86px, 8.4vw, 104px);
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: translate3d(-12px, 34px, 0) scale(.72);
          transform-origin: 34% 82%;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        .hero-lead:hover .hero-avatar {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          animation: avatar-float-up 620ms cubic-bezier(.16,1,.3,1) both;
        }
        .hero-avatar img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 34%;
        }
        @keyframes hero-decode-reveal {
          from { opacity: 0; filter: blur(8px); transform: translate3d(0, .82em, 0); }
          58% { opacity: .96; filter: blur(8px); transform: translate3d(0, .12em, 0); }
          to { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0); }
        }
        .hero-decode {
          display: block;
          width: fit-content;
          opacity: 0;
          white-space: nowrap;
          will-change: transform, filter, opacity;
          backface-visibility: hidden;
          animation: hero-decode-reveal var(--hero-decode-duration, 780ms) cubic-bezier(.16,1,.3,1) var(--hero-decode-delay, 0ms) both;
        }
        /* 自定义光标：图片与链接触发区不显系统手型/箭头 */
        img, a, button { cursor: none !important; }
        #about, #works, #writing, #lab, #contact {
          scroll-margin-top: 80px;
        }
        .selected-works-dots {
          animation: selected-works-twinkle var(--dot-duration) ease-in-out var(--dot-delay) infinite alternate;
        }
        @keyframes selected-works-twinkle {
          from { opacity: var(--dot-min-opacity); }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .selected-works-dots { animation: none; }
        }
        /* selected works：两条交错轨道，保留作品尺寸的节奏差。 */
        .work-bento {
          --work-column-gap: 30px;
          --work-row-gap: 30px;
          --work-row: 28px;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: var(--work-row);
          column-gap: var(--work-column-gap);
          row-gap: var(--work-row-gap);
        }
        .work-card {
          min-width: 0;
          min-height: 0;
          isolation: isolate;
          transition: transform 430ms cubic-bezier(.2,.8,.2,1), opacity 260ms ease;
        }
        .work-card.is-leaving {
          position: relative;
          z-index: 3;
          transform: scale(1.035);
        }
        .work-bento.is-transitioning .work-card:not(.is-leaving) {
          opacity: .38;
          transform: scale(.988);
        }
        @keyframes work-grid-return {
          from { opacity: 0; transform: translate3d(0, 16px, 0) scale(.984); filter: blur(2px); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
        }
        .work-bento.is-returning .work-card {
          animation: work-grid-return 540ms cubic-bezier(.16,1,.3,1) both;
        }
        .work-bento.is-returning .work-card:nth-child(2) { animation-delay: 45ms; }
        .work-bento.is-returning .work-card:nth-child(3) { animation-delay: 80ms; }
        .work-bento.is-returning .work-card:nth-child(4) { animation-delay: 115ms; }
        .case-transition-veil {
          position: fixed;
          inset: 0;
          z-index: 180;
          pointer-events: none;
          opacity: 0;
          background: ${C.bg};
          transition: opacity 300ms cubic-bezier(.22,.61,.36,1) 110ms;
        }
        .case-transition-veil.is-visible { opacity: 1; }
        .case-transition-veil::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0 14%, ${C.bg} 68%);
          opacity: .78;
        }
        .work-card:nth-child(1) { grid-column: 1 / span 7; grid-row: 1 / span 11; }
        .work-card:nth-child(2) { grid-column: 8 / span 5; grid-row: 1 / span 7; }
        .work-card:nth-child(3) { grid-column: 8 / span 5; grid-row: 8 / span 10; }
        .work-card:nth-child(4) { grid-column: 1 / span 7; grid-row: 12 / span 7; }
        @media (prefers-reduced-motion: reduce) {
          .work-tile {
            transform: none !important;
            transition: box-shadow .2s ease !important;
          }
          .work-card, .work-card.is-leaving,
          .work-bento.is-transitioning .work-card:not(.is-leaving),
          .case-transition-veil { transition: none !important; transform: none !important; }
          .work-bento.is-returning .work-card { animation: none; }
          .hero-avatar,
          .hero-lead:hover .hero-avatar,
          .hero-decode {
            animation: none;
            transform: none;
            clip-path: none;
            opacity: 1;
            filter: none;
            transition: opacity .16s ease;
          }
        }
        @media (max-width: 1024px) and (min-width: 721px) {
          .work-bento {
            --work-row: 26px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .work-card:nth-child(1) { grid-column: 1; grid-row: 1 / span 11; }
          .work-card:nth-child(2) { grid-column: 2; grid-row: 1 / span 7; }
          .work-card:nth-child(3) { grid-column: 2; grid-row: 8 / span 10; }
          .work-card:nth-child(4) { grid-column: 1; grid-row: 12 / span 7; }
        }
        @media (max-width: 720px) {
          .work-bento { display: flex; flex-direction: column; gap: 30px; }
          .work-card:nth-child(1) { height: clamp(320px, 105vw, 430px); }
          .work-card:nth-child(2) { height: clamp(220px, 70vw, 300px); }
          .work-card:nth-child(3) { height: clamp(300px, 90vw, 380px); }
          .work-card:nth-child(4) { height: clamp(240px, 75vw, 320px); }
        }
      `}</style>

      <SiteTopbar
        brand="Super lee"
        linkProbe={linkProbe}
        dark={dark}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        homeHrefPrefix=""
        anchorClickFactory={onNavClick}
      />

      <AsciiHeroSection dark={dark}>
        <div style={s.intro}>
          <div {...textProbe}>
            <div style={s.bigLine}>
              <span className="hero-lead" style={s.heroLead}>
                <HeroDecodeText key={`lead-${lang}`} text={text.heroLead} className="hero-decode-lead" delay={0} duration={520} />
                <span
                  className="hero-avatar"
                  aria-hidden="true"
                  style={{
                    border: `2px solid ${C.bg}`,
                    background: C.line,
                    boxShadow: dark
                      ? '0 10px 28px rgba(0,0,0,.34)'
                      : '0 10px 28px rgba(55,48,36,.16)',
                  }}>
                  <img src="assets/profile-superlee.jpg" alt="" draggable={false} />
                </span>
              </span>
              <span style={s.heroBody}>
                {text.heroBodyLines.map((line, index) => <HeroDecodeText
                  key={`body-${lang}-${index}`}
                  text={line}
                  className="hero-decode-body"
                  delay={190 + index * 190}
                  duration={520}
                />)}
              </span>
            </div>
          </div>
        </div>
      </AsciiHeroSection>

      {/* Works — asymmetric editorial grid；第一项链到 work-harbor.html */}
      <div
        id="works"
        style={{ ...s.sectionTitle, marginBottom: 'clamp(32px, 4vw, 48px)' }}>
        <svg
          width="181"
          height="53"
          viewBox="0 0 181 53"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={text.worksTitle}
          style={{ display: 'block', width: 'min(140px, 42vw)', height: 'auto' }}
        >
          <defs>
            <filter id="selected-works-round-dots" x="-5%" y="-12%" width="110%" height="124%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="1.15" />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              />
            </filter>
          </defs>
          <path
            filter="url(#selected-works-round-dots)"
            style={{ display: 'none' }}
            d="M4.16016 52.1602H0V48H4.16016V52.1602ZM36.1602 52.1602H32V48H36.1602V52.1602ZM60.1289 52.1602H55.9688V48H60.1289V52.1602ZM68.1289 52.1602H63.9688V48H68.1289V52.1602ZM76.1289 52.1602H71.9688V48H76.1289V52.1602ZM100.098 52.1602H95.9375V48H100.098V52.1602ZM132.098 52.1602H127.938V48H132.098V52.1602ZM148.066 52.1602H143.906V48H148.066V52.1602ZM180.066 52.1602H175.906V48H180.066V52.1602ZM4.16016 44.1602H0V40H4.16016V44.1602ZM12.1602 44.1602H8V40H12.1602V44.1602ZM28.1602 44.1602H24V40H28.1602V44.1602ZM36.1602 44.1602H32V40H36.1602V44.1602ZM52.1289 44.1602H47.9688V40H52.1289V44.1602ZM84.1289 44.1602H79.9688V40H84.1289V44.1602ZM100.098 44.1602H95.9375V40H100.098V44.1602ZM124.098 44.1602H119.938V40H124.098V44.1602ZM148.066 44.1602H143.906V40H148.066V44.1602ZM172.066 44.1602H167.906V40H172.066V44.1602ZM4.16016 36.1602H0V32H4.16016V36.1602ZM20.1602 36.1602H16V32H20.1602V36.1602ZM36.1602 36.1602H32V32H36.1602V36.1602ZM52.1289 36.1602H47.9688V32H52.1289V36.1602ZM84.1289 36.1602H79.9688V32H84.1289V36.1602ZM100.098 36.1602H95.9375V32H100.098V36.1602ZM116.098 36.1602H111.938V32H116.098V36.1602ZM148.066 36.1602H143.906V32H148.066V36.1602ZM164.066 36.1602H159.906V32H164.066V36.1602ZM4.16016 28.1602H0V24H4.16016V28.1602ZM20.1602 28.1602H16V24H20.1602V28.1602ZM36.1602 28.1602H32V24H36.1602V28.1602ZM52.1289 28.1602H47.9688V24H52.1289V28.1602ZM84.1289 28.1602H79.9688V24H84.1289V28.1602ZM100.098 28.1602H95.9375V24H100.098V28.1602ZM108.098 28.1602H103.938V24H108.098V28.1602ZM116.098 28.1602H111.938V24H116.098V28.1602ZM124.098 28.1602H119.938V24H124.098V28.1602ZM148.066 28.1602H143.906V24H148.066V28.1602ZM156.066 28.1602H151.906V24H156.066V28.1602ZM4.16016 20.1602H0V16H4.16016V20.1602ZM36.1602 20.1602H32V16H36.1602V20.1602ZM52.1289 20.1602H47.9688V16H52.1289V20.1602ZM84.1289 20.1602H79.9688V16H84.1289V20.1602ZM100.098 20.1602H95.9375V16H100.098V20.1602ZM132.098 20.1602H127.938V16H132.098V20.1602ZM148.066 20.1602H143.906V16H148.066V20.1602ZM164.066 20.1602H159.906V16H164.066V20.1602ZM4.16016 12.1602H0V8H4.16016V12.1602ZM36.1602 12.1602H32V8H36.1602V12.1602ZM52.1289 12.1602H47.9688V8H52.1289V12.1602ZM84.1289 12.1602H79.9688V8H84.1289V12.1602ZM100.098 12.1602H95.9375V8H100.098V12.1602ZM132.098 12.1602H127.938V8H132.098V12.1602ZM148.066 12.1602H143.906V8H148.066V12.1602ZM172.066 12.1602H167.906V8H172.066V12.1602ZM4.16016 4.16016H0V0H4.16016V4.16016ZM36.1602 4.16016H32V0H36.1602V4.16016ZM60.1289 4.16016H55.9688V0H60.1289V4.16016ZM68.1289 4.16016H63.9688V0H68.1289V4.16016ZM76.1289 4.16016H71.9688V0H76.1289V4.16016ZM100.098 4.16016H95.9375V0H100.098V4.16016ZM108.098 4.16016H103.938V0H108.098V4.16016ZM116.098 4.16016H111.938V0H116.098V4.16016ZM124.098 4.16016H119.938V0H124.098V4.16016ZM148.066 4.16016H143.906V0H148.066V4.16016ZM180.066 4.16016H175.906V0H180.066V4.16016Z"
            fill={C.bigFg}
          />
          {SELECTED_WORKS_DOTS.map(([cx, cy], index) => (
            <circle
              key={`${cx}-${cy}`}
              className="selected-works-dots"
              cx={cx}
              cy={cy}
              r="2.08"
              fill={C.bigFg}
              style={{
                '--dot-duration': `${0.75 + ((index * 17) % 16) / 10}s`,
                '--dot-delay': `${-((index * 23) % 31) / 10}s`,
                '--dot-min-opacity': 0.16 + ((index * 11) % 6) * 0.08,
              }}
            />
          ))}
        </svg>
      </div>
      <div className={`work-bento${leavingCase ? ' is-transitioning' : ''}${returnedFromCase ? ' is-returning' : ''}`}>
        {text.works.map(w => (
          <a
            key={w.n}
            className={`work-card${leavingCase === w.href ? ' is-leaving' : ''}`}
            href={w.href || '#'}
            onClick={onWorkClick(w.href)}
            {...linkProbe}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'none' }}>
            <AsciiTile {...w} theme={theme} fillCell />
          </a>
        ))}
      </div>
      <div className={`case-transition-veil${leavingCase ? ' is-visible' : ''}`} aria-hidden="true" />

      <div style={s.footer}>
        <span>{text.footerLeft}</span>
        <span>{text.footerRight}</span>
      </div>

      {/* 底部正中：简化图标，点击打开对话 */}
      <button
        type="button"
        aria-label="打开 ask-bot 对话"
        aria-expanded={chatOpen}
        {...linkProbe}
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 28,
          transform: 'translateX(-50%)',
          zIndex: 95,
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: `1px solid ${C.line}`,
          background: C.chatBg,
          color: C.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: dark ? '0 6px 24px rgba(0,0,0,0.45)' : '0 6px 20px rgba(60,50,30,0.12)',
        }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {chatOpen && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(40,35,28,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setChatOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-bot-title"
            style={s.chatDock}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.chatHead, alignItems: 'center' }}>
              <span id="ask-bot-title">ask-bot.sh</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>● online</span>
                <button
                  type="button"
                  aria-label="关闭"
                  {...linkProbe}
                  onClick={() => setChatOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: C.mute,
                    fontSize: 18,
                    lineHeight: 1,
                    padding: '0 4px',
                    cursor: 'none',
                    fontFamily: 'inherit',
                  }}>
                  ×
                </button>
              </span>
            </div>
            <div style={s.chatBody}>
              <span style={s.prompt}>bot&gt;</span>
              <span> I'm SuperLee. This bot is trained on this site. Ask about projects, process, or just say hello.</span>
            </div>
            <div style={s.chatInput} {...textProbe}>
              <span style={{ color: C.green }}>you&gt;</span>
              <span>type a question…</span>
              <span style={{
                display: 'inline-block', width: 7, height: 12, background: C.green,
                animation: 'cursor-blink 1s steps(1) infinite', marginLeft: 2,
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Custom block cursor */}
      <div style={cursorBlock} />
    </div>
  );
}

window.AsciiTerminal = AsciiTerminal;
