// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════

const CONFIG = { 
    
  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbwxPW4K8YlNG5NTkue7Z2LAm4nW1UsU3PI3mo9sWwyUFxXnrhyohYQLlQyy9HhTSNS3yg',    

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
    'msarzosa@tecnologicosucre.edu.ec',
    'dj.rodriguezmorales1@gmail.com',
    'lmolina@tecnologicosucre.edu.ec'
  ]

};
