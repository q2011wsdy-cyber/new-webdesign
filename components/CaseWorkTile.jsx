function WorkCover({ n, img, t, cover, decorative = false }) {
  if (cover && cover.src) {
    return cover.type === 'video'
      ? <video className="work-upload-cover" src={cover.src} aria-label={decorative ? undefined : t} autoPlay muted loop playsInline preload="metadata" />
      : <img className="work-upload-cover" src={cover.src} alt={decorative ? '' : t} draggable={false} />;
  }
  if (n === '02') return <div className="pimax-cover" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : t}>
    <div className="pimax-phone"><img src="assets/home/phone.webp" alt="" draggable={false} /></div>
    <img className="pimax-screen" src="assets/home/pimax-screen.webp" alt="" draggable={false} />
    <div className="pimax-screen-bottom"><img src="assets/home/pimax-screen.webp" alt="" draggable={false} /></div>
  </div>;
  if (n === '01') return <img className="huolala-cover" src={img} alt={decorative ? '' : t} draggable={false} />;
  return <div className="generic-work-cover" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : t}>
    <span>{String(t || 'New case').slice(0, 2)}</span>
  </div>;
}

function AsciiTile({ pat, t, img, n, cover }) {
  const [hover, setHover] = React.useState(false);
  const move = event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || event.pointerType === 'touch') return;
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    node.style.setProperty('--card-x', `${x * 14}px`);
    node.style.setProperty('--card-y', `${y * 10}px`);
    node.style.setProperty('--card-rx', `${y * -2.4}deg`);
    node.style.setProperty('--card-ry', `${x * 3}deg`);
  };
  return <div className={`work-tile${hover ? ' is-glass-hovered' : ''}`}
    onPointerEnter={event => { if (event.pointerType !== 'touch') setHover(true); }}
    onPointerMove={move}
    onPointerLeave={event => {
      setHover(false);
      for (const prop of ['x', 'y', 'rx', 'ry']) event.currentTarget.style.removeProperty(`--card-${prop}`);
    }}
    style={{
    boxShadow: hover ? 'var(--shadow-card-hover)' : 'none',
    transform: `perspective(1000px) translate3d(var(--card-x, 0px), var(--card-y, 0px), 0) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg)) scale(${hover ? 1.018 : 1})`,
    transition: hover ? 'transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow .25s ease' : 'transform 420ms cubic-bezier(.16,1,.3,1), box-shadow .25s ease',

    display: 'block', background: pat.bg, borderRadius: 30,
    aspectRatio: '521/605', position: 'relative', overflow: 'hidden',
  }}>
    <WorkCover n={n} img={img} t={t} cover={cover} />
    <window.WorkGlassLens key={cover?.src || img || n} />
  </div>;
}
window.AsciiTile = AsciiTile;
