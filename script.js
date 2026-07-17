
const prizes=['10%','5%',...Array(18).fill('Gracias')];
const c=document.getElementById('wheel'),ctx=c.getContext('2d');
const n=20,arc=2*Math.PI/n,r=300;
let rot=0;
function draw(){ctx.clearRect(0,0,600,600);ctx.save();ctx.translate(300,300);ctx.rotate(rot);
for(let i=0;i<n;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,i*arc,(i+1)*arc);ctx.closePath();
ctx.fillStyle=['#f39c12','#e91e63','#00bcd4','#4caf50','#9c27b0','#f1c40f'][i%6];ctx.fill();
ctx.save();ctx.rotate(i*arc+arc/2);ctx.fillStyle='#fff';ctx.font='15px Arial';ctx.fillText(prizes[i],170,5);ctx.restore();}
ctx.restore();}
draw();
document.getElementById('spin').onclick=()=>{
 const win=Math.random()<0.08;
 const idx=win?(Math.random()<0.5?0:1):(2+Math.floor(Math.random()*18));
 const target=(Math.PI*2*8)+((20-idx)*arc)-arc/2;
 let start=rot,d=target-start,t0=null;
 function anim(t){if(!t0)t0=t;let p=Math.min((t-t0)/3000,1);rot=start+d*(1-(1-p)**3);draw();if(p<1)requestAnimationFrame(anim);else document.getElementById('resultado').textContent=prizes[idx]=='Gracias'?'¡Gracias por participar!':'¡Ganaste '+prizes[idx]+' de descuento!';}
 requestAnimationFrame(anim);
}
