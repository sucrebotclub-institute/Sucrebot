// config.js - Configuración centralizada de SucreBot

const CONFIG = {
  // ID de deployment actual del Google Apps Script
  DEPLOYMENT_ID: 'AKfycbyv_T5NI0Ek8vOiFBOSFgHlXnUs1h3h6yBteLYyVqU3CTfPEARB-de5GLagLTcRRKs_Yw', 
  
  // Función para obtener la URL completa del GAS
  GAS_URL: function() {
    return `https://script.google.com/macros/s/${this.DEPLOYMENT_ID}/exec`;
  },
  
  // OAuth Client ID de Google
  OAUTH_CLIENT_ID: '14154960360-fofn56epv2rsiq882sni5ku0q1idemg4.apps.googleusercontent.com',
  
  // Emails del staff autorizado
  STAFF_EMAILS: [
  'ftipantocta@tecnologicosucre.edu.ec',
  'sucrebotclub@tecnologicosucre.edu.ec',
  'vandrade@tecnologicosucre.edu.ec',
  'gherrera@tecnologicosucre.edu.ec',
  'lmolina@tecnologicosucre.edu.ec'
]
};
