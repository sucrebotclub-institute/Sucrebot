// config.js - Configuración centralizada de SucreBot
const CONFIG = {
  DEPLOYMENT_ID: 'AKfycbydhor7cdkit0KCMfvMO7AdtUw5p-sqSBwxKwF7aR61v0PcJLwMWb7DqAQJ5ou4rYXr',
  GAS_URL: function() {
    return `https://script.google.com/macros/s/${this.DEPLOYMENT_ID}/exec`;
  }
};
