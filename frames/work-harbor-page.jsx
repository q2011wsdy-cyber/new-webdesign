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

function CaseLottie({ media, C }) {
  const containerRef = React.useRef(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.lottie) {
      setError('Lottie player is unavailable.');
      return undefined;
    }
    setError('');
    let animation;
    try {
      animation = window.lottie.loadAnimation({
        container,
        renderer: media.renderer || 'svg',
        loop: media.loop !== false,
        autoplay: media.autoplay !== false,
        path: media.src,
        animationData: media.data,
        rendererSettings: { preserveAspectRatio: media.preserveAspectRatio || 'xMidYMid meet' },
      });
    } catch (err) {
      setError(err && err.message ? err.message : 'Unable to load Lottie animation.');
    }
    return () => { if (animation) animation.destroy(); };
  }, [media.src, media.data, media.loop, media.autoplay, media.renderer, media.preserveAspectRatio]);

  return (
    <div style={{ minHeight: 220, aspectRatio: media.aspectRatio || '16/9', display: 'grid', placeItems: 'center', background: media.background || 'transparent' }}>
      <div ref={containerRef} role="img" aria-label={media.alt || media.title || 'Lottie animation'} style={{ width: '100%', height: '100%' }} />
      {error && <div style={{ color: C.mute, fontSize: 11, padding: 16 }}>{error}</div>}
    </div>
  );
}

