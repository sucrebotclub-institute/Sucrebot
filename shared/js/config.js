// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Configuración centralizada
// ════════════════════════════════════════════════════════════════
 
const CONFIG = {        
    
  // ── Google Apps Script ──────────────────────────────────────
  DEPLOYMENT_ID: 'AKfycbzxYGbW35VJGr9TtCfTTIxsSouKl87xivATUQUNYYjExKP7TcubUsYr8a7V08Dey8ndBw',       

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
    'vcuasquer@tecnologicosucre.edu.ec', 
    'vduran@tecnologicosucre.edu.ec', 
    'lmolina@tecnologicosucre.edu.ec'
  ],

  // ── Ayudantes (ajenos a la carrera) ───────────────────────────
  // Ven el menú Jueces (Cronómetro/Insectos/Panel-Bracket/Panel-Calificación)
  // pero NO ven ni pueden entrar a Organización (Escáner/Manillas/Certificados/
  // Participantes/Estadísticas). Agregar aquí los correos de los ayudantes.
  AYUDANTE_EMAILS: [
    'isimbana@tecnologicosucre.edu.ec',
    'dgodoy@tecnologicosucre.edu.ec',
    'aperez@tecnologicosucre.edu.ec',
    'rakusho9999@gmail.com'
  ]

};
