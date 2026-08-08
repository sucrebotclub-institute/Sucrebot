// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════

const CONFIG = {

  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbxlyq37_Ic2g5wK6D4HnMrobLkHRsATQl8pBHEgeWLzfyjvIqS9QNDppwPgKkxRGk73Ug',

  GAS_URL: function() {
    return 'https://script.google.com/macros/s/' + this.DEPLOYMENT_ID + '/exec';
  },

  // ── Google OAuth ─────────────────────────────────────────────
  OAUTH_CLIENT_ID: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com'

  // Nota: los roles (Staff/Ayudante/Admin) ya NO viven acá — se gestionan
  // desde CONFIGURACION (rol Admin) y se guardan en la hoja 'personal' de
  // Sheets. Antes eran 3 listas de emails hardcodeadas y públicas en este
  // mismo archivo (todo el sitio es GitHub Pages, público).

};
