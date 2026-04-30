/**
 * SucreBot - Sistema de Autenticación
 * Maneja login con Google y permisos de usuario
 */

const STAFF_EMAILS = [
  'ftipantocta@tecnologicosucre.edu.ec',
  'sucrebotclub@tecnologicosucre.edu.ec'
];

/**
 * Decodifica un JWT token
 */
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

/**
 * Callback de Google Sign-In
 */
function handleCredentialResponse(response) {
  const userData = parseJwt(response.credential);
  activarSesion(userData);
}

/**
 * Activa la sesión del usuario
 */
function activarSesion(data) {
  // Guardar en sessionStorage
  sessionStorage.setItem('sucrebot_user', JSON.stringify(data));
  
  // Ocultar botón de login
  document.getElementById('btnLogin').style.display = 'none';
  
  // Mostrar info de usuario
  const userInfo = document.getElementById('userInfo');
  userInfo.classList.add('visible');
  
  // Actualizar nombre y avatar
  document.getElementById('userName').textContent = data.name || data.email;
  if (data.picture) {
    document.getElementById('userAvatar').src = data.picture;
  }
  
  // Mostrar menús según permisos
  if (STAFF_EMAILS.includes(data.email)) {
    // Usuario es staff
    document.getElementById('navStaff').style.display = 'flex';
  } else {
    // Usuario normal
    document.getElementById('navPartLink').style.display = 'none';
    document.getElementById('navPartDropdown').style.display = 'flex';
  }
}

/**
 * Cerrar sesión
 */
function cerrarSesion() {
  // Limpiar sessionStorage
  sessionStorage.removeItem('sucrebot_user');
  
  // Mostrar botón de login
  document.getElementById('btnLogin').style.display = 'flex';
  
  // Ocultar info de usuario
  document.getElementById('userInfo').classList.remove('visible');
  
  // Resetear menús
  document.getElementById('navStaff').style.display = 'none';
  document.getElementById('navPartLink').style.display = 'block';
  document.getElementById('navPartDropdown').style.display = 'none';
  
  // Deshabilitar auto-select de Google
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
}

/**
 * Iniciar proceso de login
 */
function iniciarLogin() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.error('Google Sign-In no está cargado');
    return;
  }
  
  google.accounts.id.initialize({
    client_id: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',
    callback: handleCredentialResponse,
    use_fedcm_for_prompt: false
  });
  
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Si no se muestra el prompt, renderizar botón
      document.getElementById('btnLogin').innerHTML = '';
      google.accounts.id.renderButton(
        document.getElementById('btnLogin'),
        {
          theme: 'filled_blue',
          size: 'medium',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );
    }
  });
}

/**
 * Restaurar sesión al cargar la página
 */
window.addEventListener('load', () => {
  const savedUser = sessionStorage.getItem('sucrebot_user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      activarSesion(userData);
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      sessionStorage.removeItem('sucrebot_user');
    }
  }
});
