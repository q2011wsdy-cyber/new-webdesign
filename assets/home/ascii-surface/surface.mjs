const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fract=n=>n-Math.floor(n),seed=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
export function surfaceGeometry(cells,width,height,grid,s){
 const cw=width/grid.columns,ch=height/grid.rows,t=(s.frameTime||0)*(s.surfaceSpeed??.35),strength=s.surfaceDepth??.45,edge=s.surfaceEdge??.25;
 const lightAt=(x,y,c)=>{const n=cells[clamp(y,0,grid.rows-1)*grid.columns+clamp(x,0,grid.columns-1)];return n?.alpha>.05?n.light:c.light;};
 return cells.map(c=>{
  const {x,y}=c,px=(x+.5)*cw,py=(y+.5)*ch,gx=(lightAt(x+1,y,c)-lightAt(x-1,y,c))*.5,gy=(lightAt(x,y+1,c)-lightAt(x,y-1,c))*.5;
  const nx=px/width-.5,ny=py/height-.46,outer=clamp(Math.hypot(nx,ny)*2);
  const dx=strength*(Math.sin(ny*9+c.light*2)*Math.cos(nx*5)*cw*2.4+gx*cw*1.5)+Math.sin(ny*10+t)*edge*cw*outer;
  const dy=strength*(Math.sin(nx*7+c.light*2)*ch*1.4+gy*ch)+Math.cos(nx*9+t*.7)*edge*ch*.55*outer;
  const travel=fract(y/grid.rows-(x%2?1:-1)*t*.12+seed(x));
  const stream=(Math.exp(-Math.pow((travel-.5)/.035,2))+.25*Math.exp(-Math.pow((travel-.42)/.11,2)))*(s.surfaceFlow??.55);
  const sparkle=seed(x+y*grid.columns)>.94?Math.pow(.5+.5*Math.sin(t*1.7+seed(x*17+y)*6.283),8)*(s.surfaceSparkle??.35):0;
  const glow=clamp(stream+sparkle,0,.95);
  return {...c,px:px+dx,py:py+dy,angle:clamp((gx-gy)*strength*1.4+Math.cos(ny*9)*strength*.12,-.5,.5),scaleX:1-strength*.25*Math.abs(gx),color:c.color.map(v=>Math.round(v+(255-v)*glow)),fontSize:ch*28/36*(s.fill??.95)*c.glyphScale/(s.lineSpacing??1)*(1+glow*.12)};
 });
}
export function surfaceSegments(cells,grid,s){
 const lines=[],amount=s.surfaceLines??.16;if(!amount)return lines;
 for(const c of cells){if(c.alpha<.08)continue;for(const i of [c.x+1<grid.columns?c.y*grid.columns+c.x+1:-1,c.y+1<grid.rows?(c.y+1)*grid.columns+c.x:-1]){const b=cells[i];if(b&&b.alpha>=.08)lines.push({a:c,b,alpha:Math.min(c.alpha,b.alpha)*amount*.5});}}return lines;
}
export function drawSurface(ctx,cells,width,height,grid,s){
 ctx.clearRect(0,0,width,height);ctx.lineWidth=.55;
 for(const l of surfaceSegments(cells,grid,s)){ctx.strokeStyle=`rgba(${l.a.color.join(',')},${l.alpha})`;ctx.beginPath();ctx.moveTo(l.a.px,l.a.py);ctx.lineTo(l.b.px,l.b.py);ctx.stroke();}
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(const c of cells){if(c.alpha<.005)continue;ctx.save();ctx.translate(c.px,c.py);ctx.rotate(c.angle);ctx.scale(c.scaleX,1);ctx.font=`${s.weight==='bold'?'bold':'normal'} ${c.fontSize}px "Courier New",monospace`;ctx.fillStyle=`rgba(${c.color.join(',')},${c.alpha})`;ctx.fillText(c.char,0,0,width/grid.columns*(s.fill??.95)*c.glyphScale);ctx.restore();}
}
export function surfaceSVG(cells,width,height,grid,s,escape){
 const lines=surfaceSegments(cells,grid,s).map(l=>`<path d="M${l.a.px.toFixed(2)} ${l.a.py.toFixed(2)}L${l.b.px.toFixed(2)} ${l.b.py.toFixed(2)}" fill="none" stroke="rgb(${l.a.color})" stroke-opacity="${l.alpha.toFixed(3)}" stroke-width=".55"/>`).join('');
 const texts=cells.filter(c=>c.alpha>=.005).map(c=>`<text transform="translate(${c.px.toFixed(2)} ${c.py.toFixed(2)}) rotate(${(c.angle*180/Math.PI).toFixed(2)}) scale(${c.scaleX.toFixed(3)} 1)" font-size="${c.fontSize.toFixed(2)}" fill="rgb(${c.color})" opacity="${c.alpha.toFixed(3)}">${escape(c.char)}</text>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${lines}<g font-family="Courier New,monospace" font-weight="${s.weight==='bold'?'bold':'normal'}" text-anchor="middle" dominant-baseline="central">${texts}</g></svg>`;
}
