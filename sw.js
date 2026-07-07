/**
 * SucreBot 2026 — Service Worker
 * Estrategia: RED PRIMERO, CACHÉ COMO RESPALDO.
 *
 * Con internet: cada petición va siempre a la red (comportamiento IDÉNTICO
 * a no tener Service Worker), y de paso se guarda una copia en caché.
 * Sin internet: si la red falla, se sirve la última copia buena conocida.
 *
 * Solo intercepta peticiones GET del mismo origen (las páginas, CSS, JS,
 * imágenes propias). Todo lo demás —llamadas POST a Google Apps Script,
 * Google OAuth, o cualquier otro origen— pasa de largo sin tocarse.
 */

const CACHE_NAME = 'sucrebot-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo GET. Deja pasar POST/PUT/etc. (ej. llamadas a Google Apps Script) sin tocar.
  if (req.method !== 'GET') return;

  // Solo mismo origen. Deja pasar Google OAuth, GAS, fuentes externas, etc. sin tocar.
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (e) { return; }
  if (!sameOrigin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          return new Response(
            'Sin conexión y sin copia local guardada de este recurso.',
            { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
          );
        })
      )
  );
});
