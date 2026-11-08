/** A local image/video-backed refractive lens. No remote rendering dependencies. */
function WorkGlassLens({ fit = 'cover', sourceType = 'image', compositeBackground = false, sourceSelector }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    const tile = canvas.parentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;
    const image = tile.querySelector(sourceSelector || (sourceType === 'canvas' ? 'canvas[data-lens-source]' : sourceType === 'video' ? 'video' : 'img'));
    if (!image) return;
    const video = image.tagName === 'VIDEO';
    const liveCanvas = image.tagName === 'CANVAS';
    const vectorImage = !video && !liveCanvas && /\.svg(?:[?#]|$)/i.test(image.getAttribute('src') || '');
    const renderToSurface = compositeBackground || vectorImage;
    // Every animated SVG needs fresh frames while hovered, just like video.
    const animatedSvg = !video && !liveCanvas && /-animated\.svg(?:[?#]|$)/i.test(image.getAttribute('src') || '');
    const sourceWidth = () => liveCanvas ? image.width : video ? image.videoWidth : image.naturalWidth;
    const sourceHeight = () => liveCanvas ? image.height : video ? image.videoHeight : image.naturalHeight;
    const surface = renderToSurface ? document.createElement('canvas') : null;
    const surfaceContext = surface?.getContext('2d');
    const compositeSource = () => {
      const bounds = tile.getBoundingClientRect();
      // Rasterize vectors at display density plus headroom for the lens magnification.
      const scale = Math.min((devicePixelRatio || 1) * (vectorImage ? 1.5 : 1), vectorImage ? 3 : 2,
        Math.min(vectorImage ? 2400 : 1800, gl.getParameter(gl.MAX_TEXTURE_SIZE)) / Math.max(width, height));
      const pixelWidth = Math.max(1, Math.round(width * scale)), pixelHeight = Math.max(1, Math.round(height * scale));
      if (surface.width !== pixelWidth || surface.height !== pixelHeight) { surface.width = pixelWidth; surface.height = pixelHeight; }
      const ctx = surfaceContext;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, surface.width, surface.height);
      ctx.setTransform(surface.width / width, 0, 0, surface.height / height, 0, 0);
      if (compositeBackground) {
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
        ctx.fillRect(0, 0, width, height);
        // Transparent artwork reveals the fixed site dots below its card backing.
        const dots = getComputedStyle(document.body, '::before');
        const cell = parseFloat(dots.backgroundSize), inset = parseFloat(dots.left) + 1;
        if (dots.backgroundImage !== 'none' && cell > 0) {
          const dotColor = getComputedStyle(document.documentElement).getPropertyValue('--site-dot-color').trim();
          for (let y = inset + Math.ceil((bounds.top - inset) / cell) * cell; y < Math.min(innerHeight - inset + 1, bounds.bottom); y += cell) {
            if (y < inset) continue;
            for (let x = inset + Math.ceil((bounds.left - inset) / cell) * cell; x < Math.min(innerWidth - inset + 1, bounds.right); x += cell) {
              if (x < inset) continue;
              const cx = x - bounds.left, cy = y - bounds.top;
              const gradient = ctx.createRadialGradient(cx, cy, 1, cx, cy, 1.5);
              gradient.addColorStop(0, dotColor); gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient; ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
            }
          }
        }
        const ancestors = [];
        for (let node = tile; node && node !== document.body; node = node.parentElement) ancestors.unshift(node);
        for (const node of ancestors) { ctx.fillStyle = getComputedStyle(node).backgroundColor; ctx.fillRect(0, 0, width, height); }
      }
      const ratio = fit === 'contain' ? Math.min(width / sourceWidth(), height / sourceHeight()) : Math.max(width / sourceWidth(), height / sourceHeight());
      const w = sourceWidth() * ratio, h = sourceHeight() * ratio;
      // Filter the artwork before adding the glass highlight, as on opaque cards.
      ctx.filter = getComputedStyle(image).filter;
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
      ctx.filter = 'none';
      return surface;
    };
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) return;
    const vertex = 'attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }';
    const fragment = `precision mediump float;
      varying vec2 uv; uniform sampler2D artwork;
      uniform vec2 size, imageSize, pointer; uniform float radius, fitMode;
      vec2 imageUV(vec2 p) {
        float fit=mix(max(size.x/imageSize.x,size.y/imageSize.y),min(size.x/imageSize.x,size.y/imageSize.y),fitMode);
        return (p-size*.5)/(imageSize*fit)+.5;
      }
      void main(){
        vec2 p=vec2(uv.x,1.-uv.y)*size;
        vec2 delta=p-pointer; float d=length(delta)/max(radius,1.);
        if(d>1. || radius<1.) discard;
        float rim=smoothstep(.64,1.,d);
        // A clear centre and curved bevel bend the artwork near the glass edge.
        vec2 bend=delta*(.10+.18*rim*rim);
        vec2 samplePoint=p-bend;
        vec2 fringe=normalize(delta+vec2(.001))*rim*.45;
        vec3 color=vec3(texture2D(artwork,imageUV(samplePoint-fringe)).r,
          texture2D(artwork,imageUV(samplePoint)).g,
          texture2D(artwork,imageUV(samplePoint+fringe)).b);
        float highlight=pow(rim,7.)*(.10+.28*max(0.,dot(normalize(delta+vec2(.001)),normalize(vec2(-.65,-1.)))));
        color=mix(color,vec3(1.),highlight);
        float alpha=1.-smoothstep(1.-1.5/max(radius,1.),1.,d);
        vec2 sourceUV=imageUV(samplePoint);
        if(any(lessThan(sourceUV,vec2(0.)))||any(greaterThan(sourceUV,vec2(1.)))) discard;
        gl_FragColor=vec4(color,alpha*texture2D(artwork,sourceUV).a);
      }`;
    const shader = (type, source) => {
      const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    };
    const vs=shader(gl.VERTEX_SHADER,vertex), fs=shader(gl.FRAGMENT_SHADER,fragment);
    if (!vs || !fs) { if(vs)gl.deleteShader(vs); if(fs)gl.deleteShader(fs); return; }
    const program=gl.createProgram(); gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);return; }
    gl.useProgram(program); gl.uniform1i(gl.getUniformLocation(program,'artwork'),0);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    const locations=Object.fromEntries(['size','imageSize','pointer','radius','fitMode'].map(k=>[k,gl.getUniformLocation(program,k)]));
    let ready=false, active=false, frame=0, previous=0, uploadedTime=-1,uploadedAt=0, x=0,y=0,tx=0,ty=0,r=0,width=1,height=1;
    const measure=()=>{width=tile.clientWidth;height=tile.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);};
    const upload=()=>{if(!width||!height||!sourceWidth()||(video&&image.readyState<2))return;try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,renderToSurface?compositeSource():image);uploadedTime=video?image.currentTime:-1;ready=true;}catch{ready=false;}};
    const sourceReady=()=>{upload();if(ready&&tile.matches(':hover')&&fine.matches&&!reduced.matches)active=true;request();};
    const tick=now=>{
      frame=0;const dt=Math.min((now-(previous||now-16))/1000,.05);previous=now;
      const follow=1-Math.exp(-dt/.14), ease=1-Math.exp(-dt/.09);
      x+=(tx-x)*follow;y+=(ty-y)*follow;
      const target=active?Math.min(86,width*.18):0;r+=(target-r)*ease;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      if(r>.2&&((liveCanvas||animatedSvg)?now-uploadedAt>=1000/30:(video&&image.currentTime!==uploadedTime))){upload();uploadedAt=now;}
      if(ready&&r>.2){canvas.style.filter=renderToSurface?'none':getComputedStyle(image).filter;gl.uniform1f(locations.fitMode,fit==='contain'?1:0);gl.uniform2f(locations.size,width,height);gl.uniform2f(locations.imageSize,renderToSurface?width:sourceWidth(),renderToSurface?height:sourceHeight());gl.uniform2f(locations.pointer,x,y);gl.uniform1f(locations.radius,r);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
      if(((liveCanvas||animatedSvg)&&active&&(r>.2||target>.2))||(video&&active&&!image.paused&&!image.ended)||Math.abs(tx-x)>.05||Math.abs(ty-y)>.05||Math.abs(target-r)>.05)frame=requestAnimationFrame(tick);
    };
    function request(){if(!frame){previous=0;frame=requestAnimationFrame(tick);}}
    const move=e=>{const rect=tile.getBoundingClientRect();tx=(e.clientX-rect.left)*width/rect.width;ty=(e.clientY-rect.top)*height/rect.height;request();};
    const enter=e=>{if(e.pointerType==='touch'||reduced.matches||!fine.matches)return;if(renderToSurface)upload();move(e);x=tx;y=ty;active=ready;request();};
    const leave=()=>{active=false;request();};
    const sourceEvents=video?['loadeddata','seeked','playing','pause']:['load'];
    const resize=new ResizeObserver(()=>{measure();if(renderToSurface)upload();request();});resize.observe(tile);measure();sourceReady();sourceEvents.forEach(event=>image.addEventListener(event,sourceReady));
    const refreshBackground=()=>{if(active&&renderToSurface)sourceReady();};
    const themeObserver=new MutationObserver(refreshBackground);if(renderToSurface)themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    window.addEventListener('scroll',refreshBackground,{passive:true});
    tile.addEventListener('pointerenter',enter);tile.addEventListener('pointermove',move);tile.addEventListener('pointerleave',leave);tile.addEventListener('pointercancel',leave);
    window.addEventListener('blur',leave);reduced.addEventListener('change',leave);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();themeObserver.disconnect();window.removeEventListener('scroll',refreshBackground);sourceEvents.forEach(event=>image.removeEventListener(event,sourceReady));tile.removeEventListener('pointerenter',enter);tile.removeEventListener('pointermove',move);tile.removeEventListener('pointerleave',leave);tile.removeEventListener('pointercancel',leave);window.removeEventListener('blur',leave);reduced.removeEventListener('change',leave);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);queueMicrotask(()=>{if(!canvas.isConnected)gl.getExtension('WEBGL_lose_context')?.loseContext();});};
  }, [fit, sourceType, compositeBackground, sourceSelector]);

  return <canvas ref={ref} className="work-glass-lens" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',borderRadius:'inherit',zIndex:3}} aria-hidden="true" />;
}
window.WorkGlassLens=WorkGlassLens;

