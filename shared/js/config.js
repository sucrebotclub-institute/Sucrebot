// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════
 
const CONFIG = {       
    
  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbxAe_eRa9jeozRB04pGrcOlMCJ-u5P_xNUluYPda1Kk0L4d25K4CkEvp2b97jnW3pSSHQ',       

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
    'lmolina@tecnologicosucre.edu.ec'
  ]

};
