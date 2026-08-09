// ════════════════════════════════════════════════════════════════
//  SUCREBOT — Clubes participantes (fuente única de verdad)
//  Usado por: INICIO (grid "Clubes participantes")
//
//  Ya NO es HTML hardcodeado -- se gestiona desde CONFIGURACION →
//  Clubes (agregar/editar/ocultar/eliminar, con subida de logo a Drive).
//  Ver acciones getClubes/guardarClub/eliminarClub/uploadLogoClub en
//  Code.gs. Mismo patrón que shared/js/auspiciantes.js (08-ago-2026),
//  simplificado: solo nombre + logo, sin link ni carta de presentación.
//
//  Patrón cache-first (mismo que auspiciantes/categorías/nav): la última
//  respuesta conocida se aplica de forma SÍNCRONA desde localStorage
//  apenas este script se parsea (antes de cualquier fetch), para que el
//  grid no arranque vacío en la carga inicial. Se revalida en segundo
//  plano y, si algo cambió, se dispara 'clubesListos' para que la página
//  vuelva a pintar.
// ════════════════════════════════════════════════════════════════

const CLUB_CACHE_KEY = 'sucrebot_clubes_cache';

let CLUBES = [];
(function clubAplicarCacheSincrono() {
  try {
    const cached = localStorage.getItem(CLUB_CACHE_KEY);
    if (cached) {
      const arr = JSON.parse(cached);
      if (Array.isArray(arr)) CLUBES = arr;
    }
  } catch (e) {}
})();

function clubCargar() {
  if (typeof CONFIG === 'undefined') return Promise.resolve();
  return fetch(CONFIG.GAS_URL() + '?action=getClubes', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(arr) {
      if (!Array.isArray(arr)) return;
      const cambio = JSON.stringify(arr) !== JSON.stringify(CLUBES);
      CLUBES = arr;
      try { localStorage.setItem(CLUB_CACHE_KEY, JSON.stringify(arr)); } catch (e) {}
      if (cambio) document.dispatchEvent(new CustomEvent('clubesListos'));
    })
    .catch(function() {});
}
window.clubCargarPromise = clubCargar();

// Clubes con el checkbox "Ocultar" activado en CONFIGURACION no aparecen en
// INICIO. CONFIGURACION sigue viendo TODOS (incluidos los ocultos) para
// poder destaparlos de nuevo, por eso el filtro vive acá y no en el backend.
function clubesVisibles() {
  return CLUBES.filter(function(c) { return !c.oculto; });
}

function clubRenderGrid(containerEl) {
  if (!containerEl) return;
  const visibles = clubesVisibles();
  containerEl.innerHTML = visibles.map(function(c) {
    const alt = c.nombre ? c.nombre : 'Club participante';
    return '<div class="club-tile"><img src="' + c.logoUrl + '" alt="' + alt + '" loading="lazy"></div>';
  }).join('');
}
