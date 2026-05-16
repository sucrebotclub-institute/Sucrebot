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

let googleOAuthReady = false;
let loginInProgress = false;

// ── FUNCIÓN: Iniciar login con botón personalizado (GLOBAL)
window.iniciarLogin = function() {
  if (loginInProgress) {
    console.warn('⏳ Login ya en progreso, espera...');
    return;
  }
  
  if (!googleOAuthReady) {
    console.warn('⏳ Google OAuth aún no está listo, esperando...');
    setTimeout(window.iniciarLogin, 500);
    return;
  }
  
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    loginInProgress = true;
    google.accounts.id.prompt((notification) => {
      loginInProgress = false;
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Popup no mostrado, reintentando...');
      }
    });
  } else {
    console.error('❌ Google Sign-In no está disponible');
    alert('Error: Google Sign-In no está disponible. Por favor recarga la página.');
  }
};

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

// ── FUNCIÓN: Callback de Google Sign-In
function handleCredentialResponse(response) {
  const userData = parseJwt(response.credential);
  activarSesion(userData);
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
    if (navStaff) navStaff.style.display = 'block';
    if (navPartLink) navPartLink.style.display = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
  } else {
    if (navStaff) navStaff.style.display = 'none';
    if (navPartLink) navPartLink.style.display = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'block';
  }
}

// ── FUNCIÓN: Cerrar sesión
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
  if (navPartLink) navPartLink.style.display = 'block';
  
  // Recargar la página para limpiar completamente
  window.location.reload();
};

// ── FUNCIÓN: Inicializar Google OAuth
function inicializarGoogleOAuth() {
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
    console.warn('⏳ Esperando a que se cargue el SDK de Google...');
    setTimeout(inicializarGoogleOAuth, 300);
    return;
  }
  
  try {
    google.accounts.id.initialize({
      client_id: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false
    });
    googleOAuthReady = true;
    console.log('✅ Google OAuth inicializado correctamente');
  } catch (e) {
    console.error('❌ Error al inicializar Google OAuth:', e);
  }
}

// ── INICIALIZACIÓN: Restaurar sesión si existe
document.addEventListener('componentsLoaded', function() {
  console.log('📦 Componentes cargados, inicializando autenticación...');
  
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
  
  // Inicializar Google Sign-In (espera a que el SDK esté cargado)
  inicializarGoogleOAuth();
});
