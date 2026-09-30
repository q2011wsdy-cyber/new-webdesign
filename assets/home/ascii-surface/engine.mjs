export const CHARSETS = { classic: '.:i1tfLCG08@', braille: '⠁⠃⠇⠏⠟⠿⡿⣿', halftone: '·∙•●', cross: '·:+✚✳', lines: '─╌═╪╬', particles: '·∘°•✦✹', commodore: '∙░▒▖▚▞▓█', retro: ' .,:;ox%#@', terminal: ' .-=+|/<>#', binary: '01', blocks: '░▒▓█', minimal: '.+*#@' };
import {surfaceGeometry,drawSurface,surfaceSVG} from './surface.mjs';
import {SurfaceGPU} from './surface-gpu.mjs';
export const ART_STYLES = [
  ['classic', '经典 ASCII', '用字母与符号的覆盖率表现明暗。'],
  ['braille', '点字', '以逐渐密集的 Unicode 点阵表现层次。'],
  ['halftone', '半色调', '用不同大小的圆点模拟印刷网点。'],
  ['cross', '点十字', '从细点过渡到十字与星状交叉。'],
  ['lines', '线', '横线、双线与交叉线构成排线纹理。'],
  ['particles', '粒子', '细点、圆点与星点形成颗粒质感。'],
  ['commodore', '克劳德·科德', '以复古电脑块字符演绎截图中的风格名称，并非原站算法复刻。'],
  ['retro', '复古艺术', '用老式字符画的标点和密集字形描绘影像。'],
  ['terminal', '终端', '使用命令行标点、斜线与符号描绘轮廓。'],
];
export const DEFAULTS = { charset: 'classic', customChars: '.:i1tfLCG08@', density: 110, size: 1, fill: .95, lineSpacing: 1, weight: 'bold', gamma: 1, saturation: 1, hue: 0, dither: 0, motion: 'none', motionAmount: .35, motionSpeed: 1, colorCycle: false, colorMode: 'gradient', low: '#9b3814', high: '#fff0d1', brightness: 1, contrast: 1.1, invert: false, keyMode: 'none', keyColor: '#00ff00', threshold: .15, softness: .1, opacity: 1 };
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
Object.assign(DEFAULTS,{surface:false,surfaceDepth:.45,surfaceEdge:.25,surfaceFlow:.55,surfaceSparkle:.35,surfaceLines:.16,surfaceSpeed:.35});
Object.assign(DEFAULTS, { relief: false, sizeDepth: .7, lightDepth: .45, depthGamma: 1, reverseDepth: false });
Object.assign(DEFAULTS, { ring: false, ringX: .5, ringY: .46, ringWidth: .12, ringSoftness: .8, ringStrength: .65, ringGlow: .3, ringDuration: 6, ringPause: 2, ringColor: '#ffd6a0' });
export function ringFrame(settings, width, height) {
  const axis = [width / Math.min(width, height), height / Math.min(width, height)];
  const center = [settings.ringX ?? .5, settings.ringY ?? .46];
  const reach = Math.hypot(Math.max(center[0], 1-center[0])*axis[0], Math.max(center[1], 1-center[1])*axis[1]);
  const duration = settings.ringDuration ?? 6, half = (settings.ringWidth ?? .12) / 2;
  const cycle = duration + (settings.ringPause ?? 2), time = ((settings.frameTime ?? 0) % cycle + cycle) % cycle;
  return {axis, center, radius: -half + (reach + 2*half)*time/duration, half, active: Boolean(settings.ring) && time < duration};
}
export function ringWeight(x, y, frame, settings) {
  if (!frame.active) return 0;
  const d = Math.abs(Math.hypot((x-frame.center[0])*frame.axis[0], (y-frame.center[1])*frame.axis[1])-frame.radius);
  return (1-smoothstep(frame.half*(1-(settings.ringSoftness ?? .8)), frame.half, d))*(settings.ringStrength ?? .65);
}
export function ringTint(color, weight, settings) {
  const tint = hexRGB(settings.ringColor ?? '#ffd6a0');
  return color.map((value,i) => { const mixed = value+(tint[i]-value)*weight; return clamp(mixed+(1-mixed)*weight*(settings.ringGlow ?? .3)); });
}
// Shape follows the continuous tone before glyph inversion/dither, avoiding artificial size flicker.
export function reliefValues(tone, settings) {
  const depth = Math.pow(clamp(tone), 1 / (settings.depthGamma ?? 1));
  const sizeTone = settings.reverseDepth ? 1 - depth : depth;
  const fill = settings.fill ?? .95, amount = settings.relief ? (settings.sizeDepth ?? .7) : 0;
  return { depth, glyphScale: (fill + (.2 + .8 * sizeTone - fill) * amount) / fill };
}
export const hexRGB = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
export function characters(settings) { return [...(settings.charset === 'custom' ? settings.customChars : CHARSETS[settings.charset])].filter(c => c !== '\n' && c !== '\r').slice(0, 64).join('') || '@'; }
export function smoothstep(low, high, value) { const t = clamp((value - low) / Math.max(.00001, high - low)); return t * t * (3 - 2 * t); }
export function keyRGB(settings) { return settings.keyMode === 'black' ? [0, 0, 0] : settings.keyMode === 'white' ? [1, 1, 1] : hexRGB(settings.keyColor); }
export function rotateHue(rgb, degrees) {
  const a = degrees * Math.PI / 180, axis = 1 / Math.sqrt(3), c = Math.cos(a), s = Math.sin(a), dot = (rgb[0] + rgb[1] + rgb[2]) * axis;
  return rgb.map((v, i) => clamp(v * c + (rgb[(i + 2) % 3] - rgb[(i + 1) % 3]) * axis * s + axis * dot * (1 - c)));
}
export function processPixel(r, g, b, a, settings, x = 0, y = 0) {
  const rgb = [r / 255, g / 255, b / 255];
  let alpha = a / 255;
  if (settings.keyMode !== 'none') {
    const key = keyRGB(settings);
    const distance = Math.hypot(...rgb.map((v, i) => v - key[i])) / Math.sqrt(3);
    alpha *= smoothstep(settings.threshold, settings.threshold + settings.softness, distance);
  }
  let light = clamp(((rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722) * settings.brightness - .5) * settings.contrast + .5);
  light = Math.pow(light, 1 / (settings.gamma ?? 1));
  const shape = reliefValues(light, settings);
  const pattern = ((x % 2) * 2 + y % 2) / 4 - .375;
  light = clamp(light + pattern * (settings.dither ?? 0));
  if (settings.invert) light = 1 - light;
  const chars = [...characters(settings)];
  const char = chars[Math.min(chars.length - 1, Math.floor(light * chars.length))];
  const low = hexRGB(settings.low), high = hexRGB(settings.high);
  let color = settings.colorMode === 'original' ? rgb.map(v => clamp(v * settings.brightness)) : settings.colorMode === 'single' ? low.map(v => v * (.3 + .7 * light)) : low.map((v, i) => v + (high[i] - v) * light);
  const gray = color[0] * .2126 + color[1] * .7152 + color[2] * .0722;
  color = rotateHue(color.map(v => clamp(gray + (v - gray) * (settings.saturation ?? 1))), settings.hue ?? 0);
  const shade = settings.relief ? (settings.lightDepth ?? .45) : 0;
  color = color.map(v => clamp(v * (1 - shade * .85 * (1 - shape.depth)) + (1 - v) * shade * .3 * Math.pow(shape.depth, 3)));
  return { char, color: color.map(v => Math.round(v * 255)), alpha: alpha * settings.opacity, light, glyphScale: shape.glyphScale };
}
export function outputSize(w, h, maxSide = 1200) {
  const ratio = Math.min(1, maxSide / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * ratio)), height: Math.max(1, Math.round(h * ratio)) };
}
export function gridSize(w, h, density) { return { columns: density, rows: Math.max(1, Math.round(density * h / w * .62)) }; }
export function settingsGrid(w, h, settings) {
  const columns = Math.max(8, Math.min(320, Math.round(settings.density / settings.size)));
  return { columns, rows: Math.max(1, Math.round(columns * h / w * .62 / (settings.lineSpacing ?? 1))) };
}
export function xmlEscape(value) { return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]); }

