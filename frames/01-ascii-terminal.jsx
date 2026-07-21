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
        borderRadius: 24,
        color: pat.fg,
        boxShadow: hover
          ? (dark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.1)')
          : 'none',
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
        objectFit: 'cover',
        cursor: 'none',
        filter: hover ? 'brightness(1.1) contrast(1.05)' : 'brightness(0.92)',
        transition: 'filter .2s, transform .5s cubic-bezier(.16,1,.3,1)',
        transform: hover ? 'scale(1.035)' : 'scale(1)',
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
    try { return localStorage.getItem('ascii-theme') || 'dark'; } catch { return 'dark'; }
  });
  const [chatOpen, setChatOpen] = React.useState(false);
  const [lang, setLang] = React.useState('zh');
  const dark = theme === 'dark';
  const C = window.getAsciiThemePalette(dark);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-theme', theme); } catch {}
  }, [theme]);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-lang', lang); } catch {}
  }, [lang]);

  React.useEffect(() => {
    document.body.style.background = C.bg;
    document.documentElement.style.background = C.bg;
  }, [C.bg]);

  React.useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen]);

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
      fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace',
      fontSize: 13,
      lineHeight: 1.7,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      minHeight: '100%',
      padding: '20px 32px 80px',
      position: 'relative',
      cursor: 'none',
      transition: 'background .3s, color .3s',
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
      worksTitle: 'selected works',
      writingTitle: 'writing',
      labTitle: 'lab',
      labBody: 'a place for half-baked ideas, generative toys, and tiny tools.',
      footerLeft: '@ 2026 · super lee',
      footerRight: 'v1.0 · updated 2026.07',
      works: [
        { n: '01', t: 'Huolala', y: '2025', k: 'product', pat: PATTERNS[0], img: 'assets/works/01-harbor.jpg', href: 'work-harbor.html' },
        { n: '02', t: 'Pimax', y: '2025', k: 'product', pat: PATTERNS[1], img: 'assets/works/02-spatial.jpg' },
        { n: '03', t: 'AI OS Concept', y: '2024', k: 'concept', pat: PATTERNS[2], img: 'assets/works/03-zixiang.jpg' },
        { n: '04', t: 'OPPO', y: '2024', k: 'product', pat: PATTERNS[3], img: 'assets/works/04-quiet.jpg' },
      ],
    },
    zh: {
      heroLead: "HI, i'm Super Lee",
      heroBody: '一位UX设计师、创造者和构建者，正在探索 AI 如何放大人的想象力。',
      worksTitle: 'selected works',
      writingTitle: 'writing',
      labTitle: 'lab',
      labBody: '一个放半成品想法、生成式玩具和微型工具的地方。',
      footerLeft: '@ 2026 · super lee',
      footerRight: 'v1.0 · 更新于 2026.07',
      works: [
        { n: '01', t: '货拉拉', y: '2025', k: 'product', pat: PATTERNS[0], img: 'assets/works/01-harbor.jpg', href: 'work-harbor.html' },
        { n: '02', t: 'pimax', y: '2025', k: 'product', pat: PATTERNS[1], img: 'assets/works/02-spatial.jpg' },
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

  return (
    <div ref={rootRef} style={s.wrap}>
      <style>{`
        @keyframes cursor-blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }
        @keyframes cur-pulse { 0%,50%{opacity:1} 50.01%,100%{opacity:0.25} }
        @keyframes ascii-caret-blink { 0%, 48% { opacity: 1; } 50%, 100% { opacity: 0.22; } }
        @keyframes avatar-float-up {
          0% {
            opacity: 0;
            filter: blur(2px) saturate(.9);
            transform: translate3d(-18px, 58px, 0) scale(.52) rotate(-13deg);
          }
          42% {
            opacity: .72;
            filter: blur(.8px) saturate(.96);
            transform: translate3d(-10px, 26px, 0) scale(.74) rotate(-6deg);
          }
          74% {
            opacity: 1;
            filter: blur(0) saturate(1);
            transform: translate3d(2px, -3px, 0) scale(1.018) rotate(1.3deg);
          }
          90% { transform: translate3d(-.5px, 1px, 0) scale(.997) rotate(-.3deg); }
          100% {
            opacity: 1;
            filter: blur(0) saturate(1);
            transform: translate3d(0, 0, 0) scale(1) rotate(0);
          }
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
          filter: blur(2px) saturate(.9);
          transform: translate3d(-18px, 58px, 0) scale(.52) rotate(-13deg);
          transform-origin: 34% 82%;
          transition:
            opacity .36s ease,
            filter .4s ease,
            transform .68s cubic-bezier(.22,.58,.25,1);
          will-change: transform, opacity, filter;
        }
        .hero-lead:hover .hero-avatar {
          opacity: 1;
          filter: blur(0) saturate(1);
          transform: translate3d(0, 0, 0) scale(1) rotate(0);
          animation: avatar-float-up 1.08s cubic-bezier(.3,.1,.25,1) both;
        }
        .hero-avatar img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 34%;
        }
        /* 自定义光标：图片与链接触发区不显系统手型/箭头 */
        img, a, button { cursor: none !important; }
        #about, #works, #writing, #lab, #contact {
          scroll-margin-top: 80px;
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
          .hero-avatar,
          .hero-lead:hover .hero-avatar {
            animation: none;
            transform: none;
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
                {text.heroLead}
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
                {text.heroBody}
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
          <path
            d="M4.16016 52.1602H0V48H4.16016V52.1602ZM36.1602 52.1602H32V48H36.1602V52.1602ZM60.1289 52.1602H55.9688V48H60.1289V52.1602ZM68.1289 52.1602H63.9688V48H68.1289V52.1602ZM76.1289 52.1602H71.9688V48H76.1289V52.1602ZM100.098 52.1602H95.9375V48H100.098V52.1602ZM132.098 52.1602H127.938V48H132.098V52.1602ZM148.066 52.1602H143.906V48H148.066V52.1602ZM180.066 52.1602H175.906V48H180.066V52.1602ZM4.16016 44.1602H0V40H4.16016V44.1602ZM12.1602 44.1602H8V40H12.1602V44.1602ZM28.1602 44.1602H24V40H28.1602V44.1602ZM36.1602 44.1602H32V40H36.1602V44.1602ZM52.1289 44.1602H47.9688V40H52.1289V44.1602ZM84.1289 44.1602H79.9688V40H84.1289V44.1602ZM100.098 44.1602H95.9375V40H100.098V44.1602ZM124.098 44.1602H119.938V40H124.098V44.1602ZM148.066 44.1602H143.906V40H148.066V44.1602ZM172.066 44.1602H167.906V40H172.066V44.1602ZM4.16016 36.1602H0V32H4.16016V36.1602ZM20.1602 36.1602H16V32H20.1602V36.1602ZM36.1602 36.1602H32V32H36.1602V36.1602ZM52.1289 36.1602H47.9688V32H52.1289V36.1602ZM84.1289 36.1602H79.9688V32H84.1289V36.1602ZM100.098 36.1602H95.9375V32H100.098V36.1602ZM116.098 36.1602H111.938V32H116.098V36.1602ZM148.066 36.1602H143.906V32H148.066V36.1602ZM164.066 36.1602H159.906V32H164.066V36.1602ZM4.16016 28.1602H0V24H4.16016V28.1602ZM20.1602 28.1602H16V24H20.1602V28.1602ZM36.1602 28.1602H32V24H36.1602V28.1602ZM52.1289 28.1602H47.9688V24H52.1289V28.1602ZM84.1289 28.1602H79.9688V24H84.1289V28.1602ZM100.098 28.1602H95.9375V24H100.098V28.1602ZM108.098 28.1602H103.938V24H108.098V28.1602ZM116.098 28.1602H111.938V24H116.098V28.1602ZM124.098 28.1602H119.938V24H124.098V28.1602ZM148.066 28.1602H143.906V24H148.066V28.1602ZM156.066 28.1602H151.906V24H156.066V28.1602ZM4.16016 20.1602H0V16H4.16016V20.1602ZM36.1602 20.1602H32V16H36.1602V20.1602ZM52.1289 20.1602H47.9688V16H52.1289V20.1602ZM84.1289 20.1602H79.9688V16H84.1289V20.1602ZM100.098 20.1602H95.9375V16H100.098V20.1602ZM132.098 20.1602H127.938V16H132.098V20.1602ZM148.066 20.1602H143.906V16H148.066V20.1602ZM164.066 20.1602H159.906V16H164.066V20.1602ZM4.16016 12.1602H0V8H4.16016V12.1602ZM36.1602 12.1602H32V8H36.1602V12.1602ZM52.1289 12.1602H47.9688V8H52.1289V12.1602ZM84.1289 12.1602H79.9688V8H84.1289V12.1602ZM100.098 12.1602H95.9375V8H100.098V12.1602ZM132.098 12.1602H127.938V8H132.098V12.1602ZM148.066 12.1602H143.906V8H148.066V12.1602ZM172.066 12.1602H167.906V8H172.066V12.1602ZM4.16016 4.16016H0V0H4.16016V4.16016ZM36.1602 4.16016H32V0H36.1602V4.16016ZM60.1289 4.16016H55.9688V0H60.1289V4.16016ZM68.1289 4.16016H63.9688V0H68.1289V4.16016ZM76.1289 4.16016H71.9688V0H76.1289V4.16016ZM100.098 4.16016H95.9375V0H100.098V4.16016ZM108.098 4.16016H103.938V0H108.098V4.16016ZM116.098 4.16016H111.938V0H116.098V4.16016ZM124.098 4.16016H119.938V0H124.098V4.16016ZM148.066 4.16016H143.906V0H148.066V4.16016ZM180.066 4.16016H175.906V0H180.066V4.16016Z"
            fill={C.bigFg}
          />
        </svg>
      </div>
      <div className="work-bento">
        {text.works.map(w => (
          <a
            key={w.n}
            className="work-card"
            href={w.href || '#'}
            {...linkProbe}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'none' }}>
            <AsciiTile {...w} theme={theme} fillCell />
          </a>
        ))}
      </div>

      {/* Writing */}
      <div id="writing" style={s.sectionTitle}>{text.writingTitle}</div>
      {writings.map(([t, m, d]) => (
        <div key={t} style={{ ...s.row, gridTemplateColumns: '1fr 80px 90px' }}>
          <a href="#" {...linkProbe} style={s.link}>{t}</a>
          <span style={s.dim}>{m}</span>
          <span style={s.dim}>{d}</span>
        </div>
      ))}

      {/* Lab */}
      <div id="lab" style={s.sectionTitle}>{text.labTitle}</div>
      <div {...textProbe} style={{ color: C.chipText, maxWidth: 520, marginBottom: 12 }}>
        {text.labBody}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['cursor.js', 'kern-lab', 'rgb-sort', 'ascii-clock', 'ink-bleed', '+ 12 more'].map(n => (
          <a key={n} href="#" {...linkProbe} style={{
            padding: '4px 10px', border: `1px solid ${C.chip}`, color: C.chipText,
            fontSize: 11, textDecoration: 'none',
          }}>{n}</a>
        ))}
      </div>

      {/* Contact strip */}
      <div id="contact" style={s.sectionTitle}>contact</div>
      <div {...textProbe} style={{ fontSize: 18, color: C.fg }}>
        <a href="#" {...linkProbe} style={s.link}>hello@yourname.xyz</a>
        <span style={{ color: C.linkBorder, margin: '0 12px' }}>·</span>
        <a href="#" {...linkProbe} style={s.link}>github</a>
        <span style={{ color: C.linkBorder, margin: '0 12px' }}>·</span>
        <a href="#" {...linkProbe} style={s.link}>read.cv</a>
        <span style={{ color: C.linkBorder, margin: '0 12px' }}>·</span>
        <a href="#" {...linkProbe} style={s.link}>rss</a>
      </div>

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
