// Configuración para usar la versión Compat (Cargada desde el HTML)
const initializeApp = firebase.initializeApp;
const getFirestore = firebase.firestore;

// Tus credenciales exactas de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBoR_wvOSlVi7v87kW6h69rt51HP6I-aX4",
  authDomain: "ruleta-zipak-na-e1aaf.firebaseapp.com",
  projectId: "ruleta-zipak-na-e1aaf",
  storageBucket: "ruleta-zipak-na-e1aaf.firebasestorage.app",
  messagingSenderId: "651224395844",
  appId: "1:651224395844:web:b152ff1511e3ad6f874c11"
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Tus premios originales actualizados (Total: 20 casillas)
const originalPrizes = [
  '10%', 'Gracias', '3%', 'Gracias', '5%',    
  'Gracias', '3%', 'Gracias', '10%', 'Gracias', 
  '3%', 'Gracias', '5%', 'Gracias', '3%',    
  'Gracias', 'Gracias', 'Gracias', 'Gracias', 'Gracias' 
];

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
  document.getElementById('spin').style.pointerEvents = 'none';
  document.getElementById('resultado').textContent = 'Calculando tiro seguro...';

  // Referencia al documento con la sintaxis Compat
  const ruletaRef = db.collection("configuracion").doc("ruleta");

  try {
    // Preguntar de forma segura a Firestore si este tiro gana o pierde
    const resultadoServidor = await db.runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(ruletaRef);
      if (!sfDoc.exists) {
        throw "El documento de control en Firestore no existe.";
      }
      
      let datos = sfDoc.data();
      let nuevoIntento = datos.intento + 1;
      let premiosRestantes = datos.premios_restantes;
      let esGanador = false;

      if (nuevoIntento > 100) {
        nuevoIntento = 1;
        premiosRestantes = 4;
      }

      let tirosPorDelante = 101 - nuevoIntento;

      if (premiosRestantes > 0 && (tirosPorDelante <= premiosRestantes || Math.random() < (premiosRestantes / tirosPorDelante))) {
        esGanador = true;
        premiosRestantes--;
      }

      transaction.update(ruletaRef, {
        intento: nuevoIntento,
        premios_restantes: premiosRestantes
      });

      return esGanador ? "GANADOR" : "PERDEDOR";
    });

    let premioAsignado = 'Gracias';
    if (resultadoServidor === "GANADOR") {
      const opcionesGanadoras = ['10%', '5%', '3%', '3%']; 
      premioAsignado = opcionesGanadoras[Math.floor(Math.random() * opcionesGanadoras.length)];
    } else {
      premioAsignado = 'Gracias';
    }

    const indicesPosibles = [];
    prizes.forEach((p, index) => {
      if (p === premioAsignado) indicesPosibles.push(index);
    });
    const idx = indicesPosibles[Math.floor(Math.random() * indicesPosibles.length)];

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
