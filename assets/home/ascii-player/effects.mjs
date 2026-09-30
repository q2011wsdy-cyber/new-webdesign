import { outputSize } from './engine.mjs?v=gold-mesh-1';

export const hasMotion = settings => settings.motion !== 'none' || settings.colorCycle;
export function frameSettings(settings, time) {
  return { ...settings, meshTime: time, hue: settings.hue + (settings.colorCycle ? time * settings.motionSpeed * 45 : 0) };
}
export function bandOffset(mode, row, phase, amount, width) {
  if (mode === 'wave') return Math.sin(row * Math.PI * 4 + phase) * width * amount * .075;
  if (mode === 'glitch') {
    const seed = Math.sin(Math.floor(row * 28) * 127.1 + Math.floor(phase * 3) * 311.7) * 43758.5453;
    const noise = seed - Math.floor(seed);
    return noise > .74 ? (noise - .87) * width * amount * 1.2 : 0;
  }
  return 0;
}
// Continuous seeded value noise: repeatable when scrubbing or exporting a frame.
export function noiseField(x, y, time) {
  const hash = (a, b, c) => { const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return (n - Math.floor(n)) * 2 - 1; };
  const smooth = n => n * n * (3 - 2 * n), mix = (a, b, t) => a + (b - a) * t;
  const ix = Math.floor(x), iy = Math.floor(y), it = Math.floor(time);
  const fx = smooth(x - ix), fy = smooth(y - iy), ft = smooth(time - it);
  const plane = z => mix(mix(hash(ix, iy, z), hash(ix + 1, iy, z), fx), mix(hash(ix, iy + 1, z), hash(ix + 1, iy + 1, z), fx), fy);
  return mix(plane(it), plane(it + 1), ft);
}
export class MediaEffects {
  constructor() { this.canvas = document.createElement('canvas'); this.ctx = this.canvas.getContext('2d'); }
  apply(source, sourceWidth, sourceHeight, settings, time) {
    if (settings.motion === 'none' || !settings.motionAmount) return source;
    const { width, height } = outputSize(sourceWidth, sourceHeight);
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    const ctx = this.ctx, phase = time * settings.motionSpeed * Math.PI / 2;
    ctx.clearRect(0, 0, width, height);
    if (settings.motion === 'breathe') {
      const scale = 1 + Math.sin(phase) * settings.motionAmount * .22;
      ctx.drawImage(source, (width - width * scale) / 2, (height - height * scale) / 2, width * scale, height * scale);
    } else if (settings.motion === 'interval') {
      const step = Math.max(6, Math.round(height / 32));
      const pulse = (.5 + .5 * Math.sin(phase)) * settings.motionAmount;
      for (let y = 0, row = 0; y < height; y += step, row++) {
        const h = Math.min(step, height - y), visible = h * (1 - pulse * .8);
        const dx = (row % 2 ? 1 : -1) * Math.sin(phase) * settings.motionAmount * width * .025;
        ctx.drawImage(source, 0, y / height * sourceHeight, sourceWidth, h / height * sourceHeight, dx, y + (h - visible) / 2, width, visible);
      }
    } else if (settings.motion === 'noise') {
      const step = Math.max(8, Math.ceil(Math.max(width, height) / 70));
      const distance = Math.min(width, height) * settings.motionAmount * .09;
      for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
        const w = Math.min(step, width - x), h = Math.min(step, height - y);
        const nx = x / width * 4, ny = y / height * 4;
        const dx = noiseField(nx, ny, phase * .45) * distance;
        const dy = noiseField(nx + 17.2, ny + 9.4, phase * .45) * distance;
        ctx.drawImage(source, x / width * sourceWidth, y / height * sourceHeight, w / width * sourceWidth, h / height * sourceHeight, x + dx, y + dy, w, h);
      }
    } else {
      const step = settings.motion === 'glitch' ? Math.max(2, Math.ceil(height / 60)) : 3;
      for (let y = 0; y < height; y += step) {
        const bandHeight = Math.min(step, height - y), dx = bandOffset(settings.motion, y / height, phase, settings.motionAmount, width);
        ctx.drawImage(source, 0, y / height * sourceHeight, sourceWidth, bandHeight / height * sourceHeight, dx, y, width, bandHeight);
      }
    }
    return this.canvas;
  }
}
