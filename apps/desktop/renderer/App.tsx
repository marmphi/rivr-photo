import React, { useRef, useEffect, useState } from 'react';
import { GLCompositor } from './canvas/glcanvas';
import { apiRemoveBackground, apiInpaint, apiUpscale } from './api';
type Point = { x:number; y:number };
export default function App(){
  const canvasRef=useRef<HTMLCanvasElement>(null); const overlayRef=useRef<HTMLCanvasElement>(null);
  const [img,setImg]=useState<HTMLImageElement|null>(null); const [bitmapPath,setBitmapPath]=useState<string|null>(null);
  const [glc,setGlc]=useState<GLCompositor|null>(null);
  const [past,setPast]=useState<string[]>([]); const [present,setPresent]=useState<string|null>(null); const [future,setFuture]=useState<string[]>([]);
  const [dragStart,setDragStart]=useState<Point|null>(null); const [dragEnd,setDragEnd]=useState<Point|null>(null);
  useEffect(()=>{ const c=canvasRef.current; if(!c) return; const g=new GLCompositor(c); setGlc(g); const loop=()=>{g.draw(); requestAnimationFrame(loop)}; loop(); },[]);
  useEffect(()=>{ if(!img||!glc) return; glc.loadImage(img); },[img,glc]);
  const pushHistory=(newPath:string)=>{ setPast(p=>present?[...p,present!]:p); setPresent(newPath); setFuture([]); setBitmapPath(newPath);
    const i=new Image(); i.src=`file://${newPath}`; i.onload=()=>setImg(i); };
  const open=async()=>{ const res=await (window as any).bridge.invoke('file.openImage'); if(!res?.filePath) return;
    setBitmapPath(res.filePath); setPresent(res.filePath); const i=new Image(); i.src=`file://${res.filePath}`; i.onload=()=>setImg(i); };
  const undo=()=>{ if(past.length===0) return; const prev=past[past.length-1]; const newPast=past.slice(0,-1); if(present) setFuture(f=>[present!,...f]);
    setPast(newPast); setPresent(prev); setBitmapPath(prev); const i=new Image(); i.src=`file://${prev}`; i.onload=()=>setImg(i); };
  const redo=()=>{ if(future.length===0) return; const next=future[0]; const newFuture=future.slice(1); if(present) setPast(p=>[...p,present!]);
    setFuture(newFuture); setPresent(next); setBitmapPath(next); const i=new Image(); i.src=`file://${next}`; i.onload=()=>setImg(i); };
  const removeBg=async()=>{ if(!bitmapPath) return; const {cutout_path}=await apiRemoveBackground(bitmapPath); pushHistory(cutout_path); };
  const inpaint=async()=>{ if(!bitmapPath) return; const r=getRect(); if(!r) return;
    const poly=[{x:r.x,y:r.y},{x:r.x+r.w,y:r.y},{x:r.x+r.w,y:r.y+r.h},{x:r.x,y:r.y+r.h}];
    const {output_path}=await apiInpaint(bitmapPath, poly, 'clean fill, seamless texture'); pushHistory(output_path); clearSelection(); };
  const upscale=async()=>{ if(!bitmapPath) return; const {output_path}=await apiUpscale(bitmapPath,2); pushHistory(output_path); };
  const drawOverlay=()=>{ const ov=overlayRef.current; if(!ov) return; const ctx=ov.getContext('2d')!;
    const dpr=Math.max(1,window.devicePixelRatio||1); const w=Math.floor(ov.clientWidth*dpr); const h=Math.floor(ov.clientHeight*dpr);
    if(ov.width!==w||ov.height!==h){ ov.width=w; ov.height=h; } ctx.clearRect(0,0,ov.width,ov.height);
    if(dragStart&&dragEnd){ ctx.strokeStyle='white'; ctx.lineWidth=2*dpr; const x=Math.min(dragStart.x,dragEnd.x); const y=Math.min(dragStart.y,dragEnd.y);
      const rw=Math.abs(dragStart.x-dragEnd.x); const rh=Math.abs(dragStart.y-dragEnd.y); ctx.strokeRect(x,y,rw,rh); } };
  const clearSelection=()=>{ setDragStart(null); setDragEnd(null); drawOverlay(); };
  useEffect(()=>{ drawOverlay(); },[dragStart,dragEnd]);
  const onMouseDown=(e:React.MouseEvent)=>{ const rect=(overlayRef.current as HTMLCanvasElement).getBoundingClientRect();
    setDragStart({x:e.clientX-rect.left, y:e.clientY-rect.top}); setDragEnd(null); };
  const onMouseMove=(e:React.MouseEvent)=>{ if(!dragStart) return; const rect=(overlayRef.current as HTMLCanvasElement).getBoundingClientRect();
    setDragEnd({x:e.clientX-rect.left, y:e.clientY-rect.top}); };
  const onMouseUp=()=>{};
  const getRect=()=>{ if(!dragStart||!dragEnd||!img||!canvasRef.current) return null;
    const x=Math.round(Math.min(dragStart.x,dragEnd.x)); const y=Math.round(Math.min(dragStart.y,dragEnd.y));
    const w=Math.round(Math.abs(dragStart.x-dragEnd.x)); const h=Math.round(Math.abs(dragStart.y-dragEnd.y)); return {x,y,w,h}; };
  return (<div style={{display:'grid',gridTemplateRows:'52px 1fr 120px',height:'100vh'}}>
    <div style={{display:'flex',gap:8,alignItems:'center',padding:'8px 12px',background:'#181818'}}>
      <button onClick={open}>Open</button>
      <button onClick={removeBg} disabled={!bitmapPath}>Remove BG (AI)</button>
      <button onClick={inpaint} disabled={!bitmapPath || !dragStart || !dragEnd}>Inpaint Selection (AI)</button>
      <button onClick={upscale} disabled={!bitmapPath}>Upscale 2x (AI)</button>
      <button onClick={undo} disabled={past.length===0}>Undo</button>
      <button onClick={redo} disabled={future.length===0}>Redo</button>
      <div style={{marginLeft:'auto'}}>Rivr Photo MVP · WebGL compositor</div>
    </div>
    <div style={{position:'relative'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}} />
      <canvas ref={overlayRef} style={{position:'absolute',inset:0,pointerEvents:'auto'}}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>
    </div>
    <div style={{background:'#0f0f0f',padding:'8px 12px',display:'flex',gap:16,alignItems:'center'}}>
      <div><b>History</b></div>
      <div style={{display:'flex',gap:8,overflowX:'auto'}}>
        {past.map((p,i)=><span key={i} style={{opacity:0.6}}>{i+1}</span>)}
        {present? <span style={{border:'1px solid #555',padding:'2px 6px',borderRadius:4}}>●</span> : null}
        {future.map((_,i)=><span key={'f'+i} style={{opacity:0.6}}>{i+1}</span>)}
      </div>
      <div style={{marginLeft:'auto',opacity:0.7,fontSize:12}}>Tip: drag to select a rectangle, then “Inpaint Selection”.</div>
    </div>
  </div>); }