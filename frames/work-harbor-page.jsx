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
  const [cur, setCur] = React.useState({ x: 0, y: 0, mode: 'default', visible: false });
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem('ascii-theme') || 'dark'; } catch { return 'dark'; }
  });
  const dark = theme === 'dark';
  const C = window.getAsciiThemePalette(dark);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem('ascii-theme', theme); } catch {}
    document.body.style.background = C.bg;
  }, [theme, C.bg]);

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

  const setMode = (m) => setCur((c) => ({ ...c, mode: m }));
  const textProbe = { onMouseEnter: () => setMode('text'), onMouseLeave: () => setMode('default') };
  const linkProbe = { onMouseEnter: () => setMode('link'), onMouseLeave: () => setMode('default') };

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
    crumbs: { color: C.faint, marginBottom: 20, fontSize: 11, letterSpacing: 1 },
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
  };

  const cursorBlock = window.getSiteCursorStyle(cur, C, dark);

  return (
    <div ref={rootRef} style={s.wrap}>
      <style>{`
        @keyframes ascii-caret-blink { 0%, 48% { opacity: 1; } 50%, 100% { opacity: 0.22; } }
        img, a, button { cursor: none !important; }
      `}</style>
      <SiteTopbar
        brand="Super lee"
        linkProbe={linkProbe}
        dark={dark}
        theme={theme}
        setTheme={setTheme}
        homeHrefPrefix="ascii-terminal.html"
      />

      <div style={s.crumbs}>
        <a href="ascii-terminal.html" {...linkProbe} style={{ color: C.mute, textDecoration: 'none' }}>~/</a>
        <span style={{ color: C.dim }}> / </span>
        <a href="ascii-terminal.html#works" {...linkProbe} style={{ color: C.mute, textDecoration: 'none' }}>work</a>
        <span style={{ color: C.dim }}> / </span>
        <span style={{ color: C.accent }}>01-harbor</span>
      </div>

      <div {...textProbe}>
        <div style={{ color: C.green, fontSize: 11, letterSpacing: 1 }}>
          [01] · identity · 2025
        </div>
        <h1 style={s.title}>
          Harbor — a brand system for a <span style={{ color: C.accent }}>coastal tea co.</span>
        </h1>
        <p style={s.lede}>
          A quiet identity for a small tea company on the Fujian coast.
          The system draws on maritime signage, concentric wave forms, and
          a restrained palette — designed to feel steady on a paper bag or
          on a screen.
        </p>
      </div>

      <div style={s.metaGrid}>
        <div><div style={s.metaLabel}>Client</div><div style={s.metaVal}>Harbor Tea Co.</div></div>
        <div><div style={s.metaLabel}>Year</div><div style={s.metaVal}>2025</div></div>
        <div><div style={s.metaLabel}>Role</div><div style={s.metaVal}>Design lead</div></div>
        <div><div style={s.metaLabel}>Team</div><div style={s.metaVal}>2 designers, 1 writer</div></div>
      </div>

      <div style={s.hero}>
        <img draggable={false} src="assets/works/01-harbor.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={s.caption}>fig.01 — primary visual, hero composition</div>

      <div style={s.sectionTitle}>── 01 / context ──────────────────────────────────────</div>
      <div {...textProbe} style={s.prose}>
        Harbor approached us after a false start with a big agency — they
        wanted something that felt &quot;like a small shop, not a chain.&quot; We
        took that brief literally: the system lives in a single weight of
        type, two colors, and a handful of wave motifs. No gradients,
        no photography of smiling farmers, no &quot;hand-crafted&quot; flourishes.
      </div>

      <div style={s.sectionTitle}>── 02 / process ──────────────────────────────────────</div>
      <div style={s.twoCol}>
        <div {...textProbe} style={{ color: C.mute, fontSize: 13, lineHeight: 1.8 }}>
          Three rounds, eight weeks,<br />
          200+ sketches, one final mark.<br /><br />
          <span style={{ color: C.dim }}>$ history | tail</span><br />
          <span style={{ color: C.green }}>01</span> research + audit<br />
          <span style={{ color: C.green }}>02</span> mark + wordmark<br />
          <span style={{ color: C.green }}>03</span> system (color, type, grid)<br />
          <span style={{ color: C.green }}>04</span> packaging + wayfinding<br />
          <span style={{ color: C.green }}>05</span> guidelines (PDF)
        </div>
        <div>
          <div style={s.kvRow}><span style={s.kvKey}>Typeface</span><span>GT Flexa + custom wordmark</span></div>
          <div style={s.kvRow}><span style={s.kvKey}>Palette</span><span>#d97757 / #1a1410 / off-white</span></div>
          <div style={s.kvRow}><span style={s.kvKey}>Paper</span><span>Munken Kristall 120gsm</span></div>
          <div style={s.kvRow}><span style={s.kvKey}>Print</span><span>2-color lithography</span></div>
          <div style={s.kvRow}><span style={s.kvKey}>Tools</span><span>Figma, Glyphs, InDesign</span></div>
          <div style={s.kvRow}><span style={s.kvKey}>Delivery</span><span>12-month rollout</span></div>
        </div>
      </div>

      <div style={s.sectionTitle}>── 03 / gallery ──────────────────────────────────────</div>
      <div style={s.gallery}>
        <div style={s.galleryTile}>
          <img draggable={false} src="assets/works/01-harbor.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) hue-rotate(-10deg)' }} />
        </div>
        <div style={s.galleryTile}>
          <img draggable={false} src="assets/works/04-quiet.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) hue-rotate(10deg)' }} />
        </div>
        <div style={s.galleryTile}>
          <img draggable={false} src="assets/works/06-ink.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
        </div>
        <div style={s.galleryTile}>
          <img draggable={false} src="assets/works/01-harbor.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.3) brightness(0.9)' }} />
        </div>
      </div>

      <div style={s.sectionTitle}>── 04 / outcome ──────────────────────────────────────</div>
      <div {...textProbe} style={s.prose}>
        Launched in March. The system has since expanded to four
        sub-brands (breakfast, ceremony, gift, wholesale) — all living
        comfortably inside the same two colors. First print run sold
        out in 11 days. More importantly, the founder said it &quot;felt like
        the shop I always wanted to walk into.&quot;
      </div>

      <div style={{ ...s.sectionTitle, color: C.accent }}>
        ── 05 / credits ──────────────────────────────────────
      </div>
      <div style={{ color: C.mute, fontSize: 13, lineHeight: 2, marginBottom: 40 }}>
        Design — <a href="#" {...linkProbe} style={s.link}>Your Name</a>,{' '}
        <a href="#" {...linkProbe} style={s.link}>Collaborator</a><br />
        Copy — <a href="#" {...linkProbe} style={s.link}>Writer</a><br />
        Photography — <a href="#" {...linkProbe} style={s.link}>Studio Name</a><br />
        Thanks — the Harbor team, and everyone at the teahouse in Xiamen
      </div>

      <div style={s.nextNav}>
        <a href="ascii-terminal.html" {...linkProbe} style={{ textDecoration: 'none', color: C.fg }}>
          <div style={s.nextBlock}>
            <span style={s.nextSmall}>← back</span>
            <span style={s.nextBig}>all work</span>
          </div>
        </a>
        <a href="#" {...linkProbe} style={{ textDecoration: 'none', color: C.fg, textAlign: 'right' }}>
          <div style={s.nextBlock}>
            <span style={{ ...s.nextSmall, color: C.accent }}>next · 02</span>
            <span style={s.nextBig}>Spatial Notes →</span>
          </div>
        </a>
      </div>

      <div style={s.footer}>
        <span>© 2025 · handmade, kept simple</span>
        <span>v1.0 · last updated 2025.03</span>
      </div>

      <div style={cursorBlock} />
    </div>
  );
}

window.WorkHarborPage = WorkHarborPage;
