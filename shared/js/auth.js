// ═══════════════════════════════════════════════════════════════
// AUTENTICACIÓN GOOGLE OAUTH + GESTIÓN DE SESIÓN
// Archivo: /shared/js/auth.js
// ═══════════════════════════════════════════════════════════════

const STAFF_EMAILS = [
  'ftipantocta@tecnologicosucre.edu.ec',
  'sucrebotclub@tecnologicosucre.edu.ec'
];

// ✅ EXPORTAR COMO VARIABLE GLOBAL para que otros archivos puedan acceder
window.STAFF_EMAILS = STAFF_EMAILS;

// ── FUNCIÓN: Parsear JWT de Google
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// ── FUNCIÓN: Callback de Google Sign-In (DEBE SER GLOBAL)
window.handleCredentialResponse = function(response) {
  const userData = parseJwt(response.credential);
  activarSesion(userData);
  
  // Cerrar modal si existe
  const modal = document.getElementById('google-signin-modal');
  if (modal) {
    document.body.removeChild(modal);
  }
}

// ── FUNCIÓN: Activar sesión del usuario
function activarSesion(data) {
  localStorage.setItem('sucrebot_user', JSON.stringify(data));
  
  // Actualizar UI
  const btnLogin = document.getElementById('btnLogin');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (btnLogin) btnLogin.style.display = 'none';
  if (userInfo) userInfo.classList.add('visible');
  if (userName) userName.textContent = data.name || data.email;
  if (userAvatar && data.picture) userAvatar.src = data.picture;
  
  // Verificar si es staff
  const isStaff = STAFF_EMAILS.includes(data.email);
  
  // Mostrar/ocultar menús según rol
  const navStaff = document.getElementById('navStaff');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink = document.getElementById('navPartLink');
  
  if (isStaff) {
    // Usuario es STAFF
    if (navStaff) navStaff.style.display = 'block';
    if (navPartLink) navPartLink.style.display = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
  } else {
    // Usuario es PARTICIPANTE
    if (navStaff) navStaff.style.display = 'none';
    if (navPartLink) navPartLink.style.display = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'block';
  }
}

// ── FUNCIÓN: Cerrar sesión (DEBE SER GLOBAL para onclick)
window.cerrarSesion = function() {
  localStorage.removeItem('sucrebot_user');
  
  // Revocar credenciales de Google
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  // Actualizar UI
  const btnLogin = document.getElementById('btnLogin');
  const userInfo = document.getElementById('userInfo');
  
  if (btnLogin) btnLogin.style.display = 'flex';
  if (userInfo) userInfo.classList.remove('visible');
  
  // Ocultar menús de staff/participante
  const navStaff = document.getElementById('navStaff');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink = document.getElementById('navPartLink');
  
  if (navStaff) navStaff.style.display = 'none';
  if (navPartDropdown) navPartDropdown.style.display = 'none';
  if (navPartLink) navPartLink.style.display = 'none';
  
  // Recargar la página para limpiar completamente
  window.location.reload();
};

// ── FUNCIÓN: Mostrar login con selector de cuentas (DEBE SER GLOBAL para onclick)
window.iniciarLogin = function() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    // Desactivar auto-selección para forzar selector de cuentas
    google.accounts.id.disableAutoSelect();
    
    // Mostrar prompt (automáticamente muestra selector si hay múltiples cuentas)
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('⚠️ One Tap no disponible, usando flujo alternativo');
        // Si One Tap falla, renderizar botón de Google
        mostrarBotonGoogleAlternativo();
      }
    });
  } else {
    console.error('❌ Google Sign-In no está disponible');
    alert('Error: Sistema de login no disponible. Por favor recarga la página.');
  }
};

// ── FUNCIÓN AUXILIAR: Mostrar botón de Google como alternativa
function mostrarBotonGoogleAlternativo() {
  // Verificar si ya existe el modal
  if (document.getElementById('google-signin-modal')) return;
  
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.id = 'google-signin-modal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  // Crear contenedor del botón
  const container = document.createElement('div');
  container.style.cssText = `
    background: #ffffff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    text-align: center;
    position: relative;
    animation: slideIn 0.3s ease;
  `;
  
  // Botón de cerrar
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 32px;
    color: #999;
    cursor: pointer;
    width: 40px;
    height: 40px;
    line-height: 1;
    transition: color 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.color = '#333';
  closeBtn.onmouseout = () => closeBtn.style.color = '#999';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  // Título
  const title = document.createElement('h3');
  title.textContent = 'Iniciar sesión con Google';
  title.style.cssText = `
    font-family: 'Exo 2', sans-serif;
    font-size: 1.5rem;
    color: #1a3a6b;
    margin-bottom: 24px;
    font-weight: 700;
  `;
  
  // Contenedor para el botón de Google
  const btnContainer = document.createElement('div');
  btnContainer.id = 'google-btn-container';
  
  container.appendChild(closeBtn);
  container.appendChild(title);
  container.appendChild(btnContainer);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Renderizar botón de Google
  google.accounts.id.renderButton(
    btnContainer,
    { 
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 280
    }
  );
  
  // Cerrar al hacer clic en el overlay (fuera del contenedor)
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

// ── FUNCIÓN: Cambiar de cuenta (DEBE SER GLOBAL)
window.cambiarCuenta = function() {
  // Desactivar auto-selección
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  // Limpiar sesión local
  localStorage.removeItem('sucrebot_user');
  
  // Actualizar UI
  const btnLogin = document.getElementById('btnLogin');
  const userInfo = document.getElementById('userInfo');
  
  if (btnLogin) btnLogin.style.display = 'flex';
  if (userInfo) userInfo.classList.remove('visible');
  
  // Ocultar menús
  const navStaff = document.getElementById('navStaff');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink = document.getElementById('navPartLink');
  
  if (navStaff) navStaff.style.display = 'none';
  if (navPartDropdown) navPartDropdown.style.display = 'none';
  if (navPartLink) navPartLink.style.display = 'none';
  
  // Mostrar login nuevamente
  setTimeout(() => {
    iniciarLogin();
  }, 300);
};

// ── FUNCIÓN: Inicializar menús según estado de sesión
function inicializarMenus() {
  const savedUser = localStorage.getItem('sucrebot_user');
  const navPartLink = document.getElementById('navPartLink');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navStaff = document.getElementById('navStaff');
  
  if (!savedUser) {
    // SIN SESIÓN: Ocultar todos los menús de participantes y staff
    if (navPartLink) navPartLink.style.display = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
    if (navStaff) navStaff.style.display = 'none';
  }
}

// ── INICIALIZACIÓN: Restaurar sesión si existe
document.addEventListener('componentsLoaded', function() {
  console.log('📦 Componentes cargados, inicializando autenticación...');
  
  // Inicializar menús según estado
  inicializarMenus();
  
  // Restaurar sesión guardada
  const savedUser = localStorage.getItem('sucrebot_user');
  
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      activarSesion(userData);
    } catch (e) {
      console.error('Error al restaurar sesión:', e);
      localStorage.removeItem('sucrebot_user');
    }
  }
  
  // Inicializar Google Sign-In
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',
      callback: window.handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      // ✅ Configuraciones para mejorar selector de cuentas
      context: 'signin',
      ux_mode: 'popup',
      itp_support: true
    });
    console.log('✅ Google OAuth inicializado con selector de cuentas');
  } else {
    console.warn('⏳ SDK de Google no disponible aún');
  }
});
