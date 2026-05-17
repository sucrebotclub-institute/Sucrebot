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
    
    // 2. Cargar componentes HTML
    console.log('📦 Cargando componentes HTML...');
    await loadHTMLComponents();
    console.log('✅ Componentes HTML cargados');
    
    // 3. Cargar auth.js (detectar ruta relativa)
    console.log('📦 Cargando auth.js...');
    
    // Detectar la ruta correcta según la ubicación de la página
    const currentPath = window.location.pathname;
    let authPath;
    
    if (currentPath.includes('/INICIO/')) {
      authPath = '../shared/js/auth.js';
    } else if (currentPath.includes('/FAQ/') || 
               currentPath.includes('/REGISTRO/') || 
               currentPath.includes('/REGLAMENTO/') ||
               currentPath.includes('/PARTICIPANTES_REGISTRADOS/') ||
               currentPath.includes('/MI-REGISTRO/') ||
               currentPath.includes('/MIS-CERTIFICADOS/') ||
               currentPath.includes('/ESCANER/') ||
               currentPath.includes('/CRONOMETRO/') ||
               currentPath.includes('/PANTALLA/') ||
               currentPath.includes('/RESULTADOS/') ||
               currentPath.includes('/GENERAR-CERTIFICADOS/')) {
      authPath = '../shared/js/auth.js';
    } else {
      // Por defecto (raíz o páginas no especificadas)
      authPath = './shared/js/auth.js';
    }
    
    await loadScript(authPath, false, false);
    console.log('✅ auth.js cargado');
    
    // 4. Disparar evento cuando TODO esté listo
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
