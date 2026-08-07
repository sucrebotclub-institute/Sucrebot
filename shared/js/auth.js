// ═══════════════════════════════════════════════════════════════
// AUTENTICACIÓN GOOGLE OAUTH + GESTIÓN DE SESIÓN
// Archivo: /shared/js/auth.js
// ═══════════════════════════════════════════════════════════════

// El rol (staff/ayudante/admin) ya NO vive hardcodeado acá — se gestiona
// desde CONFIGURACION (Admin) y se guarda en la hoja 'personal' de Sheets.
// Como consultarlo es async (fetch a GAS), se cachea en localStorage para
// que esStaffCompleto()/esJuez()/esAdmin() puedan seguir siendo síncronas
// (muchas páginas las llaman justo al cargar, sin poder esperar un fetch).
const ROL_CACHE_KEY = 'sucrebot_rol_cache';
const ROL_TTL       = 15 * 60 * 1000; // 15 min

function obtenerRolCacheado(correo) {
  try {
    const raw = localStorage.getItem(ROL_CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c.correo === correo ? c.rol : null;
  } catch (e) {
    return null;
  }
}

// Como obtenerRolCacheado() pero distingue "no hay caché todavía"
// (undefined) de "ya sabemos que este correo NO tiene rol" (null,
// participante común) -- activarSesion() necesita esa distinción para
// no confundir ambos casos al decidir si aplica el nav de una o espera.
function obtenerRolCacheadoConDistincion(correo) {
  try {
    const raw = localStorage.getItem(ROL_CACHE_KEY);
    if (!raw) return undefined;
    const c = JSON.parse(raw);
    return c.correo === correo ? c.rol : undefined;
  } catch (e) {
    return undefined;
  }
}

function guardarRolCache(correo, rol) {
  localStorage.setItem(ROL_CACHE_KEY, JSON.stringify({ correo: correo, rol: rol, ts: Date.now() }));
}

let _rolFetchPromise = null;
let _rolFetchCorreo  = null;

// Resuelve el rol de un correo: usa caché si está fresca, si no consulta
// GAS. Si el fetch falla, cae a la caché vieja (aunque haya expirado) para
// no dejar afuera al staff por un corte momentáneo de red.
function resolverRol(correo) {
  try {
    const raw = localStorage.getItem(ROL_CACHE_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      if (c.correo === correo && (Date.now() - c.ts) < ROL_TTL) return Promise.resolve(c.rol);
    }
  } catch (e) {}

  if (_rolFetchPromise && _rolFetchCorreo === correo) return _rolFetchPromise;

  _rolFetchCorreo  = correo;
  _rolFetchPromise = fetch(CONFIG.GAS_URL() + '?action=getRolPersonal&correo=' + encodeURIComponent(correo))
    .then(r => r.json())
    .then(data => {
      const rol = data && data.rol ? data.rol : null;
      guardarRolCache(correo, rol);
      return rol;
    })
    .catch(() => obtenerRolCacheado(correo))
    .finally(() => { _rolFetchPromise = null; _rolFetchCorreo = null; });

  return _rolFetchPromise;
}

// Arranca a resolver el rol ni bien este script termina de cargar, sin
// esperar al evento 'componentsLoaded' -- el fetch a GAS es lo más lento de
// toda la secuencia de carga inicial (SDK de Google + HTML de nav/header),
// así que conviene que corra superpuesto con el resto en vez de arrancar
// recién cuando ya se cargó todo lo demás. resolverRol() memoiza la promesa
// en curso (_rolFetchPromise), así que cuando activarSesion() la pida de
// nuevo más tarde reusa este mismo fetch en vez de arrancar uno nuevo.
window.prefetchRol = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return;
  try {
    const u = JSON.parse(s);
    resolverRol(u.email);
  } catch (e) {}
};

// ── Helper global: esperar a que el rol del usuario logueado esté
// resuelto (fresco o desde caché) antes de chequear esStaffCompleto()/
// esJuez()/esAdmin(). Las páginas que gatean acceso al cargar DEBEN
// await esto primero — si no, pueden leer una caché vacía en el primer
// login de la sesión y negar acceso a alguien que sí tiene rol.
window.esperarRol = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return Promise.resolve(null);
  try {
    const u = JSON.parse(s);
    return resolverRol(u.email);
  } catch (e) {
    return Promise.resolve(null);
  }
};

