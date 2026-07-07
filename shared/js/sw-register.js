/**
 * Registro del Service Worker — incluir con:
 * <script src="../shared/js/sw-register.js"></script>
 *
 * Falla en silencio si el navegador no soporta Service Workers, o si el
 * registro falla por cualquier motivo — nunca bloquea ni afecta la carga
 * normal de la página.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Sucrebot/sw.js')
      .then((reg) => console.log('[SW] registrado, scope:', reg.scope))
      .catch((err) => console.warn('[SW] registro fallido (no crítico):', err));
  });
}
