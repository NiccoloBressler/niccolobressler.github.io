'use strict';
const canvas = document.getElementById('shape');
const ctx = canvas.getContext('2d');
const motionButton = document.getElementById('motion');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches, visible = true, dragging = false;
let width = 0, height = 0, ax = .57, ay = .4, lastX = 0, lastY = 0, lastFrame = 0, frameId = 0;
const points = [], rings = 64, sides = 24;
for (let i=0;i<rings;i++) {
  const u = i/rings*Math.PI*2;
  for(let j=0;j<sides;j++) {
    const v=j/sides*Math.PI*2;
    const r=.72+.075*Math.sin(u*3);
    const twist=v+u*1.5;
    points.push([(r+.285*Math.cos(twist))*Math.cos(u), .285*Math.sin(twist), (r+.285*Math.cos(twist))*Math.sin(u)]);
  }
}
function draw(){
 if(!ctx || !width) return;
 ctx.clearRect(0,0,width,height);
 const cx=Math.cos(ax),sx=Math.sin(ax),cy=Math.cos(ay),sy=Math.sin(ay),scale=Math.min(width*.365,height*.36);
 const projected=points.map(([x,y,z])=>{
   const yy=y*cx-z*sx,zz=y*sx+z*cx,xx=x*cy+zz*sy,depth=-x*sy+zz*cy;
   const p=3.8/(3.8-depth);
   return [width/2+xx*scale*p,height*.475+yy*scale*p,depth];
 });
 const lines=[];
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){
   const a=projected[i*sides+j];
   for(const k of [i*sides+(j+1)%sides,((i+1)%rings)*sides+j]){
     const b=projected[k];lines.push([a,b,(a[2]+b[2])/2]);
   }
 }
 lines.sort((a,b)=>a[2]-b[2]);
 ctx.lineWidth=.65;
 for(const [a,b,z] of lines){const alpha=.12+(z+1.05)/2.1*.68;ctx.strokeStyle=`rgba(191,239,118,${alpha})`;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
}
function stop(){cancelAnimationFrame(frameId);frameId=0;lastFrame=0;}
function tick(t){frameId=0;if(paused||!visible||document.hidden)return;if(!lastFrame)lastFrame=t;const delta=Math.min(t-lastFrame,50);if(delta>=30){if(!dragging)ay+=delta*.00013;draw();lastFrame=t;}frameId=requestAnimationFrame(tick);}
function start(){if(!paused&&visible&&!document.hidden&&!frameId)frameId=requestAnimationFrame(tick);}
function updateButton(){motionButton.textContent=paused?'▶':'Ⅱ';motionButton.setAttribute('aria-label',paused?'Play animation':'Pause animation');motionButton.title=paused?'Play animation':'Pause animation';}
new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw();}).observe(canvas);
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();}).observe(canvas);
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;ay+=(e.clientX-lastX)*.007;ax+=(e.clientY-lastY)*.007;lastX=e.clientX;lastY=e.clientY;draw();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>dragging=false);
canvas.addEventListener('click',e=>{if(e.pointerType==='touch'){ay+=.45;draw();}});
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')ay-=.12;if(e.key==='ArrowRight')ay+=.12;if(e.key==='ArrowUp')ax-=.12;if(e.key==='ArrowDown')ax+=.12;draw();});
motionButton.addEventListener('click',()=>{paused=!paused;updateButton();if(paused)stop();else start();});
document.getElementById('reset').addEventListener('click',()=>{ax=.57;ay=.4;draw();});
reducedMotion.addEventListener('change',e=>{paused=e.matches;updateButton();if(paused)stop();else start();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
updateButton();start();
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('copy-email').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('BresslerNiccolo@gmail.com');status.textContent='Email address copied.';}catch{status.textContent='Select the email address above to copy it, or click it to send a message.';}});