// ── Helper global: ¿el usuario logueado es staff completo? ──────
// Usar esto (no el token) para gatear páginas de Organización, porque
// el token se comparte también con los ayudantes para que les funcionen
// las páginas de Jueces. Lee de caché (síncrono) — llamar después de
// `await esperarRol()` si es la primera vez que se resuelve en la sesión.
window.esStaffCompleto = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return false;
  try {
    const u = JSON.parse(s);
    const rol = obtenerRolCacheado(u.email);
    return rol === 'staff' || rol === 'admin';
  } catch (e) {
    return false;
  }
};

// ── Helper global: ¿el usuario logueado es ayudante (o staff)? ──
// Staff completo también cuenta como "juez" para efectos de acceso a
// Cronómetro/Insectos/Panel-Bracket/Panel-Calificación.
window.esJuez = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return false;
  try {
    const u = JSON.parse(s);
    const rol = obtenerRolCacheado(u.email);
    return rol === 'staff' || rol === 'admin' || rol === 'ayudante';
  } catch (e) {
    return false;
  }
};

// ── Helper global: ¿el usuario logueado es administrador? ───────
// Usar para gatear páginas admin-only (ej. CONFIGURACION). Siempre
// subconjunto de Staff completo — un admin ya ve todo lo de Staff.
window.esAdmin = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return false;
  try {
    const u = JSON.parse(s);
    return obtenerRolCacheado(u.email) === 'admin';
  } catch (e) {
    return false;
  }
};

// Token compartido con GAS — debe coincidir exactamente con STAFF_TOKEN_VALUE en Code.gs
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

// Aplica al nav la visibilidad que corresponde a un rol ya resuelto --
// separada de activarSesion() para poder llamarla DOS veces: una
// síncrona con el rol cacheado (si hay) apenas se inyecta el nav, y otra
// después de resolverRol() por si el rol cambió desde la última vez.
// Sin la primera llamada síncrona, el nav se ve un instante con el
// estado por defecto de nav.html (Organización/Mi Cuenta visibles,
// Jueces/Administración ocultos) hasta que el await de resolverRol()
// termina -- mismo tipo de "flash" que ya se corrigió en los selectores
// de categoría de CRONOMETRO/PANEL-CALIFICACION/PANEL-BRACKET.
function aplicarVisibilidadNav(rol) {
  const isStaff    = rol === 'staff' || rol === 'admin';
  const isAyudante = rol === 'ayudante';
  const isAdmin    = rol === 'admin';
  const esJuezRol  = isStaff || isAyudante; // ambos ven/usan páginas de Jueces

  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navAdmin        = document.getElementById('navAdmin');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');

  if (esJuezRol) {
    if (navStaff)        navStaff.style.display        = 'block';
    // Organización: SOLO staff completo, nunca ayudantes
    if (navOrganizacion) navOrganizacion.style.display = isStaff ? 'block' : 'none';
    if (navAdmin)         navAdmin.style.display        = isAdmin ? 'block' : 'none';
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
  } else {
    if (navStaff)        navStaff.style.display        = 'none';
    if (navOrganizacion) navOrganizacion.style.display = 'none';
    if (navAdmin)         navAdmin.style.display        = 'none';
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'block';
  }
}

// Hook global que load-components.js llama apenas termina de inyectar
// nav.html en el DOM -- ANTES de esperar a que el resto de los
// componentes (header/footer/topbar) también terminen de cargar. El
// evento 'componentsLoaded' (que dispara activarSesion) no arranca
// hasta que TODOS los data-include resuelven, así que si nav.html
// resuelve rápido pero otro componente tarda un poco más, el nav queda
// expuesto con el estado por defecto (pensado para visitante anónimo)
// durante esa espera de más -- se nota especialmente en REGISTRO/
// INICIO, las páginas más livianas donde el resto del layout carga
// rápido y esa ventana se hace más perceptible. Esta función solo
// aplica lo que ya sabemos por caché (síncrono, sin red); la
// revalidación real sigue pasando por activarSesion() como siempre.
window.aplicarVisibilidadNavDesdeCache = function() {
  const s = localStorage.getItem('sucrebot_user');
  if (!s) return;
  try {
    const u = JSON.parse(s);
    const rol = obtenerRolCacheadoConDistincion(u.email);
    if (rol !== undefined) aplicarVisibilidadNav(rol);
  } catch (e) {}
};

