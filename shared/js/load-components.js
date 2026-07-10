/**
 * SucreBot - Component Loader
 * Carga componentes HTML de forma asíncrona + scripts globales
 */

// ── FUNCIÓN: Cargar script dinámicamente
function loadScript(src, async = true, defer = false) {
  return new Promise((resolve, reject) => {
    // Verificar si el script ya está cargado
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve({ success: true, src, cached: true });
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    script.onload = () => {
      console.log(`✅ Script cargado: ${src}`);
      resolve({ success: true, src });
    };
    script.onerror = () => {
      console.error(`❌ Error cargando script: ${src}`);
      reject({ success: false, src, error: 'Failed to load' });
    };
    
    document.head.appendChild(script);
  });
}

// ── FUNCIÓN: Esperar a que Google SDK esté disponible
function waitForGoogleSDK(maxAttempts = 50, interval = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkSDK = setInterval(() => {
      attempts++;
      
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(checkSDK);
        console.log(`✅ Google SDK disponible después de ${attempts * interval}ms`);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkSDK);
        console.warn('⏱️ Timeout esperando Google SDK - puede estar bloqueado por el navegador');
        resolve(); // Resolver de todos modos para no bloquear la app
      }
    }, interval);
  });
}

// ── FUNCIÓN: Cargar componentes HTML
async function loadHTMLComponents() {
  const elements = document.querySelectorAll('[data-include]');
  
  // Cargar todos los componentes en paralelo
  const loadPromises = Array.from(elements).map(async (element) => {
    const file = element.getAttribute('data-include');
    
    try {
      const response = await fetch(file);
      
      if (response.ok) {
        const html = await response.text();
        element.innerHTML = html;
        
        // Ejecutar scripts que vengan en el componente
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        });
        
        return { success: true, file };
      } else {
        console.error(`Error cargando ${file}: ${response.status}`);
        return { success: false, file, error: response.status };
      }
    } catch (error) {
      console.error(`Error al cargar componente ${file}:`, error);
      return { success: false, file, error: error.message };
    }
  });
  
  // Esperar a que todos los componentes se carguen
  const results = await Promise.all(loadPromises);
  
  // Log de resultados (solo en desarrollo)
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.warn('Componentes que fallaron:', failed);
  }
  
  return results;
}

// ── FUNCIÓN: Insertar favicon dinámicamente
function insertFavicon() {
  // Verificar si ya existe un favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) return; // Ya existe, no duplicar
  
  // Crear el elemento link para el favicon
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/x-icon';
  favicon.href = '../shared/images/favicon.ico';
  
  // Insertar en el head
  document.head.appendChild(favicon);
  console.log('✅ Favicon insertado');
}

// ── FUNCIÓN: Inicializar todo el sistema
async function loadComponents() {
  try {
    // 0. Insertar favicon
    insertFavicon();
    
    // 1. Cargar Google OAuth SDK (async)
    console.log('📦 Cargando Google OAuth SDK...');
    await loadScript('https://accounts.google.com/gsi/client', true, true);
    
    // 2. Esperar a que el SDK esté realmente disponible
    await waitForGoogleSDK();
    console.log('✅ Google OAuth SDK cargado y listo');
    
    // 3. Cargar componentes HTML
    console.log('📦 Cargando componentes HTML...');
    await loadHTMLComponents();
    console.log('✅ Componentes HTML cargados');
    
    // 4. Cargar auth.js
    // Todas las páginas SucreBot viven en subcarpetas → siempre ../shared/
    // Solo usar ./shared/ si estamos en la raíz del sitio (ej: /Sucrebot/)
    console.log('📦 Cargando auth.js...');
    const segmentos = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    const enRaiz = segmentos.length <= 1; // e.g. /Sucrebot/ → 1 segmento
    const authPath = enRaiz ? './shared/js/auth.js' : '../shared/js/auth.js';
    await loadScript(authPath, false, false);
    console.log('✅ auth.js cargado');
    
    // 5. Disparar evento cuando TODO esté listo
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
    console.log('🎉 Sistema completamente inicializado');
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
}

// ── INICIALIZACIÓN: Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadComponents);
} else {
  loadComponents();
}

