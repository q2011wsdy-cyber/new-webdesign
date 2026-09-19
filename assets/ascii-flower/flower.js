/* The reference supplies geometry and color only. Every visible mark is fillText.
   No reference bitmap is drawn onto the output canvas. */
(() => {
  const canvas = document.querySelector('#flower');
  const ctx = canvas.getContext('2d');
  const density = document.querySelector('#density');
  const status = document.querySelector('#status');
  let theme = 'dark', pixels, width, height, marks = [];
  const glyphs = [':', '+', '*', 'x', 'r', 't', '#', '#', '@', '@'];
  const source = new Image();
  source.onload = () => {
    const sampler = document.createElement('canvas');
    width = sampler.width = source.naturalWidth;
    height = sampler.height = source.naturalHeight;
    const s = sampler.getContext('2d', {willReadFrequently:true});
    s.drawImage(source, 0, 0);
    pixels = s.getImageData(0, 0, width, height).data;
    sample();
    status.hidden = true;
  };
  source.onerror = () => { status.textContent = '参考图加载失败，请通过本地预览打开此页面。'; };
  source.src = 'assets/ascii-flower/reference.png';
  function sample() {
    if (!pixels) return;
    marks = [];
    const dx = width / Number(density.value), dy = dx * 1.42;
    for (let y = 0; y < height; y += dy) {
      for (let x = 0; x < width; x += dx) {
        let r=0,g=0,b=0,weight=0,peak=0,occupied=0,total=0;
        for (let yy=Math.floor(y); yy<Math.min(height,y+dy); yy+=2) {
          for (let xx=Math.floor(x); xx<Math.min(width,x+dx); xx+=2) {
            const i=(yy*width+xx)*4;
            const v=Math.max(pixels[i],pixels[i+1],pixels[i+2]);
            total++;
            if(v<26) continue;
            occupied++;
            const w=v/255;
            r+=pixels[i]*w;g+=pixels[i+1]*w;b+=pixels[i+2]*w;weight+=w;
            peak=Math.max(peak,v);
          }
        }
        if (!weight || occupied/total<0.065 || peak<42) continue;
        r/=weight;g/=weight;b/=weight;
        const lum=(r*.2126+g*.7152+b*.0722)/255;
        const hash=(Math.floor(x)*73+Math.floor(y)*151)%17;
        const index=Math.min(9,Math.max(0,Math.floor(lum*7+occupied/total*2)+(hash%3)-1));
        marks.push({x:(x+dx/2)/width*2048,y:(y+dy/2)/height*2048,r,g,b,char:glyphs[index]});
      }
    }
    draw();
  }
  function draw() {
    ctx.fillStyle=theme==='dark'?'#000':'#fff';ctx.fillRect(0,0,2048,2048);
    ctx.font=`600 ${2048/Number(density.value)*1.48}px "Courier New", monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    for(const m of marks) {
      let {r,g,b}=m;
      r=Math.min(255,r*1.22);g=Math.min(255,g*1.22);b=Math.min(255,b*1.22);
      if(theme==='light') {
        // Preserve sampled hue and relief while keeping pale highlights legible on white.
        const peak=Math.max(r,g,b), low=Math.min(r,g,b);
        const saturation=(peak-low)/Math.max(1,peak);
        const cap=145+45*saturation;
        const scale=Math.min(1,cap/Math.max(1,peak));
        r*=scale;g*=scale;b*=scale;
      }
      ctx.fillStyle=`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      ctx.fillText(m.char,m.x,m.y);
    }
    document.querySelector('#count').textContent=`${marks.length.toLocaleString()} 个字符 · 原图色彩采样 · ${theme==='dark'?'黑':'白'}色背景`;
  }
  document.querySelectorAll('button[data-theme]').forEach(button=>button.addEventListener('click',()=>{
    theme=button.dataset.theme;document.documentElement.dataset.theme=theme;
    document.querySelectorAll('button[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    if(pixels) draw();
  }));
  density.addEventListener('input',sample);
  document.querySelector('#export').addEventListener('click',()=>{
    if(!pixels) return;
    canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.download=`ascii-flower-${theme}.png`;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
  });
})();
