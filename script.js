const originalPrizes = [
  '10%', 'Gracias', '3%', 'Gracias', '5%',    
  'Gracias', '3%', 'Gracias', '10%', 'Gracias', 
  '3%', 'Gracias', '5%', 'Gracias', '3%',    
  'Gracias', 'Gracias', 'Gracias', 'Gracias', 'Gracias' 
];

let prizes = [...originalPrizes];

const c = document.getElementById('wheel');
const ctx = c.getContext('2d');
const n = 20;
const arc = 2 * Math.PI / n;
const r = 300;
let rot = 0;

function mezclarPremios() {
  for (let i = prizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
  }
}

function draw() {
  ctx.clearRect(0, 0, 600, 600);
  ctx.save();
  ctx.translate(300, 300);
  ctx.rotate(rot);
  
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, i * arc, (i + 1) * arc);
    ctx.closePath();
    
    // Lista de colores bonitos para los gajos
    const colores = ['#f39c12', '#e91e63', '#00bcd4', '#4caf50', '#9c27b0', '#f1c40f'];
    ctx.fillStyle = colores[i % colores.length];
    ctx.fill();
    
    // Dibujar el texto del premio
    ctx.save();
    ctx.rotate(i * arc + arc / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = "right";
    ctx.fillText(prizes[i], r - 30, 5); 
    ctx.restore();
  }
  ctx.restore();
}

// Inicializar la ruleta mezclada
mezclarPremios();
draw();

document.getElementById('spin').onclick = () => {
  document.getElementById('spin').style.pointerEvents = 'none';

  const rand = Math.random();
  let premioAsignado = 'Gracias';

  if (rand < 0.10) { 
    premioAsignado = '10%'; 
  } else if (rand < 0.20) { 
    premioAsignado = '5%';  
  } else if (rand < 0.40) { 
    premioAsignado = '3%';  
  }

  const indicesPosibles = [];
  prizes.forEach((p, index) => {
    if (p === premioAsignado) indicesPosibles.push(index);
  });
  const idx = indicesPosibles[Math.floor(Math.random() * indicesPosibles.length)];

  // El truco está en que la flecha apunta desde la derecha (0 radianes)
  const target = (Math.PI * 2 * 6) - (idx * arc) - (arc / 2);
  let start = rot, d = target - start, t0 = null;

  function anim(t) {
    if (!t0) t0 = t;
    let p = Math.min((t - t0) / 4000, 1);
    // Efecto de frenado suave
    rot = start + d * (1 - Math.pow(1 - p, 4));
    draw();
    if (p < 1) {
      requestAnimationFrame(anim);
    } else {
      document.getElementById('resultado').textContent = prizes[idx] === 'Gracias' 
        ? '¡Gracias por participar!' 
        : '¡Ganaste ' + prizes[idx] + ' de descuento!';
      
      document.getElementById('spin').style.pointerEvents = 'auto';
    }
  }
  requestAnimationFrame(anim);
}
