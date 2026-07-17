// 1. Importaciones corregidas desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Tus credenciales exactas de Firebase (Tomadas de tu consola)
const firebaseConfig = {
  apiKey: "AIzaSyBoR_wvOSlVi7v87kW6h69rt51HP6I-aX4",
  authDomain: "ruleta-zipak-na-e1aaf.firebaseapp.com",
  projectId: "ruleta-zipak-na-e1aaf",
  storageBucket: "ruleta-zipak-na-e1aaf.firebasestorage.app",
  messagingSenderId: "651224395844",
  appId: "1:651224395844:web:b152ff1511e3ad6f874c11"
};

// Inicializamos la base de datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tus premios originales actualizados con mejor distribución visual inicial (Total: 20 casillas)
const originalPrizes = [
  '10%', 'Gracias', '3%', 'Gracias', '5%',    
  'Gracias', '3%', 'Gracias', '10%', 'Gracias', 
  '3%', 'Gracias', '5%', 'Gracias', '3%',    
  'Gracias', 'Gracias', 'Gracias', 'Gracias', 'Gracias' 
];

// Creamos una copia que es la que se va a mezclar visualmente
let prizes = [...originalPrizes];

const c = document.getElementById('wheel'), ctx = c.getContext('2d');
const n = 20, arc = 2 * Math.PI / n, r = 300;
let rot = 0;

// Función para mezclar aleatoriamente las posiciones visuales
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
    ctx.fillText(prizes[i], 170, 5); 
    ctx.restore();
  }
  ctx.restore();
}

// Mezclamos al cargar la página por primera vez
mezclarPremios();
draw();

document.getElementById('spin').onclick = async () => {
  // Deshabilitar botón temporalmente para evitar bugs durante la animación o multiclics
  document.getElementById('spin').style.pointerEvents = 'none';
  document.getElementById('resultado').textContent = 'Calculando tiro seguro...';

  // Referencia al documento 'ruleta' dentro de la colección 'configuracion' que creaste
  const ruletaRef = doc(db, "configuracion", "ruleta");

  try {
    // 1. Preguntar de forma segura a Firestore si este tiro gana o pierde
    const resultadoServidor = await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(ruletaRef);
      if (!sfDoc.exists()) {
        throw "El documento de control en Firestore no existe.";
      }
      
      let datos = sfDoc.data();
      let nuevoIntento = datos.intento + 1;
      let premiosRestantes = datos.premios_restantes;
      let esGanador = false;

      // SI PASAMOS LOS 100 TIROS, REINICIAMOS EL BLOQUE AUTOMÁTICAMENTE
      if (nuevoIntento > 100) {
        nuevoIntento = 1;
        premiosRestantes = 4;
      }

      let tirosPorDelante = 101 - nuevoIntento;

      // MATEMÁTICA ESTRICTA: Controla que de cada 100 tiros salgan exactamente 4 ganadores
      if (premiosRestantes > 0 && (tirosPorDelante <= premiosRestantes || Math.random() < (premiosRestantes / tirosPorDelante))) {
        esGanador = true;
        premiosRestantes--;
      }

      // Actualizamos los valores en la base de datos para el siguiente usuario
      transaction.update(ruletaRef, {
        intento: nuevoIntento,
        premios_restantes: premiosRestantes
      });

      return esGanador ? "GANADOR" : "PERDEDOR";
    });

    // 2. Elegir qué tipo de premio físico se le da si resultó GANADOR
    let premioAsignado = 'Gracias';
    if (resultadoServidor === "GANADOR") {
      const opcionesGanadoras = ['10%', '5%', '3%', '3%']; 
      premioAsignado = opcionesGanadoras[Math.floor(Math.random() * opcionesGanadoras.length)];
    } else {
      premioAsignado = 'Gracias';
    }

    // 3. Buscar en qué posición (índice) quedó ese premio en la ruleta mezclada visualmente
    const indicesPosibles = [];
    prizes.forEach((p, index) => {
      if (p === premioAsignado) indicesPosibles.push(index);
    });
    const idx = indicesPosibles[Math.floor(Math.random() * indicesPosibles.length)];

    // 4. Calcular animación hacia ese índice físico en la pantalla
    const target = (Math.PI * 2 * 8) + ((20 - idx) * arc) - arc / 2;
    let start = rot, d = target - start, t0 = null;

    document.getElementById('resultado').textContent = '¡Girando!';

    function anim(t) {
      if (!t0) t0 = t;
      let p = Math.min((t - t0) / 3000, 1);
      rot = start + d * (1 - (1 - p) ** 3);
      draw();
      if (p < 1) {
        requestAnimationFrame(anim);
      } else {
        document.getElementById('resultado').textContent = prizes[idx] === 'Gracias' 
          ? '¡Gracias por participar!' 
          : '¡Felicidades! Ganaste ' + prizes[idx] + ' de descuento!';
        
        document.getElementById('spin').style.pointerEvents = 'auto';
      }
    }
    requestAnimationFrame(anim);

  } catch (error) {
    console.error("Error en la ruleta segura:", error);
    document.getElementById('resultado').textContent = 'Error de conexión o configuración inicial.';
    document.getElementById('spin').style.pointerEvents = 'auto';
  }
}