function WorkHarborPage() {
  const SiteTopbar = window.SiteTopbar;
  const defaultWork = {
    title: 'Harbor — a brand system for a',
    accent: 'coastal tea co.',
    subtitle: 'A quiet identity for a small tea company on the Fujian coast. The system draws on maritime signage, concentric wave forms, and a restrained palette — designed to feel steady on a paper bag or on a screen.',
    cover: { src: 'assets/works/01-harbor.jpg', alt: 'Harbor primary visual', caption: 'fig.01 — primary visual, hero composition', fit: 'cover' },
    client: 'Harbor Tea Co.', year: '2025', role: 'Design lead', team: '2 designers, 1 writer',
    nextLabel: 'next · 02', nextTitle: 'Spatial Notes →',
    sections: [
      {
        id: 'context', title: 'context', blocks: [
          { type: 'text', body: 'Harbor approached us after a false start with a big agency — they wanted something that felt "like a small shop, not a chain." We took that brief literally: the system lives in a single weight of type, two colors, and a handful of wave motifs. No gradients, no photography of smiling farmers, no "hand-crafted" flourishes.' },
        ],
      },
      {
        id: 'process', title: 'process', blocks: [
          {
            type: 'steps', intro: 'Three rounds, eight weeks,', command: '$ history | tail',
            items: ['research + audit', 'mark + wordmark', 'system (color, type, grid)', 'packaging + wayfinding', 'guidelines (PDF)'],
            specs: [['Typeface', 'GT Flexa + custom wordmark'], ['Palette', '#d97757 / #1a1410 / off-white'], ['Paper', 'Munken Kristall 120gsm'], ['Print', '2-color lithography'], ['Tools', 'Figma, Glyphs, InDesign'], ['Delivery', '12-month rollout']],
          },
        ],
      },
      {
        id: 'gallery', title: 'gallery', blocks: [
          { type: 'gallery', columns: 2, aspectRatio: '4/3', fit: 'cover', items: [
            { src: 'assets/works/01-harbor.jpg', alt: 'Harbor visual study 1' },
            { src: 'assets/works/01-harbor.jpg', alt: 'Harbor visual study 2' },
            { src: 'assets/works/01-harbor.jpg', alt: 'Harbor visual study 3' },
            { src: 'assets/works/01-harbor.jpg', alt: 'Harbor visual study 4' },
          ] },
        ],
      },
      {
        id: 'outcome', title: 'outcome', blocks: [
          { type: 'text', body: 'Launched in March. The system has since expanded to four sub-brands (breakfast, ceremony, gift, wholesale) — all living comfortably inside the same two colors. First print run sold out in 11 days. More importantly, the founder said it "felt like the shop I always wanted to walk into."' },
        ],
      },
      {
        id: 'credits', title: 'credits', accent: true, blocks: [
          { type: 'text', body: 'Design — Your Name, Collaborator\nCopy — Writer\nPhotography — Studio Name\nThanks — the Harbor team, and everyone at the teahouse in Xiamen' },
        ],
      },
    ],
  };
  const [cur, setCur] = React.useState({ x: 0, y: 0, mode: 'default', visible: false });
  const [theme, setTheme] = React.useState(() => {
    const forcedTheme = window.__workCaseData && window.__workCaseData.en && window.__workCaseData.en.forceInitialTheme;
    if (forcedTheme) return forcedTheme;
    try { return localStorage.getItem('ascii-theme') || 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem('ascii-lang') || 'en'; } catch { return 'en'; }
  });
  const rawWork = (window.__workCaseData && window.__workCaseData[lang]) || defaultWork;
  const ui = lang === 'zh'
    ? { overview: '概览', client: '客户', year: '年份', role: '角色', team: '团队', context: '背景', process: '过程', gallery: '画廊', outcome: '成果', credits: '鸣谢', back: '← 返回', allWork: '全部案例' }
    : { overview: 'overview', client: 'Client', year: 'Year', role: 'Role', team: 'Team', context: 'context', process: 'process', gallery: 'gallery', outcome: 'outcome', credits: 'credits', back: '← back', allWork: 'all work' };
  const legacySections = [
    rawWork.context && { id: 'context', title: ui.context, blocks: [{ type: 'text', body: rawWork.context }] },
    (rawWork.processIntro || rawWork.steps) && { id: 'process', title: ui.process, blocks: [{ type: 'steps', intro: rawWork.processIntro, command: rawWork.showHistory === false ? '' : '$ history | tail', items: rawWork.steps || [], specs: rawWork.showSpecs === false ? [] : (rawWork.specs || []) }] },
    rawWork.gallery && { id: 'gallery', title: ui.gallery, blocks: [{ type: 'gallery', columns: 1, radius: 16, items: rawWork.gallery }] },
    rawWork.outcome && { id: 'outcome', title: ui.outcome, blocks: [{ type: 'text', body: rawWork.outcome }] },
  ].filter(Boolean);
  const work = {
    ...rawWork,
    subtitle: rawWork.subtitle || rawWork.lede,
    cover: rawWork.cover || (rawWork.image ? { src: rawWork.image, alt: rawWork.title, caption: rawWork.caption, fit: 'cover' } : null),
    sections: Array.isArray(rawWork.sections) ? rawWork.sections : legacySections,
  };
  const missingRequired = [
    !work.title && 'title',
    !work.subtitle && 'subtitle',
    !(work.cover && work.cover.src) && 'cover.src',
  ].filter(Boolean);
  const metadata = Array.isArray(work.meta) ? work.meta : [
    work.client && { label: ui.client, value: work.client },
    work.year && { label: ui.year, value: work.year },
    work.role && { label: ui.role, value: work.role },
    work.team && { label: ui.team, value: work.team },
  ].filter(Boolean);
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
  const navItems = [
    { id: 'overview', label: ui.overview },
    ...work.sections.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      label: section.title || ui[section.id] || section.id || `section ${index + 1}`,
    })),
  ];
  const navSectionKey = navItems.map(({ id }) => id).join('|');

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
  }, [navSectionKey]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const updateScrollMotion = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      root.querySelectorAll('.case-scroll-item').forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const range = (viewport + rect.height) / 2;
        const distance = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - viewport / 2) / range));
        const direction = index % 2 === 0 ? -1 : 1;
        node.style.setProperty('--case-scroll-y', `${(distance * direction * 28).toFixed(2)}px`);
        node.style.setProperty('--case-scroll-opacity', `${Math.max(.42, 1 - Math.abs(distance) * .55).toFixed(3)}`);
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollMotion);
    };
    updateScrollMotion();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
    blockStack: { display: 'grid', gap: 24, marginBottom: 40 },
    blockTitle: { color: C.fg, fontSize: 16, lineHeight: 1.4, marginBottom: 5 },
    blockSubtitle: { color: C.mute, fontSize: 12, lineHeight: 1.6, marginBottom: 10 },
    mediaFrame: { background: dark ? '#111' : C.chatBg, border: `1px solid ${C.line}`, overflow: 'hidden' },
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
      width: work.compactCaseLayout ? 'min(100%, 940px)' : 'min(100%, 1180px)', margin: '80px auto 0', display: 'grid',
      gridTemplateColumns: work.hideIndex ? 'minmax(0, 1fr)' : '130px minmax(0, 1fr)', gap: work.hideIndex ? 0 : 'clamp(40px, 8vw, 110px)',
    },
    // 与固定顶栏品牌文字共用左侧视觉基线。
    index: { position: 'sticky', top: 108, alignSelf: 'start', display: 'grid', gap: 14, paddingTop: 4, marginLeft: -5 },
    indexLink: { color: C.mute, textDecoration: 'none', fontSize: 11, letterSpacing: .2 },
    indexLinkActive: { color: C.green },
    main: { minWidth: 0 },
  };

  const renderMedia = (rawMedia, key) => {
    const media = typeof rawMedia === 'string' ? { type: 'image', src: rawMedia } : (rawMedia || {});
    const type = media.type || 'image';
    const radius = media.radius == null ? 12 : media.radius;
    let content;

    if (type === 'video') {
      content = (
        <video
          src={media.src}
          poster={media.poster}
          controls={media.controls !== false}
          autoPlay={Boolean(media.autoplay)}
          loop={Boolean(media.loop)}
          muted={media.muted !== false}
          playsInline
          preload={media.preload || 'metadata'}
          aria-label={media.alt || media.title || 'Case study video'}
          style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: media.aspectRatio, objectFit: media.fit || 'contain' }}
        />
      );
    } else if (type === 'lottie' || type === 'json') {
      content = <CaseLottie media={media} C={C} />;
    } else {
      content = (
        <img
          draggable={false}
          src={media.src}
          alt={media.alt || media.title || ''}
          loading={media.loading || 'lazy'}
          style={{ display: 'block', width: '100%', height: media.height || 'auto', aspectRatio: media.aspectRatio, objectFit: media.fit || 'contain' }}
        />
      );
    }

    return (
      <figure key={key} className="case-scroll-item" style={{ margin: 0 }}>
        {(media.title || media.subtitle) && <figcaption style={{ marginBottom: 10 }}>
          {media.title && <div style={s.blockTitle}>{media.title}</div>}
          {media.subtitle && <div style={s.blockSubtitle}>{media.subtitle}</div>}
        </figcaption>}
        <div style={media.frame === false
          ? { overflow: 'hidden', background: 'transparent', border: 'none', borderRadius: radius }
          : { ...s.mediaFrame, borderRadius: radius }}>
          {content}
        </div>
        {media.caption && <div style={{ ...s.caption, margin: '8px 0 0' }}>{media.caption}</div>}
      </figure>
    );
  };

  const renderText = (block, key) => (
    <div key={key} className="case-scroll-item" {...textProbe} style={{ ...s.prose, maxWidth: block.maxWidth || s.prose.maxWidth, marginBottom: 0, whiteSpace: 'pre-line', ...(block.style || {}) }}>
      {block.title && <div style={s.blockTitle}>{block.title}</div>}
      {block.subtitle && <div style={s.blockSubtitle}>{block.subtitle}</div>}
      {block.body}
    </div>
  );

  const renderBlock = (block, key) => {
    if (!block) return null;
    const type = block.type || 'text';

    if (type === 'text') return renderText(block, key);
    if (type === 'image' || type === 'video' || type === 'lottie' || type === 'json') return renderMedia(block, key);

    if (type === 'text-media' || type === 'media-text') {
      const textNode = renderText(block.text || { title: block.title, subtitle: block.subtitle, body: block.body }, `${key}-text`);
      const mediaNode = renderMedia(block.media, `${key}-media`);
      const nodes = type === 'media-text' ? [mediaNode, textNode] : [textNode, mediaNode];
      return <div key={key} className="case-content-split" style={{ display: 'grid', gridTemplateColumns: block.columns || 'minmax(0,.85fr) minmax(0,1.15fr)', gap: block.gap || 32, alignItems: block.align || 'center' }}>{nodes}</div>;
    }

    if (type === 'gallery') {
      const columns = Math.max(1, Number(block.columns) || 1);
      return <div key={key} className="case-content-gallery" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: block.gap || 20 }}>
        {(block.items || []).map((item, index) => renderMedia({ type: 'image', radius: block.radius, frame: block.frame, fit: block.fit, aspectRatio: block.aspectRatio, ...(typeof item === 'string' ? { src: item } : item) }, `${key}-${index}`))}
      </div>;
    }

    if (type === 'steps') {
      const specs = block.specs || [];
      return <div key={key} className="case-content-split" style={{ ...s.twoCol, gridTemplateColumns: specs.length ? s.twoCol.gridTemplateColumns : '1fr', marginBottom: 0 }}>
        <div {...textProbe} style={{ color: C.mute, fontSize: 13, lineHeight: 1.8 }}>
          {block.intro && <><span>{block.intro}</span><br /><br /></>}
          {block.command && <><span style={{ color: C.dim }}>{block.command}</span><br /></>}
          {(block.items || []).map((item, index) => <React.Fragment key={`${item}-${index}`}><span style={{ color: C.green }}>{String(index + 1).padStart(2, '0')}</span> {item}<br /></React.Fragment>)}
        </div>
        {specs.length > 0 && <div>{specs.map(([label, value]) => <div key={label} style={s.kvRow}><span style={s.kvKey}>{label}</span><span>{value}</span></div>)}</div>}
      </div>;
    }

    if (type === 'stack') {
      return <div key={key} style={{ display: 'grid', gap: block.gap || 24 }}>{(block.blocks || []).map((child, index) => renderBlock(child, `${key}-${index}`))}</div>;
    }

    return <div key={key} role="note" style={{ color: C.accent, fontSize: 11 }}>Unsupported block type: {type}</div>;
  };

  const renderCover = () => <>
    <div style={{ ...s.hero, marginBottom: work.cover.caption ? 12 : 20, borderRadius: work.compactCaseLayout ? 12 : 0, border: work.compactCaseLayout ? 0 : s.hero.border, height: work.compactCaseLayout ? 'auto' : undefined, aspectRatio: work.compactCaseLayout ? 'auto' : s.hero.aspectRatio }}>
      <img draggable={false} src={work.cover.src} alt={work.cover.alt || work.title} style={{ display: 'block', width: '100%', height: work.compactCaseLayout ? 'auto' : '100%', objectFit: work.cover.fit || 'cover', objectPosition: work.cover.position || 'center' }} />
    </div>
    {work.cover.caption && <div style={s.caption}>{work.cover.caption}</div>}
  </>;

  const cursorBlock = window.getSiteCursorStyle(cur, C, dark);

  if (missingRequired.length) {
    return (
      <div role="alert" style={{ minHeight: '100vh', padding: 40, background: C.bg, color: C.fg, fontFamily: '"JetBrains Mono", monospace' }}>
        <h1 style={{ fontSize: 20 }}>Case configuration is incomplete.</h1>
        <p style={{ color: C.mute }}>Missing required fields: {missingRequired.join(', ')}</p>
      </div>
    );
  }

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
        .case-scroll-item {
          opacity: var(--case-scroll-opacity, 1);
          transform: translate3d(0, var(--case-scroll-y, 0px), 0);
          will-change: transform, opacity;
          transition: transform 180ms cubic-bezier(.16,1,.3,1), opacity 360ms cubic-bezier(.16,1,.3,1);
        }
        img, a, button { cursor: none !important; }
        @media (max-width: 720px) {
          .case-detail-grid { grid-template-columns: 1fr !important; margin-top: 58px !important; }
          .case-detail-index { position: static !important; grid-auto-flow: column; grid-auto-columns: max-content; overflow-x: auto; padding: 4px 0 12px !important; border-bottom: 1px dashed ${C.line}; }
          .case-detail-main > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          .case-content-split, .case-content-gallery { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .case-detail-grid.case-detail-arrival, .case-detail-grid.case-detail-leaving { animation: none; }
          .case-return-veil { transition: none; }
          .case-scroll-item { opacity: 1 !important; transform: none !important; transition: none !important; }
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
      {!work.hideIndex && <aside className="case-detail-index" aria-label="Case sections" style={s.index}>
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} {...linkProbe}
            style={{ ...s.indexLink, ...(activeSection === item.id ? s.indexLinkActive : {}) }}>
            {item.label}
          </a>
        ))}
      </aside>}
      <main className="case-detail-main" style={s.main}>
      <div id="overview" className="case-scroll-item" style={{ scrollMarginTop: 110 }}>
      {work.showCover !== false && work.coverPlacement === 'before-title' && renderCover()}
      <div {...textProbe}>
        <h1 style={s.title}>
          {work.title}{work.accent && <> <span style={{ color: C.accent }}>{work.accent}</span></>}
        </h1>
        <p style={s.lede}>{work.subtitle}</p>
      </div>

      {work.showMeta !== false && metadata.length > 0 && <div className="case-scroll-item" style={{ ...s.metaGrid, gridTemplateColumns: `repeat(${Math.min(metadata.length, 4)}, minmax(0, 1fr))` }}>
        {metadata.map((item, index) => <div key={`${item.label}-${index}`}><div style={s.metaLabel}>{item.label}</div><div style={s.metaVal}>{item.value}</div></div>)}
      </div>}

      {work.showCover !== false && work.coverPlacement !== 'before-title' && renderCover()}
      </div>

      {work.sections.map((section, sectionIndex) => {
        const sectionId = section.id || `section-${sectionIndex + 1}`;
        const sectionTitle = section.title || ui[section.id] || section.id || `section ${sectionIndex + 1}`;
        return <section key={sectionId} id={sectionId} style={{ scrollMarginTop: 110 }}>
          {section.hideTitle !== true && <div style={{ ...s.sectionTitle, ...(section.accent ? { color: C.accent } : {}) }}>── {sectionTitle} ─────────────────────────────────────────────</div>}
          <div style={s.blockStack}>{(section.blocks || []).map((block, blockIndex) => renderBlock(block, `${sectionId}-${blockIndex}`))}</div>
        </section>;
      })}

      <div className="case-scroll-item" style={s.nextNav}>
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

      <div className="case-scroll-item" style={s.footer}>
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
