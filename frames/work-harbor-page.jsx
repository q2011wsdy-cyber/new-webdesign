function CaseDotGallery() {
  const canvas = React.useRef(null);
  React.useEffect(() => {
    const node = canvas.current, ctx = node.getContext('2d', {alpha:false});
    const tile = document.createElement('canvas'), tileCtx = tile.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    let active=false, disposed=false, frame=0, lastTile=-Infinity, data, base, scale=1;
    const start=performance.now(), W=1073.2, H=602.6493;
    const color = value => {
      if (!value.startsWith('#')) return Number(value);
      let hex=value.slice(1);if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
      return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
    };
    const sample = (frames,time) => {
      let a=frames[0],b=frames[frames.length-1];
      for(let i=1;i<frames.length;i++){if(time<frames[i][0]){a=frames[i-1];b=frames[i];break;}}
      let u=a[2]||b[0]===a[0]?0:Math.max(0,Math.min(1,(time-a[0])/(b[0]-a[0])));
      if(!a[2])u=u*u*(3-2*u);
      return Array.isArray(a[1])?'rgb('+a[1].map((v,i)=>Math.round(v+(b[1][i]-v)*u)).join(',')+')':a[1]+(b[1]-a[1])*u;
    };
    const renderTile = t => {
      tileCtx.setTransform(scale,0,0,scale,0,0);tileCtx.clearRect(0,0,W,H);tileCtx.drawImage(base,0,0,W,H);
      // One gradient paints the full fixed Bliss dot path.
      const shift=(t%10)/10*172.738, x=878.781, y=102.126, d=172.738;
      const gradient=tileCtx.createLinearGradient(x-2*d+shift,y-2*d+shift,x+2*d+shift,y+2*d+shift);
      for(let cycle=0;cycle<4;cycle++)for(const [offset,c] of data.stops)gradient.addColorStop((cycle+offset)/4,c);
      tileCtx.fillStyle=gradient;tileCtx.fill(data.blissPath);
      for(const shape of data.shapes){
        const [kind,geometry,fill,opacity,name,duration,delay,fillOpacity]=shape;
        const phase=(((t-delay)%duration)+duration)%duration/duration;
        const value=sample(data.tracks[name],phase);
        tileCtx.globalAlpha=(typeof value==='number'?value:opacity)*fillOpacity;
        tileCtx.fillStyle=typeof value==='string'?value:fill;
        tileCtx.fill(shape.path);
      }
      tileCtx.globalAlpha=1;
    };
    const draw = now => {
      frame=0;if(disposed||!active||document.hidden||!data||!base)return;
      const t=reduced.matches?0:(now-start)/1000;
      // Dot changes are cached at 20 fps; scrolling composites the cached tile at display refresh rate.
      if(now-lastTile>=50){renderTile(t);lastTile=now;}
      ctx.setTransform(scale,0,0,scale,0,0);ctx.fillStyle='#181818';ctx.fillRect(0,0,934,465);
      const x=reduced.matches?0:-(t*22%W),y=reduced.matches?0:-(t*22%H);
      for(let row=0;row<2;row++)for(let col=0;col<2;col++)ctx.drawImage(tile,x+col*W,y+row*H,W,H);
      if(!reduced.matches)frame=requestAnimationFrame(draw);
    };
    const resume=()=>{if(active&&!document.hidden&&!frame&&data&&base)frame=requestAnimationFrame(draw);};
    const resize=()=>{
      scale=Math.min(devicePixelRatio||1,1.5)*Math.min(1,node.clientWidth/934||1);
      node.width=Math.round(934*scale);node.height=Math.round(465*scale);
      tile.width=Math.ceil(W*scale);tile.height=Math.ceil(H*scale);lastTile=-Infinity;resume();
    };
    const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)resume();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'});
    observer.observe(node);const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(node);
    document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',()=>{lastTile=-Infinity;resume();},{signal:controller.signal});
    Promise.all([
      fetch('assets/works/pimax/gallery-canvas-motion.json?v=27',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Gallery data unavailable');return r.json();}),
      new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='assets/works/pimax/gallery-canvas-base.svg?v=27';})
    ]).then(([motion,image])=>{
      if(disposed)return;data=motion;base=image;
      for(const key in data.tracks)data.tracks[key]=data.tracks[key].map(([t,v,step])=>[t,color(v),step]);
      for(const shape of data.shapes){const [kind,g]=shape;const path=new Path2D();if(kind==='circle')path.arc(g[0],g[1],g[2],0,Math.PI*2);else if(kind==='rect')path.roundRect(g[0],g[1],g[2],g[3],g[4]);else path.addPath(new Path2D(g));shape.path=path;}
      data.blissPath=new Path2D();for(const g of data.bliss)data.blissPath.roundRect(g[0],g[1],g[2],g[3],g[4]);
      resize();resume();
    }).catch(error=>{if(disposed||error.name==='AbortError')return;const image=new Image();image.onload=()=>{if(disposed)return;resize();ctx.drawImage(image,0,0,node.width,node.height);};image.src='assets/works/pimax/img-7.png';});
    return()=>{disposed=true;controller.abort();cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',resume);};
  },[]);
  return <canvas ref={canvas} data-lens-source="true" role="img" aria-label="Animated dot artwork gallery" style={{display:'block',width:'100%',height:'auto',aspectRatio:'934 / 465',borderRadius:20}} />;
}

