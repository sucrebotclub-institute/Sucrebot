// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════

const CONFIG = {

  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycby9x0JONdQFoabHu0Rlzzluhb0XhXwei_nq6FX2_8KGti4eyvlbKOX2i-UPhwIC1AKRwA',

  GAS_URL: function() {
    return 'https://script.google.com/macros/s/' + this.DEPLOYMENT_ID + '/exec';
  },

  // ── Token de staff ───────────────────────────────────────────
  // Fuente única — debe coincidir exactamente con STAFF_TOKEN_VALUE en
  // Code.gs. Antes estaba copiado como string literal en auth.js +
  // PARTICIPANTES_REGISTRADOS + PANEL-CALIFICACION + ESTADISTICAS +
  // PANTALLA (5 lugares) — rotar el token significaba encontrar y
  // reemplazar los 5 a mano. Ahora todos leen CONFIG.STAFF_TOKEN.
  STAFF_TOKEN: 'SucreBot2026-CMI-Sucre-x7k9mQ',

  // ── Google OAuth ─────────────────────────────────────────────
  OAUTH_CLIENT_ID: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com'

  // Nota: los roles (Staff/Ayudante/Admin) ya NO viven acá — se gestionan
  // desde CONFIGURACION (rol Admin) y se guardan en la hoja 'personal' de
  // Sheets. Antes eran 3 listas de emails hardcodeadas y públicas en este
  // mismo archivo (todo el sitio es GitHub Pages, público).

};
