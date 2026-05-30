// config.js - Configuración centralizada de SucreBot

const CONFIG = {
  // ID de deployment actual del Google Apps Script
  DEPLOYMENT_ID: 'AKfycby1KWTlY0Z_-XAbYlOM8wZbvfwx24d7l91J56se5nzrCUlWarkTH5KgZ8AwkIV32uuZBQ', 
  
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
  'vandrade@tecnologicosucre.edu.ec'
]
};
