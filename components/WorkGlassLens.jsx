/** A local image-backed refractive lens. No remote models or rendering dependencies. */
function WorkGlassLens({ fit = 'cover' }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    const tile = canvas.parentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;
    const image = tile.querySelector('img');
    if (!image) return;
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
    let ready=false, active=false, frame=0, previous=0, x=0,y=0,tx=0,ty=0,r=0,width=1,height=1;
    const measure=()=>{width=tile.clientWidth;height=tile.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);};
    const upload=()=>{if(!image.naturalWidth)return;try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;request();}catch{ready=false;}};
    const tick=now=>{
      frame=0;const dt=Math.min((now-(previous||now-16))/1000,.05);previous=now;
      const follow=1-Math.exp(-dt/.14), ease=1-Math.exp(-dt/.09);
      x+=(tx-x)*follow;y+=(ty-y)*follow;
      const target=active?Math.min(86,width*.18):0;r+=(target-r)*ease;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      if(ready&&r>.2){canvas.style.filter=getComputedStyle(image).filter;gl.uniform1f(locations.fitMode,fit==='contain'?1:0);gl.uniform2f(locations.size,width,height);gl.uniform2f(locations.imageSize,image.naturalWidth,image.naturalHeight);gl.uniform2f(locations.pointer,x,y);gl.uniform1f(locations.radius,r);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
      if(Math.abs(tx-x)>.05||Math.abs(ty-y)>.05||Math.abs(target-r)>.05)frame=requestAnimationFrame(tick);
    };
    function request(){if(!frame){previous=0;frame=requestAnimationFrame(tick);}}
    const move=e=>{const rect=tile.getBoundingClientRect();tx=(e.clientX-rect.left)*width/rect.width;ty=(e.clientY-rect.top)*height/rect.height;request();};
    const enter=e=>{if(e.pointerType==='touch'||reduced.matches||!fine.matches||!ready)return;move(e);x=tx;y=ty;active=true;request();};
    const leave=()=>{active=false;request();};
    const resize=new ResizeObserver(()=>{measure();request();});resize.observe(tile);measure();upload();image.addEventListener('load',upload);
    tile.addEventListener('pointerenter',enter);tile.addEventListener('pointermove',move);tile.addEventListener('pointerleave',leave);tile.addEventListener('pointercancel',leave);
    window.addEventListener('blur',leave);reduced.addEventListener('change',leave);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();image.removeEventListener('load',upload);tile.removeEventListener('pointerenter',enter);tile.removeEventListener('pointermove',move);tile.removeEventListener('pointerleave',leave);tile.removeEventListener('pointercancel',leave);window.removeEventListener('blur',leave);reduced.removeEventListener('change',leave);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
  }, [fit]);
  return <canvas ref={ref} className="work-glass-lens" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',borderRadius:'inherit',zIndex:3}} aria-hidden="true" />;
}
window.WorkGlassLens=WorkGlassLens;
