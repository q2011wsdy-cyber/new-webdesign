import {surfaceSegments} from './surface.mjs';
// Two batched draws into a premultiplied offscreen target, then composited by the main renderer.
export class SurfaceGPU {
 constructor(gl){
  this.gl=gl;this.program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 uv;attribute vec4 color;varying vec2 tex;varying vec4 tint;void main(){gl_Position=vec4(p,0.,1.);tex=uv;tint=color;}'],[gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D atlas;uniform float lines;varying vec2 tex;varying vec4 tint;void main(){float ink=lines>.5?1.:texture2D(atlas,tex).a;gl_FragColor=vec4(tint.rgb,tint.a*ink);}']]){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(this.program,shader);}
  gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.attributes=['p','uv','color'].map(n=>gl.getAttribLocation(this.program,n));this.lines=gl.getUniformLocation(this.program,'lines');this.atlas=gl.getUniformLocation(this.program,'atlas');this.buffer=gl.createBuffer();this.texture=gl.createTexture();this.framebuffer=gl.createFramebuffer();
  gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 }
 render(cells,w,h,grid,s,chars,atlas){
  const gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);
  if(this.w!==w||this.h!==h){this.w=w;this.h=h;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0);
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,atlas);gl.uniform1i(this.atlas,1);
  const segments=surfaceSegments(cells,grid,s),capacity=(cells.length*6+segments.length*2)*8;
  if(!this.data||this.data.length<capacity)this.data=new Float32Array(capacity);
  let offset=0;const put=(x,y,u,v,c,a)=>{const d=this.data;d[offset++]=x/w*2-1;d[offset++]=1-y/h*2;d[offset++]=u;d[offset++]=v;d[offset++]=c[0]/255;d[offset++]=c[1]/255;d[offset++]=c[2]/255;d[offset++]=a;};
  for(const l of segments){put(l.a.px,l.a.py,0,0,l.a.color,l.alpha*.55);put(l.b.px,l.b.py,0,0,l.a.color,l.alpha*.55);}
  const lineCount=offset/8,letters=[...chars],rows=Math.ceil(letters.length/16),indices=new Map(letters.map((c,i)=>[c,i]));
  const corners=[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]];
  for(const c of cells){if(c.alpha<.005)continue;const i=indices.get(c.char)||0,cx=i%16,cy=rows-1-Math.floor(i/16),cos=Math.cos(c.angle),sin=Math.sin(c.angle),hw=c.fontSize*24/28/2*c.scaleX,hh=c.fontSize*36/28/2;
   for(const [sx,sy] of corners){const x=sx*hw,y=sy*hh;put(c.px+x*cos-y*sin,c.py+x*sin+y*cos,(cx+(sx+1)/2)/16,(cy+(1-sy)/2)/rows,c.color,c.alpha);}
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data.subarray(0,offset),gl.DYNAMIC_DRAW);
  this.attributes.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,i===2?4:2,gl.FLOAT,false,32,i===0?0:i===1?8:16);});
  gl.uniform1f(this.lines,1);gl.lineWidth(1);if(lineCount)gl.drawArrays(gl.LINES,0,lineCount);
  gl.uniform1f(this.lines,0);gl.drawArrays(gl.TRIANGLES,lineCount,offset/8-lineCount);
  this.attributes.forEach(a=>gl.disableVertexAttribArray(a));gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  return this.texture;
 }
}