function CaseInteractiveDemo({ media, lang }) {
  const dialog = React.useRef(null);
  const trigger = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const english = lang === 'en';
  React.useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    const escape = event => {
      if (event.origin === location.origin && event.source === node.querySelector('iframe')?.contentWindow && event.data === 'close-scanning-demo') setOpen(false);
    };
    window.addEventListener('message', escape);
    return () => {
      window.removeEventListener('message', escape);
      document.body.style.overflow = previous;
      node.close();
      trigger.current?.focus({preventScroll:true});
    };
  }, [open]);
  return <>
    <div className="case-demo-preview">
      <video className="case-media-content" src={media.previewSrc} poster={media.poster}
        aria-label={media.alt} autoPlay muted loop playsInline preload="metadata"
        style={{display:'block',width:'100%',aspectRatio:media.aspectRatio || '940 / 598',objectFit:'contain'}} />
      <button ref={trigger} type="button" className="case-demo-launch" aria-label={english ? 'Try the interactive demo' : '打开可操作演示'} title={english ? 'Try it' : '亲手体验'} onClick={() => setOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M10 18.5h4M10.5 8l4 3-4 3V8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
      </button>
    </div>
    {open && ReactDOM.createPortal(<dialog ref={dialog} className="case-demo-dialog" aria-label={english ? 'Interactive light recognition demo' : '灯珠识别互动演示'} onCancel={event => {event.preventDefault();setOpen(false);}} onClick={event => {if(event.target===event.currentTarget)setOpen(false);}}>
      <div className="case-demo-modal-content">
        <button type="button" className="case-demo-close" aria-label={english ? 'Close demo' : '关闭演示'} onClick={() => setOpen(false)}>×</button>
        <iframe title={english ? 'Manually operate the phone demo' : '手动操作手机演示'} src="assets/works/pimax/scanning-demo/phone.html?manual=1" />
      </div>
    </dialog>, document.body)}
    <style>{`
      .case-demo-preview{position:relative;background:#181818}
      .case-demo-launch{position:absolute;left:22px;bottom:22px;z-index:5;display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:rgba(255,255,255,.08);color:#fff;backdrop-filter:blur(12px);transition:background 180ms,transform 180ms}
      .case-demo-launch:hover{background:rgba(255,255,255,.18);transform:scale(1.06)}
      .case-demo-launch:focus-visible,.case-demo-close:focus-visible{outline:2px solid #8df74b;outline-offset:4px}
      .case-demo-dialog{padding:0;border:0;background:transparent;overflow:visible;max-width:none;max-height:none;color:#fff}
      .case-demo-dialog::backdrop{background:rgba(0,0,0,.72);backdrop-filter:blur(14px)}
      .case-demo-modal-content{position:relative;width:min(375px,calc(100vw - 64px),calc((100dvh - 64px)*375/813));aspect-ratio:375/813}
      .case-demo-modal-content iframe{width:100%;height:100%;border:1px solid rgba(255,255,255,.18);border-radius:32px;background:#000;box-shadow:0 24px 100px rgba(0,0,0,.5)}
      .case-demo-close{position:absolute;right:-18px;top:-18px;z-index:2;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:#272727;color:white;font:26px/1 Arial}
      .case-demo-dialog,.case-demo-dialog *{cursor:auto!important}.case-demo-dialog button{cursor:pointer!important}
      @media(max-width:600px){.case-demo-launch{left:12px;bottom:12px;width:36px;height:36px}}
    `}</style>
  </>;
}

function CasePhoneLoop({ media, lang }) {
  const [active, setActive] = React.useState(0);
  const root = React.useRef(null);
  const start = React.useRef(null);
  const busy = React.useRef(false);
  const items = media.items || [];
  const move = React.useCallback(direction => {
    if (busy.current || items.length < 2) return;
    busy.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frames = slot => ({transform:`translateX(-50%) translateX(calc(${slot} * var(--phone-step)))`, opacity:1});
    const animations = Array.from(root.current.querySelectorAll('img')).map(img => {
      const slot = Number(img.dataset.slot);
      return img.animate([frames(slot), frames(slot - direction)], {duration:reduced ? 0 : 700, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards'});
    });
    Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      setActive(value => (value + direction + items.length) % items.length);
      busy.current = false;
    });
  }, [items.length]);
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => { if (!start.current) move(1); }, 2000);
    return () => clearTimeout(timer);
  }, [active, move]);
  return <div ref={root} className="case-scroll-item case-phone-loop" role="group" tabIndex={0}
    aria-label={lang === 'zh' ? '不同场景下的找车体验，左右滑动切换' : 'Matching scenarios. Swipe left or right to change'}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();move(event.key === 'ArrowRight' ? 1 : -1);} }}
    onPointerDown={event => {start.current = {x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}}
    onPointerUp={event => {const from = start.current;start.current = null;if (from && Math.abs(event.clientX-from.x)>30 && Math.abs(event.clientX-from.x)>Math.abs(event.clientY-from.y)) move(event.clientX<from.x?1:-1);}}
    onPointerCancel={() => {start.current = null;}}>
    {items.length > 0 && [-1,0,1].map(slot => {const item=items[(active+slot+items.length*2)%items.length];return <img key={`${active}-${slot}`} data-slot={slot} src={item.src} alt={slot === 0 ? item.alt : ''} aria-hidden={slot !== 0} draggable={false} style={{transform:`translateX(-50%) translateX(calc(${slot} * var(--phone-step)))`,opacity:1}} />;})}
  </div>;
}

