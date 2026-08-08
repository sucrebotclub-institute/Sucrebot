// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Auspiciantes (fuente única de verdad)
//  Usado por: INICIO (carrusel), INSTITUCION (hero strip + sidebar),
//             RESULTADOS (splash de carga), certificados.js (barra lateral)
//
//  Ya NO es un array hardcodeado -- se gestiona desde CONFIGURACION →
//  Auspiciantes (agregar/editar/eliminar, con subida de logo a Drive).
//  Ver acciones getAuspiciantes/guardarAuspiciante/eliminarAuspiciante/
//  uploadLogoAuspiciante en Code.gs.
//
//  Patrón cache-first (mismo que selectores de categoría/nav, sprint
//  06-ago-2026): la última respuesta conocida se aplica de forma
//  SÍNCRONA desde localStorage apenas este script se parsea (antes de
//  cualquier fetch), para que el carrusel/splash/hero strip no arranquen
//  vacíos en la carga inicial. Se revalida en segundo plano y, si algo
//  cambió, se dispara el evento 'auspiciantesListos' para que cada
//  página vuelva a pintar.
//
//  Campo opcional `cartaImg`: si el auspiciante no tiene `url` pero sí
//  tiene una carta de presentación (imagen), su URL completa (Drive o
//  cualquier otra) hace que el clic en el logo abra un modal mostrando
//  esa imagen, en vez de quedar sin ninguna acción. Si el auspiciante
//  tiene `url`, esta tiene prioridad y el clic abre el link en vez del
//  modal.
// ════════════════════════════════════════════════════════════════

const AUSP_CACHE_KEY = 'sucrebot_auspiciantes_cache';

let AUSPICIANTES = [];
(function ausAplicarCacheSincrono() {
  try {
    const cached = localStorage.getItem(AUSP_CACHE_KEY);
    if (cached) {
      const arr = JSON.parse(cached);
      if (Array.isArray(arr)) AUSPICIANTES = arr;
    }
  } catch (e) {}
})();

// Descarga la lista real desde GAS, actualiza el cache local y AUSPICIANTES,
// y dispara 'auspiciantesListos' si el contenido cambió respecto al cache
// -- cada página que renderiza auspiciantes debe escuchar ese evento
// además de su propio render inicial (con el cache o vacío), igual que ya
// hacen los selectores de categoría con 'componentsLoaded'.
function ausCargar() {
  if (typeof CONFIG === 'undefined') return Promise.resolve();
  return fetch(CONFIG.GAS_URL() + '?action=getAuspiciantes', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(arr) {
      if (!Array.isArray(arr)) return;
      const cambio = JSON.stringify(arr) !== JSON.stringify(AUSPICIANTES);
      AUSPICIANTES = arr;
      try { localStorage.setItem(AUSP_CACHE_KEY, JSON.stringify(arr)); } catch (e) {}
      if (cambio) document.dispatchEvent(new CustomEvent('auspiciantesListos'));
    })
    .catch(function() {});
}
// Expuesta para páginas que necesitan estar SEGURAS de tener la lista real
// antes de renderizar (ej. certificados.js, que arma la barra de auspiciantes
// del diploma) -- pueden hacer `await window.ausCargarPromise` en vez de
// confiar únicamente en el cache/evento.
window.ausCargarPromise = ausCargar();

// logoUrl/cartaImg ya vienen como URL absoluta completa desde el backend
// (raw.githubusercontent.com para los auspiciantes originales, Drive para
// los agregados desde CONFIGURACION) -- no hace falta concatenar nada acá.
function ausLogoUrl(item) {
  return item.logoUrl;
}

function ausCartaUrl(item) {
  return item.cartaImg;
}

// Auspiciantes con el checkbox "Ocultar" activado en CONFIGURACION no
// aparecen en INICIO/INSTITUCION/RESULTADOS -- independiente del checkbox
// "Mostrar en certificados" (uno controla el sitio, el otro los diplomas).
// CONFIGURACION sigue viendo TODOS (incluidos los ocultos) para poder
// destaparlos de nuevo, por eso el filtro vive acá y no en el backend.
function ausVisibles() {
  return AUSPICIANTES.filter(function(a) { return !a.oculto; });
}

// Reordena una lista para que dos entradas con el mismo logo (ej. BYD + BYD Auto Ec)
// nunca queden adyacentes. Útil para el carrusel. Funciona con cualquier cantidad
// de duplicados que puedan aparecer a futuro (actualmente no hay ninguno).
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
