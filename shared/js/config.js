// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════

const CONFIG = {

  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbyv_T5NI0Ek8vOiFBOSFgHlXnUs1h3h6yBteLYyVqU3CTfPEARB-de5GLagLTcRRKs_Yw',

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
