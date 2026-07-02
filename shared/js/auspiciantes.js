// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Auspiciantes (fuente única de verdad)
//  Usado por: INICIO (carrusel), INSTITUCION (hero strip + sidebar),
//             RESULTADOS (splash de carga)
//
//  Para agregar un auspiciante nuevo:
//    1. Subir el logo a shared/images/auspiciantes/
//    2. Agregar un objeto al array AUSPICIANTES de abajo
//    3. Commit — se refleja automáticamente en las 4 zonas
//
//  Campo opcional `cartaImg`: si el auspiciante no tiene `url` pero sí
//  tiene una carta de presentación (imagen), agrega su ruta relativa
//  (ej. 'cartas/nombre-carta.jpg') dentro de shared/images/auspiciantes/.
//  Al hacer clic en el logo se abre un modal mostrando esa imagen, en
//  vez de quedar sin ninguna acción. Si el auspiciante tiene `url`,
//  esta tiene prioridad y el clic abre el link en vez del modal.
// ════════════════════════════════════════════════════════════════

const AUSPICIANTES_BASE_URL = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/auspiciantes/';

const AUSPICIANTES = [
  {
    nombre: 'BYD',
    logo: 'byd.png',
    url: 'https://www.instagram.com/byd_ecuador/',
    tooltip: '@byd_ecuador'
  },
  {
    nombre: 'BYD Auto Ec',
    logo: 'byd.png',
    url: 'https://www.instagram.com/bydauto.ec/',
    tooltip: '@bydauto.ec'
  },
  {
    nombre: 'JEP Cooperativa',
    logo: 'jep.png',
    url: 'https://www.jep.coop/'
  },
  {
    nombre: 'AX-TEC',
    logo: 'axtec.png',
    url: 'https://www.tiktok.com/@axtec.ec',
    tooltip: '@axtec.ec'
  },
  {
    nombre: 'daly bella',
    logo: 'dalybella.png',
    url: null
  },
  {
    nombre: 'NEO-MAKER LAB',
    logo: 'neomaker.png',
    url: null,
    cartaImg: 'cartas/neomaker-carta.jpg'
  },
  {
    nombre: 'Eléctrica GRM',
    logo: 'electricagrm.png',
    url: 'https://electricagrm.com/'
  },
  {
    nombre: "Cytronic's Plant",
    logo: 'cytronics.png',
    url: null,
    cartaImg: 'cartas/cytronics-carta.jpg'
  },
  {
    nombre: 'InnovArte STEAM',
    logo: 'innovarte.png',
    url: 'https://www.instagram.com/innovartesteam/',
    tooltip: '@innovartesteam'
  },
  {
    nombre: 'Peluditos Glam',
    logo: 'peluditosglam.png',
    url: 'https://instagram.com/peluditosglam',
    cartaImg: 'cartas/peluditosglam-carta.jpg'
  },
  {
    nombre: 'Maker CK3D',
    logo: 'makerck3d.png',
    url: 'https://share.google/jNQIpqjdwLw8N6ggB'
  },
  {
    nombre: 'CELIT',
    logo: 'celit.png',
    url: 'https://www.celitecuador.com'
  },
  {
    nombre: 'Microtero Electronic',
    logo: 'microtero.png',
    url: 'https://www.facebook.com/share/1JzEKcK884/'
  }
];

// Devuelve la URL completa del logo
function ausLogoUrl(item) {
  return AUSPICIANTES_BASE_URL + item.logo;
}

// Devuelve la URL completa de la carta de presentación (si existe)
function ausCartaUrl(item) {
  return AUSPICIANTES_BASE_URL + item.cartaImg;
}