// ── FUNCIÓN: Activar sesión del usuario
async function activarSesion(data) {
  localStorage.setItem('sucrebot_user', JSON.stringify(data));

  const btnLogin    = document.getElementById('btnLogin');
  const userInfo    = document.getElementById('userInfo');
  const userName    = document.getElementById('userName');
  const userAvatar  = document.getElementById('userAvatar');

  if (btnLogin)  btnLogin.style.display = 'none';
  if (userInfo)  userInfo.classList.add('visible');
  if (userName)  userName.textContent = data.name || data.email;
  if (userAvatar && data.picture) userAvatar.src = data.picture;

  // Aplica YA MISMO el rol cacheado de la última vez (síncrono, sin
  // esperar red) -- si no hay caché todavía (primer login de la sesión
  // en este dispositivo), el nav se queda con el estado por defecto de
  // nav.html hasta que resuelva el await de abajo, como antes.
  const rolCacheado = obtenerRolCacheadoConDistincion(data.email);
  if (rolCacheado !== undefined) aplicarVisibilidadNav(rolCacheado);

  const rol = await resolverRol(data.email);
  aplicarVisibilidadNav(rol);
  const isStaff    = rol === 'staff' || rol === 'admin';
  const isAyudante = rol === 'ayudante';
  const esJuezRol  = isStaff || isAyudante; // ambos ven/usan páginas de Jueces

  // ── Guardar/limpiar token staff según rol ──────────────────
  // El token se comparte con ayudantes: lo necesitan para que
  // Cronómetro/Insectos/Panel-Bracket/Panel-Calificación funcionen.
  if (esJuezRol) {
    localStorage.setItem('sucrebot_staff_token', STAFF_TOKEN_VALUE);
  } else {
    localStorage.removeItem('sucrebot_staff_token');
  }
}

// ── FUNCIÓN: Cerrar sesión (DEBE SER GLOBAL para onclick)
window.cerrarSesion = function() {
  localStorage.removeItem('sucrebot_user');
  localStorage.removeItem('sucrebot_staff_token'); // ── limpiar token staff
  localStorage.removeItem(ROL_CACHE_KEY);          // ── limpiar caché de rol

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  const btnLogin        = document.getElementById('btnLogin');
  const userInfo        = document.getElementById('userInfo');
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navAdmin        = document.getElementById('navAdmin');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');

  if (btnLogin)        btnLogin.style.display        = 'flex';
  if (userInfo)        userInfo.classList.remove('visible');
  if (navStaff)        navStaff.style.display        = 'none';
  if (navOrganizacion) navOrganizacion.style.display = 'none';
  if (navAdmin)        navAdmin.style.display        = 'none';
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
  localStorage.removeItem(ROL_CACHE_KEY);          // ── limpiar caché de rol

  const btnLogin        = document.getElementById('btnLogin');
  const userInfo        = document.getElementById('userInfo');
  const navStaff        = document.getElementById('navStaff');
  const navOrganizacion = document.getElementById('navOrganizacion');
  const navAdmin        = document.getElementById('navAdmin');
  const navPartDropdown = document.getElementById('navPartDropdown');
  const navPartLink     = document.getElementById('navPartLink');

  if (btnLogin)        btnLogin.style.display        = 'flex';
  if (userInfo)        userInfo.classList.remove('visible');
  if (navStaff)        navStaff.style.display        = 'none';
  if (navOrganizacion) navOrganizacion.style.display = 'none';
  if (navAdmin)        navAdmin.style.display        = 'none';
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
  const navAdmin        = document.getElementById('navAdmin');

  if (!savedUser) {
    if (navPartLink)     navPartLink.style.display     = 'none';
    if (navPartDropdown) navPartDropdown.style.display = 'none';
    if (navStaff)        navStaff.style.display        = 'none';
    if (navOrganizacion) navOrganizacion.style.display = 'none';
    if (navAdmin)        navAdmin.style.display        = 'none';
  }
}

// ── FUNCIÓN: Inicializar Google Sign-In (idempotente) ──────────────
// Separada del listener de 'componentsLoaded' porque ese evento ya no
// espera al SDK de Google (ver load-components.js) -- puede que `google`
// todavía no exista en ese momento. Se reintenta cuando llega
// 'googleSDKReady', sin duplicar la inicialización si ya se hizo antes.
let _googleSignInListo = false;
function inicializarGoogleSignIn() {
  if (_googleSignInListo) return;
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
    _googleSignInListo = true;
    console.log('✅ Google OAuth inicializado con selector de cuentas');
  } else {
    console.warn('⏳ SDK de Google no disponible aún');
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
      localStorage.removeItem(ROL_CACHE_KEY);
    }
  }

  inicializarGoogleSignIn();
});

document.addEventListener('googleSDKReady', inicializarGoogleSignIn);
