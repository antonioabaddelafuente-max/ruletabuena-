// Tus premios originales actualizados con mejor distribución visual inicial (Total: 20 casillas)
const originalPrizes = [
  '10%', 'Gracias', '3%', 'Gracias', '5%',    // Grupo 1
  'Gracias', '3%', 'Gracias', '10%', 'Gracias', // Grupo 2
  '3%', 'Gracias', '5%', 'Gracias', '3%',    // Grupo 3
  'Gracias', 'Gracias', 'Gracias', 'Gracias', 'Gracias' // Grupo 4
];

// Creamos una copia que es la que se va a mezclar visualmente
let prizes = [...originalPrizes];

const c = document.getElementById('wheel'), ctx = c.getContext('2d');
const n = 20, arc = 2 * Math.PI / n, r = 300;
let rot = 0;

// Función para mezclar aleatoriamente las posiciones visuales (esto asegura aleatoriedad real)
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
    ctx.fillStyle = ['#f39c12', '#e91e63', '#00bcd4', '#4caf50', '#9c27b0', '#f1c40f'][i % 6];
    ctx.fill();
    ctx.save();
    ctx.rotate(i * arc + arc / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    ctx.fillText(prizes[i], 170, 5); // Dibuja el array mezclado
    ctx.restore();
  }
  ctx.restore();
}

// Mezclamos al cargar la página por primera vez para aleatoriedad real
mezclarPremios();
draw();

document.getElementById('spin').onclick = () => {
  // Deshabilitar botón temporalmente para evitar bugs durante la animación
  document.getElementById('spin').style.pointerEvents = 'none';

  // 1. Decidir matemáticamente qué premio toca según las casillas reales (8 de 20 ganan)
  // Hay un 40% de probabilidad total de ganar algo (8/20)
  const rand = Math.random();
  let premioAsignado = 'Gracias';

  if (rand < 0.10) { 
    premioAsignado = '10%'; // 10% de probabilidad (2 casillas de 20)
  } else if (rand < 0.20) { 
    premioAsignado = '5%';  // 10% de probabilidad (2 casillas de 20)
  } else if (rand < 0.40) { 
    premioAsignado = '3%';  // 20% de probabilidad (4 casillas de 20)
  }

  // 2. Buscar en qué posición (índice) quedó ese premio en la ruleta mezclada actualmente
  const indicesPosibles = [];
  prizes.forEach((p, index) => {
    if (p === premioAsignado) indicesPosibles.push(index);
  });
  const idx = indicesPosibles[Math.floor(Math.random() * indicesPosibles.length)];

  // 3. Calcular rotación hacia ese índice físico en la pantalla
  const target = (Math.PI * 2 * 8) + ((20 - idx) * arc) - arc / 2;
  let start = rot, d = target - start, t0 = null;

  function anim(t) {
    if (!t0) t0 = t;
    let p = Math.min((t - t0) / 3000, 1);
    rot = start + d * (1 - (1 - p) ** 3);
    draw();
    if (p < 1) {
      requestAnimationFrame(anim);
    } else {
      // Al terminar la animación, mostramos el resultado correcto
      document.getElementById('resultado').textContent = prizes[idx] === 'Gracias' 
        ? '¡Gracias por participar!' 
        : '¡Ganaste ' + prizes[idx] + ' de descuento!';
      
      // Volver a habilitar el botón
      document.getElementById('spin').style.pointerEvents = 'auto';
    }
  }
  requestAnimationFrame(anim);
}
