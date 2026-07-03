// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════
 
const CONFIG = {       
    
  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbzH_o1kMEYzQv1M3n2dD3jAAx48dXMX1nS1CsdHMAuJGM-A5A6euS_DLn_D-iTAlXJ6wQ',       

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
    'cortega@tecnologicosucre.edu.ec',
    'lmolina@tecnologicosucre.edu.ec'
  ]

};
