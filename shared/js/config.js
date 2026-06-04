// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════

const CONFIG = {

  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbyqMYRaEANLMMf4cc28mH-yiziqnXiEzeaEiF3bK8Jb5zm3xt_BaqgH2Gx6UJo287ypRQ',

  GAS_URL: function() {
    return 'https://script.google.com/macros/s/' + this.DEPLOYMENT_ID + '/exec';
  },

  // ── Google OAuth ─────────────────────────────────────────────
  OAUTH_CLIENT_ID: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',

  // ── Staff autorizado ─────────────────────────────────────────
  STAFF_EMAILS: [
    'ftipantocta@tecnologicosucre.edu.ec',
    'sucrebotclub@tecnologicosucre.edu.ec',
    'vandrade@tecnologicosucre.edu.ec',
    'gherrera@tecnologicosucre.edu.ec',
    'lmolina@tecnologicosucre.edu.ec'
  ]

};
