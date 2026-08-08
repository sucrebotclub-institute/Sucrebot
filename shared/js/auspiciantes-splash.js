// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Splash de auspiciantes (páginas públicas)
//  Requiere shared/js/auspiciantes.js cargado ANTES que este archivo.
//
//  Muestra un overlay de bienvenida con un auspiciante al cargar la
//  página (rotación secuencial vía localStorage, misma key que usaba
//  RESULTADOS originalmente, así que la rotación es compartida entre
//  todas las páginas que incluyan este script).
//
//  Para agregarlo a una página nueva, en el <head> después de
//  auspiciantes.js:
//    <script src="../shared/js/auspiciantes-splash.js"></script>
// ════════════════════════════════════════════════════════════════

(function() {
  const AUSP_SPLASH_KEY = 'sucrebot_ausp_splash_idx';

  function inyectarOverlay() {
    if (document.getElementById('auspSplashOverlay')) return;

    const style = document.createElement('style');
    style.textContent = `
      .ausp-splash-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: linear-gradient(135deg, #0e2a5a 0%, #1a5ca8 60%, #0e2a5a 100%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        opacity: 1; transition: opacity 0.5s ease;
      }
      .ausp-splash-overlay.hide { opacity: 0; pointer-events: none; }
      .ausp-splash-tag {
        font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 4px;
        color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 26px;
      }
      .ausp-splash-logo-box {
        background: #fff; border-radius: 20px; padding: 20px 28px;
        display: flex; align-items: center; justify-content: center;
        max-width: 320px; margin-bottom: 22px;
        animation: ausp-pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      }
      .ausp-splash-logo-box img { max-height: 90px; max-width: 260px; object-fit: contain; display: block; }
      @keyframes ausp-pop-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .ausp-splash-name {
        font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 4px;
        color: #fff; margin-bottom: 30px; text-align: center; padding: 0 20px;
      }
      .ausp-splash-bar { width: 160px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 2px; overflow: hidden; }
      .ausp-splash-progress { height: 100%; background: #5bc8f0; border-radius: 2px; width: 0; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'ausp-splash-overlay';
    overlay.id = 'auspSplashOverlay';
    overlay.innerHTML =
      '<div class="ausp-splash-tag">Presentado por</div>' +
      '<div class="ausp-splash-logo-box" id="auspSplashLogoBox"></div>' +
      '<div class="ausp-splash-name" id="auspSplashName"></div>' +
      '<div class="ausp-splash-bar"><div class="ausp-splash-progress" id="auspSplashProgress"></div></div>';
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  function mostrarSplashAuspiciante() {
    if (typeof AUSPICIANTES === 'undefined') return;
    const visibles = typeof ausVisibles === 'function' ? ausVisibles() : AUSPICIANTES;
    if (!visibles.length) return;
    inyectarOverlay();

    let idx = 0;
    try { idx = parseInt(localStorage.getItem(AUSP_SPLASH_KEY) || '0', 10) || 0; } catch(e) {}
    const a = visibles[idx % visibles.length];
    try { localStorage.setItem(AUSP_SPLASH_KEY, String((idx + 1) % visibles.length)); } catch(e) {}

    const overlay = document.getElementById('auspSplashOverlay');
    const logoBox = document.getElementById('auspSplashLogoBox');
    const nameEl  = document.getElementById('auspSplashName');
    const bar     = document.getElementById('auspSplashProgress');
    if (!overlay) return;

    logoBox.innerHTML = `<img src="${ausLogoUrl(a)}" alt="${a.nombre}"/>`;
    nameEl.textContent = a.nombre;
    bar.style.transition = 'none'; bar.style.width = '0';
    requestAnimationFrame(() => {
      bar.style.transition = 'width 1.8s linear';
      bar.style.width = '100%';
    });
    setTimeout(() => { overlay.classList.add('hide'); }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mostrarSplashAuspiciante);
  } else {
    mostrarSplashAuspiciante();
  }
})();
