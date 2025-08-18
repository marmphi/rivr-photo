export class GLCompositor {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject | null = null;
  private tex: WebGLTexture | null = null;
  private uImage: WebGLUniformLocation | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl; this.canvas = canvas;
    const vs = `#version 300 es
      precision highp float; layout(location=0) in vec2 aPos; layout(location=1) in vec2 aUV; out vec2 vUV;
      void main(){ vUV=aUV; gl_Position=vec4(aPos,0.,1.); }`;
    const fs = `#version 300 es
      precision highp float; in vec2 vUV; uniform sampler2D uImage; out vec4 outColor;
      void main(){ outColor = texture(uImage, vUV); }`;
    this.program = this.createProgram(vs, fs);
    this.uImage = this.gl.getUniformLocation(this.program, 'uImage');
    this.initBuffers();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  private createShader(type:number, src:string){ const s=this.gl.createShader(type)!; this.gl.shaderSource(s,src); this.gl.compileShader(s);
    if(!this.gl.getShaderParameter(s,this.gl.COMPILE_STATUS)) throw new Error(this.gl.getShaderInfoLog(s)||'shader compile error'); return s; }
  private createProgram(vsSrc:string, fsSrc:string){ const vs=this.createShader(this.gl.VERTEX_SHADER,vsSrc); const fs=this.createShader(this.gl.FRAGMENT_SHADER,fsSrc);
    const p=this.gl.createProgram()!; this.gl.attachShader(p,vs); this.gl.attachShader(p,fs); this.gl.linkProgram(p);
    if(!this.gl.getProgramParameter(p,this.gl.LINK_STATUS)) throw new Error(this.gl.getProgramInfoLog(p)||'program link error');
    this.gl.deleteShader(vs); this.gl.deleteShader(fs); return p; }
  private initBuffers(){ const gl=this.gl; const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
    const quad=new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]);
    const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo); gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);
    this.vao=vao; gl.bindVertexArray(null); }
  loadImage(img: HTMLImageElement){ const gl=this.gl; if(!this.tex) this.tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.tex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img); gl.bindTexture(gl.TEXTURE_2D,null); }
  draw(){ const gl=this.gl; gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.clearColor(0.13,0.13,0.13,1); gl.clear(gl.COLOR_BUFFER_BIT);
    if(!this.tex) return; gl.useProgram(this.program); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.uniform1i(this.uImage,0); gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); gl.bindVertexArray(null); }
  resize(){ const dpr=Math.max(1,window.devicePixelRatio||1); const w=Math.floor(this.canvas.clientWidth*dpr); const h=Math.floor(this.canvas.clientHeight*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){ this.canvas.width=w; this.canvas.height=h; } }
}