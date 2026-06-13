// ═══════════════════════════════════════════════════════════════
// AUTENTICACIÓN GOOGLE OAUTH + GESTIÓN DE SESIÓN
// Archivo: /shared/js/auth.js
// ═══════════════════════════════════════════════════════════════

const STAFF_EMAILS = CONFIG.STAFF_EMAILS;
window.STAFF_EMAILS = STAFF_EMAILS;

// Token compartido con GAS — debe coincidir exactamente con STAFF_TOKEN en Code.gs
const STAFF_TOKEN_VALUE = 'SucreBot2026-CMI-Sucre-x7k9mQ';

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
  
  const modal = document.getElementById('google-signin-modal');
  if (modal) document.body.removeChild(modal);
}

// ── FUNCIÓN: Activar sesión del usuario
function activarSesion(data) {
  localStorage.setItem('sucrebot_user', JSON.stringify(data));
  
  const btnLogin    = document.getElementById('btnLogin');
  const userInfo    = document.getElementById('userInfo');
  const userName    = document.getElementById('userName');
  const userAvatar  = document.getElementById('userAvatar');
  
  if (btnLogin)  btnLogin.style.display = 'none';
  if (userInfo)  userInfo.classList.add('visible');
  if (userName)  userName.textContent = data.name || data.email;
  if (userAvatar && data.picture) userAvatar.src = data.picture;
  
  const isStaff = STAFF_EMAILS.includes(data.email);

  // ── Guardar/limpiar token staff según rol ──────────────────
  if (isStaff) {
    localStorage.setItem('sucrebot_staff_token', STAFF_TOKEN_VALUE);
  } else {
    localStorage.removeItem('sucrebot_staff_token');
  }
  
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');
  
  if (isStaff) {
    if (navStaff)        navStaff.style.display        = 'block';
    if (navOrganizacion) navOrganizacion.style.display = 'block';
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
  } else {
    if (navStaff)        navStaff.style.display        = 'none';
    if (navOrganizacion) navOrganizacion.style.display = 'none';
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'block';
  }
}

// ── FUNCIÓN: Cerrar sesión (DEBE SER GLOBAL para onclick)
window.cerrarSesion = function() {
  localStorage.removeItem('sucrebot_user');
  localStorage.removeItem('sucrebot_staff_token'); // ── limpiar token staff
  
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  const btnLogin        = document.getElementById('btnLogin');
  const userInfo        = document.getElementById('userInfo');
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');
  
  if (btnLogin)        btnLogin.style.display        = 'flex';
  if (userInfo)        userInfo.classList.remove('visible');
  if (navStaff)        navStaff.style.display        = 'none';
  if (navOrganizacion) navOrganizacion.style.display = 'none';
  if (navPartDropdown) navPartDropdown.style.display = 'none';
  if (navPartLink)     navPartLink.style.display     = 'none';
  
  window.location.reload();
};

// ── FUNCIÓN: Mostrar login con selector de cuentas (DEBE SER GLOBAL para onclick)
window.iniciarLogin = function() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('⚠️ One Tap no disponible, usando flujo alternativo');
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
  if (document.getElementById('google-signin-modal')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'google-signin-modal';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.7); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  const container = document.createElement('div');
  container.style.cssText = `
    background: #ffffff; padding: 40px; border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3); text-align: center;
    position: relative; animation: slideIn 0.3s ease;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute; top: 10px; right: 10px; background: transparent;
    border: none; font-size: 32px; color: #999; cursor: pointer;
    width: 40px; height: 40px; line-height: 1; transition: color 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.color = '#333';
  closeBtn.onmouseout  = () => closeBtn.style.color = '#999';
  closeBtn.onclick     = () => document.body.removeChild(overlay);
  
  const title = document.createElement('h3');
  title.textContent = 'Iniciar sesión con Google';
  title.style.cssText = `
    font-family: 'Exo 2', sans-serif; font-size: 1.5rem;
    color: #1a3a6b; margin-bottom: 24px; font-weight: 700;
  `;
  
  const btnContainer = document.createElement('div');
  btnContainer.id = 'google-btn-container';
  
  container.appendChild(closeBtn);
  container.appendChild(title);
  container.appendChild(btnContainer);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  google.accounts.id.renderButton(btnContainer, {
    theme: 'filled_blue', size: 'large', text: 'signin_with',
    shape: 'rectangular', logo_alignment: 'left', width: 280
  });
  
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
}

// ── FUNCIÓN: Cambiar de cuenta (DEBE SER GLOBAL)
window.cambiarCuenta = function() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  localStorage.removeItem('sucrebot_user');
  localStorage.removeItem('sucrebot_staff_token'); // ── limpiar token staff
  
  const btnLogin        = document.getElementById('btnLogin');
  const userInfo        = document.getElementById('userInfo');
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');
  
  if (btnLogin)        btnLogin.style.display        = 'flex';
  if (userInfo)        userInfo.classList.remove('visible');
  if (navStaff)        navStaff.style.display        = 'none';
  if (navOrganizacion) navOrganizacion.style.display = 'none';
  if (navPartDropdown) navPartDropdown.style.display = 'none';
  if (navPartLink)     navPartLink.style.display     = 'none';
  
  setTimeout(() => iniciarLogin(), 300);
};

// ── FUNCIÓN: Inicializar menús según estado de sesión
function inicializarMenus() {
  const savedUser       = localStorage.getItem('sucrebot_user');
  const navPartLink     = document.getElementById('navPartLink');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  
  if (!savedUser) {
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
    if (navStaff)        navStaff.style.display        = 'none';
    if (navOrganizacion) navOrganizacion.style.display = 'none';
  }
}

// ── INICIALIZACIÓN: Restaurar sesión si existe
document.addEventListener('componentsLoaded', function() {
  console.log('📦 Componentes cargados, inicializando autenticación...');
  
  inicializarMenus();
  
  const savedUser = localStorage.getItem('sucrebot_user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      activarSesion(userData);
    } catch(e) {
      console.error('Error al restaurar sesión:', e);
      localStorage.removeItem('sucrebot_user');
      localStorage.removeItem('sucrebot_staff_token');
    }
  }
  
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',
      callback: window.handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      itp_support: true
    });
    console.log('✅ Google OAuth inicializado con selector de cuentas');
  } else {
    console.warn('⏳ SDK de Google no disponible aún');
  }
});
