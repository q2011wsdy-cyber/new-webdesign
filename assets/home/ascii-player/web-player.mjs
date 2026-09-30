import { AsciiRenderer } from './engine.mjs?v=gold-mesh-1';
import { MediaEffects, frameSettings, hasMotion } from './effects.mjs?v=gold-mesh-1';
import { makeDemo, drawDemo } from './demo.mjs';

// Mount multiple independent players; destroy each before removing its canvas.
export async function createAsciiPlayer(canvas, config) {
  const settings = { ...config.settings }, media = config.media;
  let element, mediaURL, running = false, destroyed = false, frame = 0, last = 0;
  let playVersion = 0, pendingPlay = null;
  let time = config.startTime || 0, speed = config.speed || 1;
  const loop = config.loop !== false;
  if (media.kind === 'demo') element = makeDemo();
  else {
    element = media.kind === 'video' ? document.createElement('video') : new Image();
    element.crossOrigin = 'anonymous';
    if (media.kind === 'video') { element.muted = true; element.playsInline = true; element.loop = loop; element.playbackRate = speed; }
    let url = new URL(media.src, import.meta.url).href;
    if (media.kind === 'video') {
      const response = await fetch(url, {signal: AbortSignal.timeout(60000)});
      if (!response.ok) throw new Error('Video download failed');
      mediaURL = URL.createObjectURL(await response.blob()); url = mediaURL;
    }
    await new Promise((resolve, reject) => {
      const event = media.kind === 'video' ? 'loadeddata' : 'load';
      const timer = setTimeout(() => done(new Error('Media load timeout')), 30000);
      const done = error => { clearTimeout(timer); element.removeEventListener(event, loaded); element.removeEventListener('error', failed); error ? reject(error) : resolve(); };
      const loaded = () => done(), failed = () => done(new Error('Media could not be loaded'));
      element.addEventListener(event, loaded); element.addEventListener('error', failed);
      element.src = url;
    }).catch(error => { if (mediaURL) URL.revokeObjectURL(mediaURL); throw error; });
  }
  const renderer = new AsciiRenderer(canvas), effects = new MediaEffects();
  const duration = media.kind === 'video' ? element.duration : media.duration || 8;
  const animated = media.kind === 'video' || (media.kind === 'demo' && media.name !== 'still') || hasMotion(settings);
  function render() {
    if (destroyed) return;
    if (media.kind === 'video') time = element.currentTime;
    if (media.kind === 'demo') drawDemo(element, media.name, time);
    renderer.render(effects.apply(element, media.width, media.height, settings, time), media.width, media.height, frameSettings(settings, time));
  }
  function tick(now) {
    if (!running || destroyed) return;
    const elapsed = last ? Math.min((now - last) / 1000, .1) : 0; last = now;
    if (media.kind !== 'video') {
      time += elapsed * speed;
      if (time >= duration) { if (loop) time %= duration; else { time = duration; running = false; } }
    } else if (element.ended) running = false;
    render(); if (running) frame = requestAnimationFrame(tick);
  }
  const api = {
    play() {
      if (destroyed || running || !animated) return Promise.resolve();
      if (pendingPlay) return pendingPlay;
      const version = ++playVersion;
      const operation = (async () => {
        if (time >= duration) await api.seek(0);
        if (destroyed || version !== playVersion) return;
        if (media.kind === 'video') await element.play();
        if (destroyed || version !== playVersion) return;
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      })();
      pendingPlay = operation;
      const clear = () => { if (pendingPlay === operation) pendingPlay = null; };
      operation.then(clear, clear);
      return operation;
    },
    pause() { playVersion++; pendingPlay = null; running = false; cancelAnimationFrame(frame); if (media.kind === 'video') element.pause(); },
    async seek(seconds) {
      if (destroyed) return;
      if (!Number.isFinite(seconds)) throw new Error('Invalid time');
      time = Math.max(0, Math.min(seconds, duration));
      if (media.kind === 'video') {
        const target = Math.min(time, Math.max(0, duration - .001));
        if (Math.abs(element.currentTime - target) > .00001) await new Promise((resolve, reject) => {
          const done = () => { clearTimeout(timer); resolve(); };
          const timer = setTimeout(() => { element.removeEventListener('seeked', done); reject(new Error('Seek timeout')); }, 15000);
          element.addEventListener('seeked', done, { once: true }); element.currentTime = target;
        });
      }
      render();
    },
    setSpeed(value) { if (!Number.isFinite(value) || value < .1 || value > 4) throw new Error('Speed must be 0.1–4'); speed = value; if (media.kind === 'video') element.playbackRate = value; },
    get currentTime() { return media.kind === 'video' ? element.currentTime : time; },
    get duration() { return duration; },
    destroy() { api.pause(); destroyed = true; if (media.kind === 'video') { element.removeAttribute('src'); element.load(); } if (mediaURL) URL.revokeObjectURL(mediaURL); renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
  await api.seek(time);
  if (config.autoplay !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches) await api.play().catch(() => {});
  return api;
}
