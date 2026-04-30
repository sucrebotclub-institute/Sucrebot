/**
 * SucreBot - Component Loader
 * Carga componentes HTML de forma asíncrona
 */

async function loadComponents() {
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
  
  // Disparar evento personalizado cuando todo esté cargado
  document.dispatchEvent(new CustomEvent('componentsLoaded'));
}

// Cargar componentes cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadComponents);
} else {
  loadComponents();
}