function CaseStoryImage({ item, index, total, lang, active }) {
  const image = React.useRef(null);
  const failedSource = React.useRef(item.src);
  const [attempt, setAttempt] = React.useState(0);
  const [reload, setReload] = React.useState(0);
  const [status, setStatus] = React.useState('loading');
  const english = lang === 'en';
  const retry = React.useCallback(() => { setStatus('loading'); setAttempt(0); setReload(value => value + 1); }, []);
  let src = attempt >= 2 && item.fallbackSrc ? item.fallbackSrc : attempt ? failedSource.current : item.src;
  if (attempt || reload) src += `${src.includes('?') ? '&' : '?'}image_retry=${reload}-${attempt}`;

  React.useEffect(() => {
    const node = image.current;
    let cancelled = false, settled = false, retryTimer;
    setStatus('loading');
    const failed = () => {
      if (cancelled || settled) return;
      settled = true; clearTimeout(timeout);
      if (!attempt) failedSource.current = node.currentSrc || item.src;
      if (attempt < 2) retryTimer = window.setTimeout(() => setAttempt(value => value + 1), 700 * (attempt + 1));
      else setStatus('error');
    };
    const loaded = async () => {
      try {
        if (node.decode) await node.decode();
        if (cancelled || settled) return;
        if (!node.naturalWidth) { failed(); return; }
        settled = true; clearTimeout(timeout); setStatus('ready');
      } catch (_) { failed(); }
    };
    const timeout = window.setTimeout(failed, 15000);
    node.addEventListener('load', loaded); node.addEventListener('error', failed);
    if (node.complete) { if (node.naturalWidth) loaded(); else failed(); }
    return () => { cancelled = true; clearTimeout(timeout); clearTimeout(retryTimer); node.removeEventListener('load', loaded); node.removeEventListener('error', failed); };
  }, [item.src, item.srcSet, item.sizes, item.fallbackSrc, attempt, reload]);

  React.useEffect(() => {
    if (status !== 'error') return;
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [status, retry]);

  return <div className="case-media-frame case-story-media" data-image-state={status} aria-busy={status === 'loading'}>
    <img key={`${reload}-${attempt}`} ref={image} className="case-media-content" src={src}
      srcSet={attempt === 0 ? item.srcSet : undefined} sizes={item.sizes}
      alt={item.alt || ''} loading="eager" decoding="async" fetchPriority={active ? 'high' : 'auto'} draggable={false}
      aria-hidden={status !== 'ready'} />
    {status !== 'ready' && <div className="case-story-loading" role={active ? 'status' : undefined}>
      <span className="case-story-loading-index" aria-hidden="true">VISUAL / {String(index + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}</span>
      <div className="case-story-orbit" aria-hidden="true"><span /><span /><i /><b>+</b></div>
      <div className="case-story-loading-copy">
        <span className="case-story-loading-title">{status === 'error' ? (english ? 'Signal interrupted' : '暂时未能载入') : (english ? 'Loading visual' : '正在载入作品')}</span>
        <span>{status === 'error' ? (english ? 'Reconnect and try again' : '请检查网络后重试') : attempt ? (english ? 'Reconnecting…' : '正在重新连接…') : (english ? 'A moment, please' : '稍候，画面即将呈现')}</span>
        {status === 'error' && <button type="button" onPointerDown={event => event.stopPropagation()} onClick={retry}>{english ? 'Retry' : '重新加载'} <span aria-hidden="true">↗</span></button>}
      </div>
    </div>}
    {status === 'ready' && <window.WorkGlassLens fit="contain" compositeBackground />}
  </div>;
}

function CaseImageCarousel({ media, lang }) {
  const track = React.useRef(null);
  const drag = React.useRef(null);
  const coast = React.useRef(0);
  React.useEffect(()=>()=>cancelAnimationFrame(coast.current),[]);
  const [active, setActive] = React.useState(0);
  const items = media.items || [];
  const pages=items.length;
  const go = index => {
    const node=track.current, card=node?.children[index];
    if(card) node.scrollTo({left:card.offsetLeft-node.children[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  };
  return <div className="case-story-carousel">
    <div ref={track} className="case-story-track"
      onPointerDown={event=>{
        if(event.target.closest('button, a'))return;
        if(event.pointerType!=='mouse'||event.button!==0)return;
        const node=event.currentTarget;
        cancelAnimationFrame(coast.current);
        drag.current={id:event.pointerId,x:event.clientX,left:node.scrollLeft,lastX:event.clientX,time:performance.now(),velocity:0};
        node.setPointerCapture(event.pointerId);
        node.classList.add('is-dragging');
        event.preventDefault();
      }}
      onPointerMove={event=>{
        const state=drag.current;
        if(state&&state.id===event.pointerId){
          const now=performance.now(),dt=Math.max(1,now-state.time);
          state.velocity=state.velocity*.4+(state.lastX-event.clientX)/dt*.6;
          state.lastX=event.clientX;state.time=now;
          event.currentTarget.scrollLeft=state.left+state.x-event.clientX;
        }
      }}
      onPointerUp={event=>{
        if(!drag.current)return;
        const node=event.currentTarget;
        const state=drag.current;
        drag.current=null;node.classList.remove('is-dragging');
        if(node.hasPointerCapture(event.pointerId))node.releasePointerCapture(event.pointerId);
        let velocity=performance.now()-state.time>90?0:Math.max(-2.5,Math.min(2.5,state.velocity)),previous=performance.now();
        const glide=now=>{
          const dt=Math.min(32,now-previous);previous=now;
          const before=node.scrollLeft;node.scrollLeft+=velocity*dt;
          velocity*=Math.exp(-dt/180);
          if(Math.abs(velocity)>.02&&Math.abs(node.scrollLeft-before)>.1)coast.current=requestAnimationFrame(glide);
        };
        coast.current=requestAnimationFrame(glide);
      }}
      onLostPointerCapture={event=>{drag.current=null;event.currentTarget.classList.remove('is-dragging');}}
      onPointerCancel={event=>{drag.current=null;event.currentTarget.classList.remove('is-dragging');}}
      onScroll={event=>{
      const node=event.currentTarget,step=node.children[1]?.offsetLeft-node.children[0]?.offsetLeft;
      if(step)setActive(node.scrollLeft >= node.scrollWidth-node.clientWidth-2 ? pages-1 : Math.min(pages-1,Math.round(node.scrollLeft/step)));
    }}>
      {items.map((item,index)=><figure className="case-story-card" key={`${item.id}-${item.src}`}>
        <CaseStoryImage item={item} index={index} total={pages} lang={lang} active={active === index} />
      </figure>)}
    </div>
    <div className="case-story-controls">
      <div className="case-story-dots">{items.slice(0,pages).map((item,index)=><button key={item.id} onClick={()=>go(index)} aria-label={`${lang==='en'?'View image':'查看图片'} ${index+1}`} aria-current={active===index?'true':undefined} />)}</div>
      <div><button onClick={()=>go(Math.max(0,active-1))} disabled={active===0} aria-label={lang==='en'?'Previous':'上一张'}>←</button><button onClick={()=>go(Math.min(pages-1,active+1))} disabled={active>=pages-1} aria-label={lang==='en'?'Next':'下一张'}>→</button></div>
    </div>
  </div>;
}

function CaseBroadcastVideo({ media, lang }) {
  const [stage, setStage] = React.useState(0);
  const timeline = React.useRef(null);
  const labels = lang === 'en'
    ? ['Within 1 minute', 'After 5 minutes', 'After 10 minutes']
    : ['1 分钟内', '5 分钟后', '10分钟之后'];
  const syncStage = event => {
    const time = event.currentTarget.currentTime;
    setStage(time >= 2.64 ? 2 : time >= 2 ? 1 : 0);
    const progress = time < 2 ? time / 4 : .5 + Math.min(1, (time - 2) / .64) / 2;
    timeline.current?.style.setProperty('--broadcast-progress', `${progress * 100}%`);
  };
  return <>
    <video className="case-media-content" src={media.src}
      autoPlay muted loop playsInline preload="auto"
      aria-label={media.alt || media.label}
      onTimeUpdate={syncStage} onSeeking={syncStage} onLoadedData={syncStage}
      style={{display:'block',width:'100%',height:'auto',aspectRatio:media.aspectRatio,objectFit:media.fit || 'contain'}} />
    <ol ref={timeline} className="case-broadcast-timeline" aria-label={lang === 'en' ? 'Elapsed waiting time' : '已等待时间'}>
      {labels.map((label, index) => <li key={label} aria-current={index === stage ? 'step' : undefined}>
        <span>{label}</span>
      </li>)}
    </ol>
  </>;
}

function CaseWeatherTabs({ media, lang }) {
  const options = media.options || [];
  const [selected, setSelected] = React.useState(media.defaultOption || 'snow');
  const active = options.find(option => option.id === selected) || options[0];
  const [visible, setVisible] = React.useState(null);
  const videoNodes = React.useRef({});
  React.useEffect(() => {
    Object.entries(videoNodes.current).forEach(([id, node]) => {
      if (node && id !== selected) node.pause();
    });
    const video = videoNodes.current[selected];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [selected]);
  const english = lang === 'en';
  const labels = english ? { snow: 'Snow', rain: 'Rain', dust: 'Dust' } : { snow: '下雪', rain: '下雨', dust: '沙尘' };
  const choose = id => setSelected(id);
  const tabs = React.useRef(null);
  React.useLayoutEffect(() => {
    const list = tabs.current;
    const update = () => {
      const button = list.querySelector('[aria-selected="true"]');
      if (!button) return;
      list.style.setProperty('--weather-tab-offset', `${button.offsetLeft}px`);
      list.style.setProperty('--weather-tab-width', `${button.offsetWidth}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active?.id, lang]);
  return <figure className="case-scroll-item case-weather" style={{margin:0}}>
    <div className={`case-weather-stage${media.copy ? ' case-weather-stage--with-copy' : ''}`}>
      {media.copy && <div className="case-weather-copy"><h2>{media.copy.title}</h2>{media.copy.body && <p>{media.copy.body}</p>}</div>}
      <div className="case-weather-tabs" role="tablist" aria-label={english ? 'Weather conditions' : '天气场景'} aria-orientation="horizontal" ref={tabs}>
        <span className="case-weather-indicator" aria-hidden="true" />
        {options.map((option,index) => <button key={option.id} type="button" role="tab" id={`weather-tab-${option.id}`} aria-label={labels[option.id] || option.label} title={labels[option.id] || option.label} aria-selected={active?.id === option.id} aria-controls="weather-panel" tabIndex={active?.id === option.id ? 0 : -1} onClick={() => choose(option.id)} onKeyDown={event => {
          let next;
          if (['ArrowDown','ArrowRight'].includes(event.key)) next=(index+1)%options.length;
          if (['ArrowUp','ArrowLeft'].includes(event.key)) next=(index+options.length-1)%options.length;
          if (event.key==='Home') next=0;
          if (event.key==='End') next=options.length-1;
          if(next!==undefined){event.preventDefault();choose(options[next].id);document.getElementById(`weather-tab-${options[next].id}`)?.focus();}
        }} className="case-weather-tab">{labels[option.id] || option.label}</button>)}
      </div>
      <div className="case-weather-phone" id="weather-panel" role="tabpanel" aria-labelledby={`weather-tab-${active?.id}`}>
        <img className="case-weather-hardware" src={media.phoneFrame} alt="" />
        <div className="case-weather-screen">
          {options.filter(option => option.media?.type === 'video' && option.media.src).map(option => <video
            key={option.id}
            ref={node => { videoNodes.current[option.id] = node; }}
            className={`case-weather-video${visible === option.id ? ' is-visible' : ''}`}
            src={option.media.src}
            preload="auto" muted playsInline
            aria-hidden={visible !== option.id}
            onPlaying={() => { if (selected === option.id) setVisible(option.id); }}
            onEnded={() => {
              if (selected !== option.id) return;
              const index = options.findIndex(item => item.id === option.id);
              choose(options[(index + 1) % options.length].id);
            }}
          />)}
          {active?.media?.type !== 'video' && (active?.media?.src ? <img src={active.media.src} alt={active.media.alt || active.label} /> : <div className="case-weather-empty">{english ? `${labels[active?.id]} media` : `${active?.label}素材待上传`}</div>)}
          {active?.media?.src && active.media.type !== 'video' && <window.WorkGlassLens key={active.media.src} fit="contain" />}
          {visible && active?.media?.type === 'video' && <window.WorkGlassLens key={visible} fit="contain" sourceType="video" sourceSelector="video.is-visible" />}
        </div>
      </div>
    </div>
    {media.caption && <figcaption className="case-media-caption">{media.caption}</figcaption>}
  </figure>;
}

/**
 * Harbor 作品详情 — 与首页共用 SiteTopbar + getAsciiThemePalette
 */

if (typeof window.getSiteCursorStyle !== 'function') {
  window.getSiteCursorStyle = function getSiteCursorStyleFallback(cur, C) {
    return {
      position: 'fixed', pointerEvents: 'none', zIndex: 200, left: cur.x, top: cur.y,
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

function CaseComparison({ media, lang }) {
  const [position, setPosition] = React.useState(50);
  const [ratio, setRatio] = React.useState(media.aspectRatio || '2 / 1');
  const followPointer = event => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)));
  };
  const before = media.before || {};
  const after = media.after || {};
  const image = (item, side) => item.src
    ? <img src={item.src} alt={item.alt || side} draggable={false} onLoad={side === 'Before' ? event => {
      if (!media.aspectRatio) setRatio(`${event.target.naturalWidth} / ${event.target.naturalHeight}`);
    } : undefined} />
    : <div className="case-compare-empty">{lang === 'zh' ? `请在后台上传${side === 'Before' ? '改版前' : '改版后'}界面` : `Upload the ${side.toLowerCase()} image in the editor`}</div>;
  return <figure className="case-scroll-item case-comparison" style={{margin:0}}>
    <div className="case-comparison-stage" onPointerEnter={followPointer} onPointerMove={followPointer} style={{aspectRatio:ratio, '--compare-position':`${position}%`}}>
      <div className="case-comparison-layer">{image(after, 'After')}</div>
      <div className="case-comparison-layer case-comparison-before" style={{clipPath:`inset(0 ${100-position}% 0 0)`}}>{image(before, 'Before')}</div>
      <span className="case-compare-label case-compare-label-before">Before</span>
      <span className="case-compare-label case-compare-label-after">After</span>
      <div className="case-comparison-divider" aria-hidden="true">
        <span><svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M8 4 4 8l4 4M14 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </div>
      <input className="case-comparison-range" type="range" min="0" max="100" step="0.1" value={position}
        aria-label={lang === 'zh' ? '左右移动查看改版前后对比' : 'Move left and right to compare before and after'}
        aria-valuetext={`${position}% Before`} onChange={event => setPosition(Number(event.target.value))} />
    </div>
    {media.caption && <figcaption className="case-media-caption">{media.caption}</figcaption>}
  </figure>;
}

function PimaxFooterReveal({ children }) {
  const footer = React.useRef(null);
  React.useEffect(() => {
    const node = footer.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const remaining = Math.max(0, Math.min(1, node.getBoundingClientRect().top / height));
      node.style.setProperty('--footer-card-offset', reduced.matches ? '0px' : `${-height * .3 * remaining ** 3}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);
  return <div ref={footer} className="pimax-case-end">{children}</div>;
}

function ViewportCaseLens(props) {
  const marker = React.useRef(null);
  const [nearViewport, setNearViewport] = React.useState(false);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setNearViewport(entry.isIntersecting);
    }, { rootMargin: '160px' });
    observer.observe(marker.current.parentElement);
    return () => observer.disconnect();
  }, []);
  return <>
    <span ref={marker} hidden />
    {nearViewport && <window.WorkGlassLens {...props} />}
  </>;
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
    return window.getAsciiInitialTheme ? window.getAsciiInitialTheme() : 'light';
  });
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem('ascii-lang') || 'en'; } catch { return 'en'; }
  });
  const [savedCase, setSavedCase] = React.useState(null);
  const [orderedWorks, setOrderedWorks] = React.useState([
    { id: '02', href: 'work-pimax.html' }, { id: '01', href: 'work-huolala.html' },
  ]);
  React.useEffect(() => {
    const caseClass = window.__workCaseData?.zh?.className;
    if (!['huolala-case', 'pimax-case'].includes(caseClass)) return undefined;
    let active = true;
    const load = () => fetch(window.__STATIC_CONTENT__ ? '/data/site-content.json' : '/api/content', { cache: window.__STATIC_CONTENT__ ? 'default' : 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        if (!active) return;
        if (caseClass === 'huolala-case') setSavedCase(data.cases || null);
        if (Array.isArray(data.works)) setOrderedWorks(data.works.filter(item => item.href && item.href !== '#'));
      })
      .catch(() => {});
    load();
    const timer = window.__STATIC_CONTENT__ ? null : window.setInterval(load, 3000);
    const channel = !window.__STATIC_CONTENT__ && 'BroadcastChannel' in window ? new BroadcastChannel('portfolio-content') : null;
    if (channel) channel.onmessage = load;
    return () => { active = false; clearInterval(timer); channel?.close(); };
  }, []);
  const rawWork = (window.__workCaseData?.zh?.className === 'huolala-case' && savedCase?.huolala && (lang === 'en'
    ? window.buildHuolalaEnglish(savedCase.huolala, savedCase.huolalaEnglish?.overrides || {})
    : savedCase.huolala)) || (window.__workCaseData && window.__workCaseData[lang]) || defaultWork;
  const ui = lang === 'zh'
    ? { overview: '概览', client: '客户', year: '年份', role: '角色', team: '团队', context: '背景', process: '过程', gallery: '画廊', outcome: '成果', credits: '鸣谢', back: '← 返回', allWork: '全部案例' }
    : { overview: 'overview', client: 'Client', year: 'Year', role: 'Role', team: 'Team', context: 'context', process: 'process', gallery: 'gallery', outcome: 'outcome', credits: 'credits', back: '← back', allWork: 'all work' };
  const currentCaseId = rawWork.className === 'pimax-case' ? '02' : '01';
  const currentCaseIndex = orderedWorks.findIndex(item => item.id === currentCaseId);
  const previousCase = currentCaseIndex > 0 ? orderedWorks[currentCaseIndex - 1] : null;
  const nextCase = currentCaseIndex >= 0 ? orderedWorks[currentCaseIndex + 1] : null;
  const footerCard = nextCase || previousCase;
  const isPortfolioCase = ['pimax-case', 'huolala-case'].includes(rawWork.className);
  const footerIsPimax = footerCard?.id === '02';
  const footerTitle = footerCard?.title || (footerIsPimax ? 'Pimax' : lang === 'zh' ? '货拉拉' : 'Huolala');
  const footerDescription = footerCard?.description || (footerIsPimax
    ? (lang === 'zh' ? '智能灯串的数字体验设计' : 'A smart light string experience.')
    : (lang === 'zh' ? '让货运出行更简单的产品设计' : 'A simpler way to move goods.'));
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
    work.showCover !== false && !(work.cover && work.cover.src) && 'cover.src',
  ].filter(Boolean);
  const metadata = Array.isArray(work.meta) ? work.meta : [
    work.client && { label: ui.client, value: work.client },
    work.year && { label: ui.year, value: work.year },
    work.role && { label: ui.role, value: work.role },
    work.team && { label: ui.team, value: work.team },
  ].filter(Boolean);
  const compactOverview = work.className === 'huolala-case' || work.overviewLayout === 'compact';
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
    document.documentElement.dataset.theme = theme;
    document.body.style.background = C.bg;
  }, [theme, C.bg]);

  React.useEffect(() => {
    if (!window.watchAsciiAutomaticTheme) return undefined;
    return window.watchAsciiAutomaticTheme(setTheme);
  }, []);

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
      setCur((c) => ({ ...c, x: e.clientX, y: e.clientY, visible: true, mode: e.target.closest('.case-comparison-stage') ? 'native' : e.target.closest('.case-story-track') ? 'drag' : e.target.closest('.case-media-frame, .case-banner-cover, .case-weather-screen') ? 'case' : (['case','drag','native'].includes(c.mode) ? 'default' : c.mode) }));
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
    const motion = new Map();
    const animateScrollMotion = () => {
      frame = 0;
      let needsAnotherFrame = false;
      const viewport = Math.max(window.innerHeight || 0, 1);
      root.querySelectorAll('.case-scroll-item').forEach((node) => {
        const state = motion.get(node) || { y: 18, scale: .96, opacity: .42 };
        const rect = node.getBoundingClientRect();
        // A row resolves as it travels through the lower half of the viewport.
        // The transform is visual only, so the document's grid and gaps never move.
        const progress = Math.max(0, Math.min(1, (viewport * .93 - rect.top) / (viewport * .62)));
        const targetY = (1 - progress) * 20;
        const targetScale = work.className === 'huolala-case' ? 1 : .96 + progress * .04;
        const targetOpacity = .42 + progress * .58;
        state.y += (targetY - state.y) * .115;
        state.scale += (targetScale - state.scale) * .115;
        state.opacity += (targetOpacity - state.opacity) * .115;
        motion.set(node, state);
        node.style.setProperty('--case-scroll-y', `${state.y.toFixed(2)}px`);
        node.style.setProperty('--case-scroll-scale', state.scale.toFixed(4));
        node.style.setProperty('--case-scroll-opacity', `${state.opacity.toFixed(3)}`);
        if (Math.abs(targetY - state.y) > .04 || Math.abs(targetScale - state.scale) > .0004 || Math.abs(targetOpacity - state.opacity) > .004) needsAnotherFrame = true;
      });
      if (needsAnotherFrame) frame = window.requestAnimationFrame(animateScrollMotion);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(animateScrollMotion);
    };
    const onScroll = () => requestUpdate();
    requestUpdate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', onScroll);
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
    window.setTimeout(() => { window.location.assign('/#works'); }, 400);
  };

  const s = {
    wrap: {
      background: 'transparent',
      color: C.fg,
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--font-size-body)',
      lineHeight: 1.7,
      minHeight: '100vh',
      padding: 'var(--page-padding)',
      position: 'relative',
      cursor: 'none',
      transition: 'background var(--duration-normal), color var(--duration-normal)',
    },
    title: {
      fontSize: 'var(--font-size-title)',
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
      gap: 'var(--space-6)',
      padding: '16px 0',
      borderTop: `1px dashed ${C.line}`,
      borderBottom: `1px dashed ${C.line}`,
      marginBottom: 48,
    },
    metaLabel: {
      color: C.dim,
      fontSize: 'var(--font-size-label)',
      letterSpacing: 'var(--letter-spacing-label)',
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    metaVal: { color: C.fg, fontSize: 'var(--font-size-body)' },
    hero: {
      width: '100%',
      aspectRatio: '16/9',
      background: dark ? '#1a1410' : C.dot,
      border: `1px solid ${C.line}`,
      marginBottom: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    caption: { fontSize: 'var(--font-size-caption)', color: C.dim, marginBottom: 'var(--space-12)' },
    sectionTitle: {
      color: C.faint,
      fontSize: 'var(--font-size-caption)',
      letterSpacing: 'var(--letter-spacing-label)',
      marginTop: 40,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    prose: { maxWidth: 680, color: C.chipText, fontSize: 14, lineHeight: 'var(--line-height-prose)', marginBottom: 'var(--space-8)' },
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

  const CaseLens = work.className === 'pimax-case' ? ViewportCaseLens : window.WorkGlassLens;

  const renderMedia = (rawMedia, key) => {
    const media = typeof rawMedia === 'string' ? { type: 'image', src: rawMedia } : (rawMedia || {});
    const type = media.type || 'image';
    const radius = media.radius == null ? 12 : media.radius;
    let content;

    if (type === 'dot-gallery') {
      content = <CaseDotGallery />;
    } else if (type === 'inline-artwork') {
      const artwork = document.getElementById(media.templateId);
      const svg = artwork.innerHTML.trim();
      content = <>
        <div className="case-inline-artwork" role="img" aria-label={media.alt}
          dangerouslySetInnerHTML={{ __html: svg }} />
        <img data-inline-lens-source alt="" aria-hidden="true"
          src={`data:image/svg+xml,${encodeURIComponent(svg)}#opening-animated.svg`}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
      </>;
    } else if (type === 'iframe') {
      content = <CaseInteractiveDemo media={media} lang={lang} />;
    } else if (type === 'placeholder') {
      content = <div className="case-placeholder" role="img" aria-label={`${media.label}${lang === 'en' ? ', media pending' : '，图片待补充'}`} data-asset-slot={media.id} data-figma-node={media.nodeId} style={{ aspectRatio: media.aspectRatio }}>
        <span className="case-placeholder-number">{media.id.split('-')[0]}</span>
        <span>{media.label}</span>
        <span className="case-placeholder-hint">{lang === 'en' ? 'Media coming soon' : '图片待补充'}</span>
      </div>;
    } else if (type === 'video' && media.id === '08-broadcast-motion') {
      content = <CaseBroadcastVideo media={media} lang={lang} />;
    } else if (type === 'video') {
      content = (
        <video
          className="case-media-content"
          src={media.src}
          poster={media.poster}
          onError={media.fallbackSrc ? (event) => {
            event.currentTarget.poster = media.fallbackSrc;
          } : undefined}
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
          className="case-media-content"
          draggable={false}
          src={media.src}
          alt={media.alt || media.title || ''}
          loading={media.loading || 'lazy'}
          fetchPriority={media.fetchPriority}
          onError={media.fallbackSrc ? (event) => {
            const image = event.currentTarget;
            if (image.getAttribute('src') !== media.fallbackSrc) image.src = media.fallbackSrc;
          } : undefined}
          style={{ display: 'block', width: '100%', height: media.height || 'auto', aspectRatio: media.aspectRatio, objectFit: media.fit || 'contain' }}
        />
      );
    }

    return (
      <figure key={key} data-png-media={type === 'image' && (media.pngBackground || /\.png(?:[?#]|$)/i.test(media.src || '')) ? 'true' : undefined} data-invert-on-theme={['06-pricing-detail-1', '06-pricing-detail-2'].includes(media.id) ? 'dark' : media.invertOnTheme} className={media.scrollMotion === false ? undefined : 'case-scroll-item'} style={{ margin: 0 }}>
        {(media.title || media.subtitle) && <figcaption {...textProbe} style={{ marginBottom: 10 }}>
          {media.title && <div style={s.blockTitle}>{media.title}</div>}
          {media.subtitle && <div style={s.blockSubtitle}>{media.subtitle}</div>}
        </figcaption>}
        <div className="case-media-frame" style={media.frame === false
          ? { overflow: 'hidden', background: 'transparent', border: 'none', borderRadius: radius, '--case-media-radius': `${radius}px` }
          : { ...s.mediaFrame, borderRadius: radius, '--case-media-radius': `${radius}px` }}>
          {content}
          {type === 'inline-artwork' && <CaseLens fit="contain" sourceSelector="[data-inline-lens-source]" />}
          {type === 'dot-gallery' && <CaseLens fit="contain" sourceType="canvas" />}
          {(type === 'image' || type === 'video' || type === 'iframe') && <CaseLens key={media.src} fit={media.fit || 'contain'} sourceType={type === 'iframe' ? 'video' : type} compositeBackground={work.className === 'huolala-case' && type === 'image'} />}
        </div>
        {media.caption && <figcaption className="case-media-caption" {...textProbe} style={{ ...s.caption, margin: '10px 0 0' }}>{media.caption}</figcaption>}
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

    if (type === 'phone-loop') return <CasePhoneLoop key={key} media={block} lang={lang} />;
    if (type === 'image-carousel') return <CaseImageCarousel key={key} media={block} lang={lang} />;
    if (type === 'weather-tabs') return <CaseWeatherTabs key={key} media={block} lang={lang} />;
    if (type === 'comparison') return <CaseComparison key={key} media={block} lang={lang} />;
    if (type === 'case-copy') {
      const heading = String(block.title || '');
      const separator = heading.search(/[：:]/);
      const splitHeading = separator > 0 && heading.slice(separator + 1).trim();
      const isProblems = block.variant === 'problems';
      const isGoals = block.variant === 'goals';
      const items = String(block.body || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
        const clean = line.replace(/^\d+[、.．\s]+/, '');
        const split = clean.indexOf('｜');
        return split < 0 ? {title: clean, description: ''} : {title: clean.slice(0, split), description: clean.slice(split + 1)};
      });
      const icons = ['M4 19v-4m5 4v-8m5 8V7m5 12V3', 'M4 5h16M4 12h10M4 19h6', 'M4 17l6-6 4 3 6-9M15 5h5v5'];
      return <div key={key} className={`case-editorial-copy case-editorial-copy--${block.variant || 'body'}`} {...textProbe}>
        {block.eyebrow && <p className="case-editorial-eyebrow">{block.eyebrow}</p>}
        {block.title && <h2>{splitHeading ? <>
          <span className="case-heading-primary">{heading.slice(0, separator).trim()}</span>
          <span className="case-heading-secondary">{heading.slice(separator + 1).trim()}</span>
        </> : block.title}</h2>}
        {block.intro && <p className="case-panel-intro">{block.intro}</p>}
        {isProblems || isGoals ? <ul className={isProblems ? 'case-problem-cards' : 'case-problem-cards case-goal-cards'}>
          {items.map((item, index) => <li key={index}>
            {(isProblems || isGoals) ? <svg className="case-problem-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[index % icons.length]} /></svg>
              : null}
            <div><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</div>
          </li>)}
        </ul> : (!block.captionBodyMoved && <p>{block.body}</p>)}
      </div>;
    }
    if (type === 'placeholder') return renderMedia({...block, frame: false, radius: 20}, key);
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
      return <div key={key} className="case-content-gallery case-scroll-item" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: block.gap || 20 }}>
        {(block.items || []).map((item, index) => renderMedia({ type: 'image', radius: block.radius, frame: block.frame, fit: block.fit, aspectRatio: block.aspectRatio, scrollMotion: false, ...(typeof item === 'string' ? { src: item } : item) }, `${key}-${index}`))}
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
    <div ref={rootRef} className={work.className} lang={lang === 'zh' ? 'zh-CN' : 'en'} style={s.wrap}>
      <svg width="0" height="0" aria-hidden="true" style={{position:'absolute',pointerEvents:'none'}}>
        <defs><filter id="case-neutral-invert" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="difference" result="chroma" />
          <feColorMatrix in="chroma" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 4 4 0 0" result="colorMask" />
          <feComponentTransfer in="colorMask" result="mask"><feFuncA type="table" tableValues="0 0 0 1 1" /></feComponentTransfer>
          <feColorMatrix in="SourceGraphic" type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" result="inverted" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="color" />
          <feComposite in="inverted" in2="mask" operator="out" result="neutral" />
          <feComposite in="color" in2="neutral" operator="arithmetic" k2="1" k3="1" />
        </filter>
        <filter id="case-dark-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="difference" result="chroma" />
          <feColorMatrix in="chroma" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 4 4 0 0" result="colorMask" />
          <feComponentTransfer in="colorMask" result="mask"><feFuncA type="table" tableValues="0 0 0 1 1" /></feComponentTransfer>
          <feComponentTransfer in="SourceGraphic" result="readableInk">
            {['R','G','B'].map(channel => {
              const Func = `feFunc${channel}`;
              const values = Array.from({length:256}, (_, i) => {
                const value = i / 255;
                const t = Math.max(0, Math.min(1, (.14 - value) / .025));
                const blend = t * t * (3 - 2 * t);
                return (value + (1 - 2 * value) * blend).toFixed(5);
              }).join(' ');
              return <Func key={channel} type="table" tableValues={values} />;
            })}
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="color" />
          <feComposite in="readableInk" in2="mask" operator="out" result="neutral" />
          <feComposite in="color" in2="neutral" operator="arithmetic" k2="1" k3="1" />
        </filter></defs>
      </svg>
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
          transform: translate3d(0, var(--case-scroll-y, 0px), 0) scale(var(--case-scroll-scale, 1));
          transform-origin: center center;
          will-change: transform, opacity;
          transition: none;
        }
        .case-media-frame {
          clip-path: inset(.01px round var(--case-media-radius, 12px));
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          backface-visibility: hidden;
          transform: translateZ(0);
          isolation: isolate;
        }
        .case-media-content {
          width: calc(100% + 2px) !important;
          max-width: none;
          margin: -1px;
          transform: translateZ(0) scale(1.001);
          transform-origin: center;
          backface-visibility: hidden;
        }
        img, video, a, button { cursor: none !important; }
        .case-glass-cursor { overflow: hidden; transition: opacity 120ms ease; }
        @media (hover: none), (pointer: coarse) { .case-glass-cursor { display: none; } }
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
      {work.bannerCover && work.showBanner !== false && <div className="case-banner-cover" role="img" aria-label={work.bannerCover.alt || '通栏封面，图片待补充'} style={work.bannerCover.src ? {backgroundImage: `url(${work.bannerCover.src})`} : undefined}>
        {!work.bannerCover.src && <span>封面图片待补充</span>}
      </div>}
      <SiteTopbar
        brand="Super lee"
        linkProbe={linkProbe}
        dark={dark}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        homeHrefPrefix="/"
        closeHref="/#works"
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
      <div id="overview" className={compactOverview ? 'case-overview' : 'case-scroll-item'} style={{ scrollMarginTop: 110 }}>
      {work.showCover !== false && work.coverPlacement === 'before-title' && renderCover()}
      <div {...textProbe}>
        <h1 style={s.title}>
          {work.title}{work.accent && <> <span style={{ color: C.accent }}>{work.accent}</span></>}
        </h1>
        {!compactOverview && <p style={s.lede}>{work.subtitle}</p>}
      </div>

      {work.showMeta !== false && metadata.length > 0 && <div className={compactOverview ? 'case-meta-grid' : 'case-scroll-item'} style={{ ...s.metaGrid, gridTemplateColumns: `repeat(${Math.min(metadata.length, 4)}, minmax(0, 1fr))` }}>
        {metadata.map((item, index) => <div key={`${item.label}-${index}`}><div style={s.metaLabel}>{item.label}</div><div style={s.metaVal}>{item.value}</div></div>)}
      </div>}

      {compactOverview && <p className="case-overview-intro" {...textProbe} style={{...s.lede, whiteSpace:'pre-line'}}>{work.subtitle}</p>}
      {work.showCover !== false && work.coverPlacement !== 'before-title' && renderCover()}
      </div>

      {(work.className === 'huolala-case' ? (() => {
        const background = work.sections.find(section => section.id === 'background');
        if (!background) return work.sections;
        const media = background.blocks.filter(block => block.type !== 'case-copy');
        return [
          {...background, id:'background-media', blocks:media},
          ...work.sections.filter(section => section.id !== 'background'),
        ];
      })() : work.sections).map((section, sectionIndex) => {
        const sectionId = section.id || `section-${sectionIndex + 1}`;
        const sectionTitle = section.title || ui[section.id] || section.id || `section ${sectionIndex + 1}`;
        const blocks = section.blocks || [];
        const displayBlocks = blocks;
        return <section key={sectionId} id={sectionId} style={{ scrollMarginTop: 110 }}>
          {section.hideTitle !== true && <div style={{ ...s.sectionTitle, ...(section.accent ? { color: C.accent } : {}) }}>── {sectionTitle} ─────────────────────────────────────────────</div>}
          <div style={s.blockStack}>{displayBlocks.map((block, blockIndex) => renderBlock(block, `${sectionId}-${blockIndex}`))}</div>
        </section>;
      })}

      {isPortfolioCase && (
        <PimaxFooterReveal>
          <nav className="pimax-footer-cards" aria-label={lang === 'zh' ? '案例导航' : 'Case navigation'}>
            {[['prev', previousCase], ['next', nextCase]].map(([direction, destination]) => (
              <a key={direction} className={'pimax-footer-arrow pimax-footer-arrow--' + direction}
                href={destination?.href || '/'}
                aria-label={destination ? (direction === 'prev' ? (lang === 'zh' ? '上一个案例' : 'Previous case') : (lang === 'zh' ? '下一个案例' : 'Next case')) : (lang === 'zh' ? '返回首页' : 'Back to home')}>
                <svg className={destination ? 'pimax-footer-dots' : 'pimax-footer-home'} viewBox="0 0 56 56" aria-hidden="true">
                  {(destination
                    ? [[0,3],[1,3],[2,3],[3,3],[4,3],[4,1],[5,2],[6,3],[5,4],[4,5]]
                    : ['0001000', '0010100', '0100010', '1100011', '1001001', '1001001', '1110111'].flatMap((row, y) =>
                        Array.from(row).flatMap((dot, x) => dot === '1' ? [[x, y]] : []))
                  ).map(([x, y]) => <circle key={x + ':' + y} cx={4 + x * 8} cy={4 + y * 8} r="2.08" />)}
                </svg>
              </a>
            ))}
            {footerCard && <a className="pimax-home-card" href={footerCard.href} {...linkProbe}>
              <window.AsciiTile n={footerCard.id} t={footerTitle} pat={{ bg: '#151515' }}
                img="assets/home/huolala.webp" cover={footerCard.cover} />
              <div className="work-caption">
                <h3>{footerTitle}</h3><p>{footerDescription}</p>
              </div>
            </a>}
          </nav>
          <small className="pimax-footer-copyright">@ 2026 · super lee</small>
        </PimaxFooterReveal>
      )}

      {!isPortfolioCase && !work.hideNextNav && <div className="case-scroll-item" style={s.nextNav}>
        <a href="/" {...linkProbe} style={{ textDecoration: 'none', color: C.fg }}>
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
      </div>}

      {!isPortfolioCase && !work.hideFooter && <div className="case-scroll-item" style={s.footer}>
        <span>© 2025 · handmade, kept simple</span>
        <span>v1.0 · last updated 2025.03</span>
      </div>}

      </main>
      </div>
      {work.className === 'pimax-case' && ['top', 'bottom'].map(edge => (
        <div key={edge} className={'pimax-scroll-diffusion pimax-scroll-diffusion--' + edge} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => {
            const progress = (index + 1) / 6;
            return <span key={index} style={{
              '--diffusion-radius': `${7 * (2 ** (4 * progress) - 1) / 15}px`,
              '--diffusion-start': `${index / 6 * 100}%`,
              '--diffusion-end': `${progress * 100}%`,
            }} />;
          })}
        </div>
      ))}
      <div className={`case-return-veil${leavingCase ? ' is-visible' : ''}`} aria-hidden="true" />

      <div style={{ ...cursorBlock, opacity: ['case','drag','native'].includes(cur.mode) ? 0 : cursorBlock.opacity }} />

    </div>
  );
}

window.WorkHarborPage = WorkHarborPage;
