// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════
 
const CONFIG = {        
    
  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbxgwMwm0IB3-3dx2SONaGFH0VxypRPK8s_jRNOH5jtP4LZeUQYblw4UyJS56xVNpBy8Ug',       

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
    'rlema@tecnologicosucre.edu.ec',
    'crivera@tecnologicosucre.edu.ec', 
    'aguano@tecnologicosucre.edu.ec', 
    'aperez@tecnologicosucre.edu.ec', 
    'vquasquer@tecnologicosucre.edu.ec', 
    'vduran@tecnologicosucre.edu.ec', 
    'dgodoy@tecnologicosucre.edu.ec',
    'isimbana@tecnologicosucre.edu.ec',
    'lmolina@tecnologicosucre.edu.ec'
  ]

};
