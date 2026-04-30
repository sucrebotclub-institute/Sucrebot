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
// ══════════════════════════════════════════════════════════════
// MENÚ MÓVIL - Toggle hamburguesa
// ══════════════════════════════════════════════════════════════

document.addEventListener('componentsLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    // Toggle del menú principal
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      nav.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
      }
    });
    
    // Manejar dropdowns en móvil
    const dropdownToggles = nav.querySelectorAll('.nav-dropdown > a');
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const menu = this.nextElementSibling;
          
          // Cerrar otros dropdowns
          document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('open');
          });
          
          menu.classList.toggle('open');
        }
      });
    });
    
    // Manejar sub-dropdown (SucreBot 2026)
    const btnSucrebot = document.getElementById('btnSucrebot');
    const menuSucrebot = document.getElementById('menuSucrebot');
    
    if (btnSucrebot && menuSucrebot) {
      btnSucrebot.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          menuSucrebot.classList.toggle('open');
        }
      });
    }
  }
});