// ── FUNCIÓN: Banner flotante "Último día de inscripciones" ──────
function mostrarBannerUltimoDia() {
  var STORAGE_KEY = 'sucrebot_banner_cierre_cerrado';
  var CIERRE = new Date(2026, 6, 10, 23, 59, 59); // 10 jul 2026, 23:59:59

  if (new Date() > CIERRE) return; // ya pasó la fecha, no mostrar nunca más
  if (sessionStorage.getItem(STORAGE_KEY) === '1') return; // cerrado en esta sesión

  // Asegurar fuentes (por si la página no las cargó en <head>)
  if (!document.querySelector('link[href*="Orbitron"]')) {
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);
  }

  var style = document.createElement('style');
  style.textContent = `
    #sbBannerCierre {
      position: fixed; bottom: 20px; right: 20px; z-index: 99998;
      width: 300px; max-width: calc(100vw - 24px);
      background: linear-gradient(160deg, #14213f 0%, #0e2a5a 60%, #0c1a38 100%);
      border: 1px solid rgba(251,191,36,0.35); border-top: 3px solid #fbbf24;
      border-radius: 14px; padding: 16px 18px 16px 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      font-family: 'Exo 2', sans-serif;
      animation: sbBannerIn .5s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes sbBannerIn { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    #sbBannerCierre .sb-close {
      position: absolute; top: 8px; right: 10px; background: none; border: none;
      color: rgba(255,255,255,0.55); font-size: 18px; line-height: 1; cursor: pointer; padding: 4px;
    }
    #sbBannerCierre .sb-close:hover { color: #fff; }
    #sbBannerCierre .sb-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    #sbBannerCierre .sb-icon {
      flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px;
      background: rgba(251,191,36,0.15); display: flex; align-items: center; justify-content: center;
    }
    #sbBannerCierre .sb-icon svg { width: 18px; height: 18px; stroke: #fbbf24; }
    #sbBannerCierre .sb-tag {
      font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px;
      color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;
    }
    #sbBannerCierre .sb-title {
      font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 900; color: #fff;
      letter-spacing: 0.5px; line-height: 1.2;
    }
    #sbBannerCierre .sb-desc {
      font-size: 12.5px; color: rgba(255,255,255,0.75); line-height: 1.5; margin-bottom: 14px;
    }
    #sbBannerCierre .sb-btn {
      display: block; text-align: center; background: linear-gradient(135deg, #1a5ca8, #2a8ec8);
      color: #fff; text-decoration: none; padding: 10px; border-radius: 6px;
      font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; transition: box-shadow .2s, transform .15s;
    }
    #sbBannerCierre .sb-btn:hover { box-shadow: 0 6px 16px rgba(42,142,200,0.4); transform: translateY(-1px); }
    @media (max-width: 480px) {
      #sbBannerCierre { left: 12px; right: 12px; bottom: 12px; width: auto; }
    }
  `;
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'sbBannerCierre';
  banner.innerHTML = `
    <button class="sb-close" aria-label="Cerrar aviso">✕</button>
    <div class="sb-row">
      <div class="sb-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div class="sb-tag">Último día</div>
        <div class="sb-title">Las inscripciones se cierran el día de hoy</div>
      </div>
    </div>
    <div class="sb-desc">El viernes 10 de julio es el último día para inscribirte a la Cuarta Edición del Concurso Nacional de Robótica "SucreBot 2026".</div>
    <a class="sb-btn" href="https://sucrebotclub-institute.github.io/Sucrebot/REGISTRO/">Inscribirme ahora →</a>
  `;
  document.body.appendChild(banner);

  banner.querySelector('.sb-close').addEventListener('click', function() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    banner.remove();
  });
}

// ── INICIALIZACIÓN independiente (no espera Google SDK ni componentes) ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mostrarBannerUltimoDia);
} else {
  mostrarBannerUltimoDia();
}