const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
varying vec2 uv; uniform sampler2D media; uniform sampler2D atlas;
uniform float surfaceMode;
uniform vec2 grid; uniform float glyphCount; uniform float atlasRows; uniform float glyphSize;
uniform float brightness; uniform float contrast; uniform float inverted; uniform float opacity;
uniform float colorMode; uniform vec3 lowColor; uniform vec3 highColor;
uniform float keyEnabled; uniform vec3 keyColor; uniform float threshold; uniform float softness;
uniform float gammaValue; uniform float saturation; uniform float hue; uniform float dither; uniform float rowSpacing;
uniform float sizeDepth; uniform float lightDepth; uniform float depthGamma; uniform float reverseDepth;
uniform vec2 ringAxis; uniform vec2 ringCenter; uniform float ringRadius; uniform float ringHalf; uniform float ringSoftness; uniform float ringStrength; uniform float ringGlow; uniform vec3 ringColor;
void main(){
  if(surfaceMode>.5){vec4 c=texture2D(media,uv);gl_FragColor=vec4(c.a>.00001?c.rgb/c.a:vec3(0.),c.a);return;}
  vec2 cell=floor(uv*grid); vec4 source=texture2D(media,(cell+.5)/grid);
  float mask=source.a; if(keyEnabled>.5) mask*=smoothstep(threshold,threshold+softness,length(source.rgb-keyColor)/sqrt(3.));
  float light=clamp((dot(source.rgb,vec3(.2126,.7152,.0722))*brightness-.5)*contrast+.5,0.,1.);
  light=pow(light,1./gammaValue);
  float depth=pow(light,1./depthGamma);
  float sizeTone=mix(depth,1.-depth,reverseDepth);
  float localSize=mix(glyphSize,.2+.8*sizeTone,sizeDepth);
  float pattern=(mod(cell.x,2.)*2.+mod(grid.y-1.-cell.y,2.))/4.-.375;
  light=clamp(light+pattern*dither,0.,1.);
  light=mix(light,1.-light,inverted);
  float index=min(glyphCount-1.,floor(light*glyphCount));
  vec2 local=(fract(uv*grid)-.5)/localSize+.5;
  local.y=(local.y-.5)*rowSpacing+.5;
  if(local.x<0.||local.y<0.||local.x>1.||local.y>1.){gl_FragColor=vec4(0.);return;}
  vec2 atlasCell=vec2(mod(index,16.),atlasRows-1.-floor(index/16.));
  float ink=texture2D(atlas,(atlasCell+local)/vec2(16.,atlasRows)).a;
  vec3 color=mix(lowColor,highColor,light);
  if(colorMode>.5&&colorMode<1.5)color=lowColor*(.3+.7*light);
  if(colorMode>1.5)color=clamp(source.rgb*brightness,0.,1.);
  color=clamp(mix(vec3(dot(color,vec3(.2126,.7152,.0722))),color,saturation),0.,1.);
  vec3 axis=normalize(vec3(1.)); float angle=hue*.01745329252;
  color=clamp(color*cos(angle)+cross(axis,color)*sin(angle)+axis*dot(axis,color)*(1.-cos(angle)),0.,1.);
  color=clamp(color*(1.-lightDepth*.85*(1.-depth))+(1.-color)*lightDepth*.3*pow(depth,3.),0.,1.);
  vec2 ringUV=vec2((cell.x+.5)/grid.x,1.-(cell.y+.5)/grid.y);
  float distanceToRing=abs(length((ringUV-ringCenter)*ringAxis)-ringRadius);
  float ringWeight=(1.-smoothstep(ringHalf*(1.-ringSoftness),ringHalf,distanceToRing))*ringStrength;
  color=mix(color,ringColor,ringWeight); color=clamp(color+(1.-color)*ringWeight*ringGlow,0.,1.);
  gl_FragColor=vec4(color,ink*mask*opacity);
}`;

export class AsciiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.sample = document.createElement('canvas');
    this.ctx = this.sample.getContext('2d', { willReadFrequently: true });
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false });
    if (!this.gl) { this.fallback = canvas.getContext('2d'); if (!this.fallback) throw new Error('无法建立画布，请使用支持 Canvas 的浏览器。'); return; }
    const gl = this.gl;
    const compile = (type, source) => { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)); return shader; };
    this.program = gl.createProgram(); gl.attachShader(this.program, compile(gl.VERTEX_SHADER, vertex)); gl.attachShader(this.program, compile(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error('显卡无法初始化字符渲染器。');
    gl.useProgram(this.program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(this.program, 'position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    this.quadBuffer=buffer;this.quadPosition=pos;
    this.uniforms = Object.fromEntries(['media', 'atlas', 'grid', 'glyphCount', 'atlasRows', 'glyphSize', 'brightness', 'contrast', 'inverted', 'opacity', 'colorMode', 'lowColor', 'highColor', 'keyEnabled', 'keyColor', 'threshold', 'softness', 'gammaValue', 'saturation', 'hue', 'dither', 'rowSpacing'].map(k => [k, gl.getUniformLocation(this.program, k)]));
    this.mediaTexture = this.texture(); this.atlasTexture = this.texture();
    this.uniforms.surfaceMode=gl.getUniformLocation(this.program,'surfaceMode');
    for (const name of ['ringAxis','ringCenter','ringRadius','ringHalf','ringSoftness','ringStrength','ringGlow','ringColor']) this.uniforms[name] = gl.getUniformLocation(this.program,name);
    for (const name of ['sizeDepth', 'lightDepth', 'depthGamma', 'reverseDepth']) this.uniforms[name] = gl.getUniformLocation(this.program, name);
    gl.uniform1i(this.uniforms.media, 0); gl.uniform1i(this.uniforms.atlas, 1);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
  }
  texture() { const gl = this.gl, texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return texture; }
  buildAtlas(chars, weight) {
    this.atlasChars = chars + weight;
    const letters = [...chars], canvas = document.createElement('canvas');
    canvas.width = 16 * 24; canvas.height = Math.ceil(letters.length / 16) * 36;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.font = `${weight === 'bold' ? 'bold' : 'normal'} 28px "Courier New", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    letters.forEach((c, i) => ctx.fillText(c, (i % 16) * 24 + 12, Math.floor(i / 16) * 36 + 18));
    const gl = this.gl; gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.atlasTexture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  }
  render(source, width, height, settings) {
    const size = outputSize(width, height), grid = settingsGrid(size.width, size.height, settings);
    if (this.canvas.width !== size.width || this.canvas.height !== size.height) { this.canvas.width = size.width; this.canvas.height = size.height; }
    if (this.sample.width !== grid.columns || this.sample.height !== grid.rows) { this.sample.width = grid.columns; this.sample.height = grid.rows; }
    this.ctx.clearRect(0, 0, grid.columns, grid.rows); this.ctx.drawImage(source, 0, 0, grid.columns, grid.rows);
    this.grid = grid; this.settings = { ...settings };
    if(settings.surface){this.renderSurface();return;}
    if (!this.gl) { this.renderFallback(); return; }
    const gl = this.gl, u = this.uniforms, chars = characters(settings);
    if (this.atlasChars !== chars + settings.weight) this.buildAtlas(chars, settings.weight);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height); gl.useProgram(this.program);
    gl.uniform1f(u.surfaceMode,0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.mediaTexture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sample);
    gl.uniform2f(u.grid, grid.columns, grid.rows);
    const scalars = { glyphCount: [...chars].length, atlasRows: Math.ceil([...chars].length / 16), glyphSize: settings.fill ?? .95, brightness: settings.brightness, contrast: settings.contrast, inverted: Number(settings.invert), opacity: settings.opacity, colorMode: { gradient: 0, single: 1, original: 2 }[settings.colorMode], keyEnabled: Number(settings.keyMode !== 'none'), threshold: settings.threshold, softness: settings.softness, gammaValue: settings.gamma ?? 1, saturation: settings.saturation ?? 1, hue: settings.hue ?? 0, dither: settings.dither ?? 0 };
    for (const [name, value] of Object.entries(scalars)) gl.uniform1f(u[name], value);
    gl.uniform1f(u.rowSpacing, settings.lineSpacing ?? 1);
    const ring = ringFrame(settings, size.width, size.height);
    gl.uniform2fv(u.ringAxis,ring.axis); gl.uniform2fv(u.ringCenter,ring.center);
    gl.uniform1f(u.ringRadius,ring.radius); gl.uniform1f(u.ringHalf,ring.half);
    gl.uniform1f(u.ringSoftness,settings.ringSoftness ?? .8); gl.uniform1f(u.ringStrength,ring.active ? (settings.ringStrength ?? .65) : 0);
    gl.uniform1f(u.ringGlow,settings.ringGlow ?? .3); gl.uniform3fv(u.ringColor,hexRGB(settings.ringColor ?? '#ffd6a0'));
    gl.uniform1f(u.sizeDepth, settings.relief ? (settings.sizeDepth ?? .7) : 0);
    gl.uniform1f(u.lightDepth, settings.relief ? (settings.lightDepth ?? .45) : 0);
    gl.uniform1f(u.depthGamma, settings.depthGamma ?? 1);
    gl.uniform1f(u.reverseDepth, Number(settings.reverseDepth ?? false));
    gl.uniform3fv(u.lowColor, hexRGB(settings.low)); gl.uniform3fv(u.highColor, hexRGB(settings.high)); gl.uniform3fv(u.keyColor, keyRGB(settings));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  renderSurface(){
    const chars=characters(this.settings);
    if(this.gl&&this.atlasChars!==chars+this.settings.weight)this.buildAtlas(chars,this.settings.weight);
    const w=this.canvas.width,h=this.canvas.height;
    if(this.gl){
      const gl=this.gl;this.surfaceGPU??=new SurfaceGPU(gl);
      const texture=this.surfaceGPU.render(surfaceGeometry(this.cells(),w,h,this.grid,this.settings),w,h,this.grid,this.settings,chars,this.atlasTexture);
      gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.quadBuffer);gl.enableVertexAttribArray(this.quadPosition);gl.vertexAttribPointer(this.quadPosition,2,gl.FLOAT,false,0,0);
      gl.uniform1f(this.uniforms.surfaceMode,1);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return;
    }
    const cells=surfaceGeometry(this.cells(),w,h,this.grid,this.settings);
    drawSurface(this.fallback,cells,w,h,this.grid,this.settings);
  }
  cells() {
    const { columns, rows } = this.grid, data = this.ctx.getImageData(0, 0, columns, rows).data;
    const cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) { const i = (y * columns + x) * 4; cells.push({ x, y, ...processPixel(data[i], data[i + 1], data[i + 2], data[i + 3], this.settings, x, y) }); }
    if (this.settings.ring) {
      const frame=ringFrame(this.settings,this.canvas.width,this.canvas.height);
      for(const cell of cells) cell.color=ringTint(cell.color.map(v=>v/255),ringWeight((cell.x+.5)/columns,(cell.y+.5)/rows,frame,this.settings),this.settings).map(v=>Math.round(v*255));
    }
    return cells;
  }
  renderFallback() {
    const ctx = this.fallback, w = this.canvas.width / this.grid.columns, h = this.canvas.height / this.grid.rows;
    const fill = this.settings.fill ?? .95;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); ctx.font = `${this.settings.weight === 'bold' ? 'bold' : 'normal'} ${h * 28 / 36 * fill / (this.settings.lineSpacing ?? 1)}px "Courier New", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const cell of this.cells()) { if (cell.alpha < .005) continue; ctx.font = `${this.settings.weight === 'bold' ? 'bold' : 'normal'} ${h * 28 / 36 * fill * cell.glyphScale / (this.settings.lineSpacing ?? 1)}px "Courier New", monospace`; ctx.fillStyle = `rgba(${cell.color.join(',')},${cell.alpha})`; ctx.fillText(cell.char, (cell.x + .5) * w, (cell.y + .5) * h, w * fill * cell.glyphScale); }
  }
  text() { const rows = Array.from({ length: this.grid.rows }, () => []); for (const cell of this.cells()) rows[cell.y].push(cell.alpha < .05 ? ' ' : cell.char); return rows.map(row => row.join('')).join('\n'); }
  svg() {
    if(this.settings.surface)return surfaceSVG(surfaceGeometry(this.cells(),this.canvas.width,this.canvas.height,this.grid,this.settings),this.canvas.width,this.canvas.height,this.grid,this.settings,xmlEscape);
    const w = this.canvas.width, h = this.canvas.height, cw = w / this.grid.columns, ch = h / this.grid.rows;
    const texts = this.cells().filter(c => c.alpha >= .005).map(c => `<text x="${((c.x + .5) * cw).toFixed(2)}" y="${((c.y + .5) * ch).toFixed(2)}" font-size="${(ch * 28 / 36 * (this.settings.fill ?? .95) * c.glyphScale / (this.settings.lineSpacing ?? 1)).toFixed(2)}" fill="rgb(${c.color})" opacity="${c.alpha.toFixed(3)}">${xmlEscape(c.char)}</text>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g font-family="Courier New,monospace" font-weight="${this.settings.weight === 'bold' ? 'bold' : 'normal'}" font-size="${(ch * 28 / 36 * (this.settings.fill ?? .95) / (this.settings.lineSpacing ?? 1)).toFixed(2)}" text-anchor="middle" dominant-baseline="central">${texts}</g></svg>`;
  }
}