// Reordena una lista para que dos entradas con el mismo logo (ej. BYD + BYD Auto Ec)
// nunca queden adyacentes. Útil para el carrusel. Funciona con cualquier cantidad
// de duplicados a futuro, no solo el caso actual de BYD.
function ausSinAdyacentesDuplicados(lista) {
  const grupos = {};
  lista.forEach(function(item) {
    if (!grupos[item.logo]) grupos[item.logo] = [];
    grupos[item.logo].push(item);
  });
  const colas = Object.keys(grupos).map(function(k) { return grupos[k]; })
    .sort(function(a, b) { return b.length - a.length; });
  const resultado = [];
  let quedan = true;
  while (quedan) {
    quedan = false;
    for (let i = 0; i < colas.length; i++) {
      if (colas[i].length) { resultado.push(colas[i].shift()); quedan = true; }
    }
  }
  // El carrusel repite este set en loop: el último y el primero terminan quedando
  // adyacentes en el punto de reinicio. Si coinciden, se intercambia el último
  // con un elemento del medio (no con el primero de la lista, para no crear
  // una adyacencia nueva justo al inicio).
  if (resultado.length > 3 && resultado[0].logo === resultado[resultado.length - 1].logo) {
    const mitad = Math.floor(resultado.length / 2);
    for (let off = 0; off < resultado.length; off++) {
      const i = ((mitad + off) % (resultado.length - 2)) + 1; // evita índice 0 y el último
      const vecinoAnterior = resultado[i - 1] ? resultado[i - 1].logo : null;
      const vecinoSiguiente = resultado[i + 1] ? resultado[i + 1].logo : null;
      const candidato = resultado[resultado.length - 1].logo;
      if (resultado[i].logo !== resultado[0].logo &&
          candidato !== vecinoAnterior && candidato !== vecinoSiguiente) {
        const tmp = resultado[resultado.length - 1];
        resultado[resultado.length - 1] = resultado[i];
        resultado[i] = tmp;
        break;
      }
    }
  }
  return resultado;
}

// Devuelve el HTML de un <a> (link), <div clicable> (modal carta) o <div> (sin acción)
// según tenga url, cartaImg, o ninguno
function ausRenderPill(item, className, imgClassName) {
  const tieneCarta = !item.url && !!item.cartaImg;
  const tag   = item.url ? 'a' : 'div';
  const attrs = item.url
    ? `href="${item.url}" target="_blank" rel="noopener noreferrer"`
    : (tieneCarta
        ? `data-aus-carta="${ausCartaUrl(item)}" data-aus-nombre="${String(item.nombre).replace(/"/g, '&quot;')}"`
        : '');
  const claseExtra = tieneCarta ? ' aus-pill-clicable' : '';
  const title = item.tooltip ? `title="${item.tooltip}"` : '';
  return `<${tag} class="${className}${claseExtra}" ${attrs} ${title}>` +
           `<img class="${imgClassName}" src="${ausLogoUrl(item)}" alt="${item.nombre}" loading="lazy"/>` +
         `</${tag}>`;
}

// ── Modal de carta de presentación ──────────────────────────────
// Se inyecta una sola vez en la página (estilos + markup + listeners
// delegados). Cualquier pill sin url pero con cartaImg queda clicable
// vía data-aus-carta, sin necesidad de onclick inline (evita colisión
// de comillas — ver bug #7 del SKILL.md).
function ausInicializarModal() {
  if (document.getElementById('ausCartaModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #ausCartaModal {
      display: none; position: fixed; inset: 0; z-index: 99999;
      background: rgba(5,10,20,0.88); align-items: center; justify-content: center;
      padding: 24px; cursor: zoom-out;
    }
    #ausCartaModal.show { display: flex; }
    #ausCartaModal img {
      max-width: min(92vw, 520px); max-height: 90vh; border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5); cursor: default; display: block;
    }
    #ausCartaModal .aus-modal-cerrar {
      position: absolute; top: 18px; right: 22px; width: 38px; height: 38px;
      border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff;
      border: 1px solid rgba(255,255,255,0.25); font-size: 20px; line-height: 36px;
      text-align: center; cursor: pointer;
    }
    .aus-pill-clicable { cursor: pointer; }
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'ausCartaModal';
  modal.innerHTML = '<div class="aus-modal-cerrar">✕</div><img alt="Carta de presentación"/>';
  document.body.appendChild(modal);

  modal.addEventListener('click', function() { ausCerrarCarta(); });
  modal.querySelector('img').addEventListener('click', function(e) { e.stopPropagation(); });

  document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-aus-carta]');
    if (!el) return;
    e.preventDefault();
    ausAbrirCarta(el.getAttribute('data-aus-carta'), el.getAttribute('data-aus-nombre'));
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') ausCerrarCarta();
  });
}

function ausAbrirCarta(url, nombre) {
  ausInicializarModal();
  const modal = document.getElementById('ausCartaModal');
  const img   = modal.querySelector('img');
  img.src = url;
  img.alt = 'Carta de presentación — ' + (nombre || '');
  modal.classList.add('show');
}

function ausCerrarCarta() {
  const modal = document.getElementById('ausCartaModal');
  if (modal) modal.classList.remove('show');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ausInicializarModal);
} else {
  ausInicializarModal();
}
