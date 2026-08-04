/**
 * Harbor 作品详情 — 与首页共用 SiteTopbar + getAsciiThemePalette
 */

if (typeof window.getSiteCursorStyle !== 'function') {
  window.getSiteCursorStyle = function getSiteCursorStyleFallback(cur, C) {
    return {
      position: 'absolute', pointerEvents: 'none', zIndex: 200, left: cur.x, top: cur.y,
      transform: 'translate(-50%,-50%)', opacity: cur.visible ? 1 : 0,
      width: 10, height: 10, borderRadius: '50%', background: (C && C.curDefault) || '#6fb36f',
    };
  };
}

function WorkHarborPage() {
  const SiteTopbar = window.SiteTopbar;
  const defaultWork = {
    title: 'Harbor — a brand system for a',
    accent: 'coastal tea co.',
    lede: 'A quiet identity for a small tea company on the Fujian coast. The system draws on maritime signage, concentric wave forms, and a restrained palette — designed to feel steady on a paper bag or on a screen.',
    client: 'Harbor Tea Co.', year: '2025', role: 'Design lead', team: '2 designers, 1 writer',
    image: 'assets/works/01-harbor.jpg', caption: 'fig.01 — primary visual, hero composition',
    context: 'Harbor approached us after a false start with a big agency — they wanted something that felt "like a small shop, not a chain." We took that brief literally: the system lives in a single weight of type, two colors, and a handful of wave motifs. No gradients, no photography of smiling farmers, no "hand-crafted" flourishes.',
    outcome: 'Launched in March. The system has since expanded to four sub-brands (breakfast, ceremony, gift, wholesale) — all living comfortably inside the same two colors. First print run sold out in 11 days. More importantly, the founder said it "felt like the shop I always wanted to walk into."',
    nextLabel: 'next · 02', nextTitle: 'Spatial Notes →',
    processIntro: 'Three rounds, eight weeks,',
    steps: ['research + audit', 'mark + wordmark', 'system (color, type, grid)', 'packaging + wayfinding', 'guidelines (PDF)'],
    specs: [['Typeface', 'GT Flexa + custom wordmark'], ['Palette', '#d97757 / #1a1410 / off-white'], ['Paper', 'Munken Kristall 120gsm'], ['Print', '2-color lithography'], ['Tools', 'Figma, Glyphs, InDesign'], ['Delivery', '12-month rollout']],
    showSpecs: true, showCredits: true,
  };
  const [cur, setCur] = React.useState({ x: 0, y: 0, mode: 'default', visible: false });
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem('ascii-theme') || 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem('ascii-lang') || 'en'; } catch { return 'en'; }
  });
  const work = (window.__workCaseData && window.__workCaseData[lang]) || defaultWork;
  const ui = lang === 'zh'
    ? { nav: ['概览', '背景', '过程', '画廊', '成果', '鸣谢'], client: '客户', year: '年份', role: '角色', team: '团队', context: '背景', process: '过程', gallery: '画廊', outcome: '成果', credits: '鸣谢', back: '← 返回', allWork: '全部案例' }
    : { nav: ['overview', 'context', 'process', 'gallery', 'outcome', 'credits'], client: 'Client', year: 'Year', role: 'Role', team: 'Team', context: 'context', process: 'process', gallery: 'gallery', outcome: 'outcome', credits: 'credits', back: '← back', allWork: 'all work' };
  const [enteredFromCase, setEnteredFromCase] = React.useState(() => {
    try {
      const entered = sessionStorage.getItem('ascii-case-transition') === '1';
      sessionStorage.removeItem('ascii-case-transition');
      return entered;
    } catch (_) { return false; }
  });
  const [leavingCase, setLeavingCase] = React.useState(false);
  const dark = theme === 'dark';
  const C = window.getAsciiThemePalette(dark);
  const rootRef = React.useRef(null);
  const [activeSection, setActiveSection] = React.useState('overview');
  const navItems = ['overview', 'context', 'process', 'gallery', 'outcome', 'credits']
    .map((id, index) => ({ id, label: ui.nav[index] }))
    .filter((item) => item.id !== 'credits' || work.showCredits !== false);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-theme', theme); } catch {}
    document.body.style.background = C.bg;
  }, [theme, C.bg]);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-lang', lang); } catch {}
  }, [lang]);

  React.useEffect(() => {
    if (!enteredFromCase) return;
    const timer = window.setTimeout(() => setEnteredFromCase(false), 560);
    return () => window.clearTimeout(timer);
  }, [enteredFromCase]);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setCur((c) => ({ ...c, x: e.clientX - r.left, y: e.clientY - r.top, visible: true }));
    };
    const onLeave = () => setCur((c) => ({ ...c, visible: false }));
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  React.useEffect(() => {
    const nodes = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveSection(current.target.id);
    }, { rootMargin: '-18% 0px -66% 0px', threshold: [0.1, 0.5] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const setMode = (m) => setCur((c) => ({ ...c, mode: m }));
  const textProbe = { onMouseEnter: () => setMode('text'), onMouseLeave: () => setMode('default') };
  const linkProbe = { onMouseEnter: () => setMode('link'), onMouseLeave: () => setMode('default') };
  const onCloseCase = (e) => {
    if (leavingCase || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    setLeavingCase(true);
    try { sessionStorage.setItem('ascii-case-return-transition', '1'); } catch (_) {}
    window.setTimeout(() => { window.location.assign('ascii-terminal.html#works'); }, 400);
  };

  const s = {
    wrap: {
      background: C.bg,
      color: C.fg,
      fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace',
      fontSize: 13,
      lineHeight: 1.7,
      minHeight: '100vh',
      padding: '20px 32px 80px',
      position: 'relative',
      cursor: 'none',
      transition: 'background .3s, color .3s',
    },
    title: {
      fontSize: 44,
      lineHeight: 1.15,
      color: C.bigFg,
      letterSpacing: -0.8,
      margin: '12px 0 16px',
      fontWeight: 500,
      fontFamily: 'inherit',
    },
    lede: { fontSize: 16, color: dark ? '#bbb' : C.dim, maxWidth: 680, marginBottom: 40, lineHeight: 1.6 },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      padding: '16px 0',
      borderTop: `1px dashed ${C.line}`,
      borderBottom: `1px dashed ${C.line}`,
      marginBottom: 48,
    },
    metaLabel: {
      color: C.dim,
      fontSize: 10,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    metaVal: { color: C.fg, fontSize: 13 },
    hero: {
      width: '100%',
      aspectRatio: '16/9',
      background: dark ? '#1a1410' : C.dot,
      border: `1px solid ${C.line}`,
      marginBottom: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    caption: { fontSize: 11, color: C.dim, marginBottom: 48 },
    sectionTitle: {
      color: C.faint,
      fontSize: 11,
      letterSpacing: 1.5,
      marginTop: 40,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    prose: { maxWidth: 680, color: C.chipText, fontSize: 14, lineHeight: 1.8, marginBottom: 32 },
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 40 },
    galleryTile: {
      aspectRatio: '4/3',
      background: dark ? '#151010' : C.chatBg,
      border: `1px solid ${C.line}`,
      position: 'relative',
      overflow: 'hidden',
    },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, marginBottom: 40 },
    kvRow: {
      display: 'grid',
      gridTemplateColumns: '140px 1fr',
      padding: '6px 0',
      borderBottom: `1px dotted ${C.dot}`,
    },
    kvKey: { color: C.faint },
    link: { color: C.fg, textDecoration: 'none', borderBottom: `1px dotted ${C.linkBorder}` },
    nextNav: {
      marginTop: 60,
      paddingTop: 24,
      borderTop: `1px dashed ${C.line}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nextBlock: { display: 'flex', flexDirection: 'column', gap: 4 },
    nextSmall: { fontSize: 10, color: C.dim, letterSpacing: 1.5, textTransform: 'uppercase' },
    nextBig: { fontSize: 18, color: C.fg },
    footer: {
      marginTop: 60,
      paddingTop: 16,
      borderTop: `1px dashed ${C.line}`,
      color: C.faint,
      fontSize: 11,
      display: 'flex',
      justifyContent: 'space-between',
    },
    caseGrid: {
      width: 'min(100%, 1180px)', margin: '80px auto 0', display: 'grid',
      gridTemplateColumns: '130px minmax(0, 1fr)', gap: 'clamp(40px, 8vw, 110px)',
    },
    // 与固定顶栏品牌文字共用左侧视觉基线。
    index: { position: 'sticky', top: 108, alignSelf: 'start', display: 'grid', gap: 14, paddingTop: 4, marginLeft: -5 },
    indexLink: { color: C.mute, textDecoration: 'none', fontSize: 11, letterSpacing: .2 },
    indexLinkActive: { color: C.green },
    main: { minWidth: 0 },
  };

  const cursorBlock = window.getSiteCursorStyle(cur, C, dark);

  return (
    <div ref={rootRef} style={s.wrap}>
      <style>{`
        @keyframes ascii-caret-blink { 0%, 48% { opacity: 1; } 50%, 100% { opacity: 0.22; } }
        @keyframes case-detail-arrival {
          from { opacity: 0; transform: translate3d(0, 18px, 0) scale(.988); filter: blur(3px); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
        }
        .case-detail-grid.case-detail-arrival {
          animation: case-detail-arrival 560ms cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes case-detail-departure {
          from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
          to { opacity: 0; transform: translate3d(0, -12px, 0) scale(.982); filter: blur(2px); }
        }
        .case-detail-grid.case-detail-leaving {
          animation: case-detail-departure 340ms cubic-bezier(.4,0,.7,.2) both;
        }
        .case-return-veil {
          position: fixed;
          inset: 0;
          z-index: 180;
          pointer-events: none;
          opacity: 0;
          background: ${C.bg};
          transition: opacity 260ms cubic-bezier(.22,.61,.36,1) 90ms;
        }
        .case-return-veil.is-visible { opacity: 1; }
        img, a, button { cursor: none !important; }
        @media (max-width: 720px) {
          .case-detail-grid { grid-template-columns: 1fr !important; margin-top: 58px !important; }
          .case-detail-index { position: static !important; grid-auto-flow: column; grid-auto-columns: max-content; overflow-x: auto; padding: 4px 0 12px !important; border-bottom: 1px dashed ${C.line}; }
          .case-detail-main > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .case-detail-grid.case-detail-arrival, .case-detail-grid.case-detail-leaving { animation: none; }
          .case-return-veil { transition: none; }
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
        homeHrefPrefix="ascii-terminal.html"
        closeHref="ascii-terminal.html#works"
        closeOnClick={onCloseCase}
      />

      <div className={`case-detail-grid${enteredFromCase ? ' case-detail-arrival' : ''}${leavingCase ? ' case-detail-leaving' : ''}`} style={s.caseGrid}>
      <aside className="case-detail-index" aria-label="Case sections" style={s.index}>
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} {...linkProbe}
            style={{ ...s.indexLink, ...(activeSection === item.id ? s.indexLinkActive : {}) }}>
            {item.label}
          </a>
        ))}
      </aside>
      <main className="case-detail-main" style={s.main}>
      <div id="overview" style={{ scrollMarginTop: 110 }}>
      <div {...textProbe}>
        <h1 style={s.title}>
          {work.title}{work.accent && <> <span style={{ color: C.accent }}>{work.accent}</span></>}
        </h1>
        <p style={s.lede}>{work.lede}</p>
      </div>

      <div style={s.metaGrid}>
        <div><div style={s.metaLabel}>{ui.client}</div><div style={s.metaVal}>{work.client}</div></div>
        <div><div style={s.metaLabel}>{ui.year}</div><div style={s.metaVal}>{work.year}</div></div>
        <div><div style={s.metaLabel}>{ui.role}</div><div style={s.metaVal}>{work.role}</div></div>
        <div><div style={s.metaLabel}>{ui.team}</div><div style={s.metaVal}>{work.team}</div></div>
      </div>

      <div style={s.hero}>
        <img draggable={false} src={work.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={s.caption}>{work.caption}</div>
      </div>

      <div id="context" style={{ ...s.sectionTitle, scrollMarginTop: 110 }}>── {ui.context} ─────────────────────────────────────────────</div>
      <div {...textProbe} style={{ ...s.prose, whiteSpace: 'pre-line' }}>
        {work.context}
      </div>

      <div id="process" style={{ ...s.sectionTitle, scrollMarginTop: 110 }}>── {ui.process} ─────────────────────────────────────────────</div>
      <div style={{ ...s.twoCol, gridTemplateColumns: work.showSpecs === false ? '1fr' : s.twoCol.gridTemplateColumns }}>
        <div {...textProbe} style={{ color: C.mute, fontSize: 13, lineHeight: 1.8 }}>
          {work.processIntro}<br />
          <br />
          {work.showHistory !== false && <><span style={{ color: C.dim }}>$ history | tail</span><br /></>}
          {work.steps.map((step, index) => <React.Fragment key={step}><span style={{ color: C.green }}>{String(index + 1).padStart(2, '0')}</span> {step}<br /></React.Fragment>)}
        </div>
        {work.showSpecs !== false && <div>
          {work.specs.map(([key, value]) => <div key={key} style={s.kvRow}><span style={s.kvKey}>{key}</span><span>{value}</span></div>)}
        </div>}
      </div>

      <div id="gallery" style={{ ...s.sectionTitle, scrollMarginTop: 110 }}>── {ui.gallery} ─────────────────────────────────────────────</div>
      <div style={{ ...s.gallery, ...(work.gallery ? { gridTemplateColumns: '1fr', gap: 20 } : {}) }}>
        {(work.gallery || [work.image, work.image, work.image, work.image]).map((entry, index) => {
          const image = typeof entry === 'string' ? entry : entry.src;
          return <div key={`${image}-${index}`}>
            {typeof entry !== 'string' && <div style={{ marginBottom: 10 }}>
              <div style={{ color: C.fg, fontSize: 14, lineHeight: 1.4 }}>{String(index + 1).padStart(2, '0')} · {entry.title}</div>
              <div style={{ color: C.mute, fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{entry.subtitle}</div>
            </div>}
            <div style={{ ...s.galleryTile, ...(work.gallery ? { aspectRatio: 'auto', borderRadius: 16, overflow: 'hidden' } : {}) }}>
              <img draggable={false} src={image} alt={typeof entry === 'string' ? '' : entry.title} style={work.gallery
                ? { display: 'block', width: '100%', height: 'auto', borderRadius: 'inherit' }
                : { width: '100%', height: '100%', objectFit: 'cover', filter: ['brightness(0.85) hue-rotate(-10deg)', 'brightness(0.9) hue-rotate(10deg)', 'brightness(0.85)', 'grayscale(0.3) brightness(0.9)'][index] }} />
            </div>
          </div>;
        })}
      </div>

      <div id="outcome" style={{ ...s.sectionTitle, scrollMarginTop: 110 }}>── {ui.outcome} ─────────────────────────────────────────────</div>
      <div {...textProbe} style={s.prose}>
        {work.outcome}
      </div>

      {work.showCredits !== false && <>
        <div id="credits" style={{ ...s.sectionTitle, color: C.accent, scrollMarginTop: 110 }}>
          ── {ui.credits} ─────────────────────────────────────────────
        </div>
        <div style={{ color: C.mute, fontSize: 13, lineHeight: 2, marginBottom: 40 }}>
          Design — <a href="#" {...linkProbe} style={s.link}>Your Name</a>,{' '}
          <a href="#" {...linkProbe} style={s.link}>Collaborator</a><br />
          Copy — <a href="#" {...linkProbe} style={s.link}>Writer</a><br />
          Photography — <a href="#" {...linkProbe} style={s.link}>Studio Name</a><br />
          Thanks — the Harbor team, and everyone at the teahouse in Xiamen
        </div>
      </>}

      <div style={s.nextNav}>
        <a href="ascii-terminal.html" {...linkProbe} style={{ textDecoration: 'none', color: C.fg }}>
          <div style={s.nextBlock}>
            <span style={s.nextSmall}>{ui.back}</span>
            <span style={s.nextBig}>{ui.allWork}</span>
          </div>
        </a>
        <a href="#" {...linkProbe} style={{ textDecoration: 'none', color: C.fg, textAlign: 'right' }}>
          <div style={s.nextBlock}>
            <span style={{ ...s.nextSmall, color: C.accent }}>{work.nextLabel}</span>
            <span style={s.nextBig}>{work.nextTitle}</span>
          </div>
        </a>
      </div>

      <div style={s.footer}>
        <span>© 2025 · handmade, kept simple</span>
        <span>v1.0 · last updated 2025.03</span>
      </div>

      </main>
      </div>
      <div className={`case-return-veil${leavingCase ? ' is-visible' : ''}`} aria-hidden="true" />

      <div style={cursorBlock} />
    </div>
  );
}

window.WorkHarborPage = WorkHarborPage;
