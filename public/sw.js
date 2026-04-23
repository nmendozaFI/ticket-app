/**
 * Service Worker - Gestión de Gastos de Viaje
 * Estrategia básica: precache del shell + cache-first para assets estáticos.
 *
 * IMPORTANTE: Las rutas /api/* NUNCA se cachean — son críticas para OCR,
 * uploads a Cloudinary, autenticación, y mutaciones contra Neon.
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// App shell: recursos mínimos para arrancar la app offline
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Instalación: precachear el shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Error en precache:', err))
  );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Helpers
const isApiRequest = (url) => url.pathname.startsWith('/api/');
const isAuthRequest = (url) =>
  url.pathname.startsWith('/api/auth') ||
  url.pathname.startsWith('/_next/webpack-hmr');
const isStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/icons/') ||
  /\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(url.pathname);
const isCloudinaryUrl = (url) => url.hostname.includes('cloudinary.com');

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Solo manejamos GET — POSTs, PUTs y DELETEs van siempre a red
  if (request.method !== 'GET') return;

  // 2. NUNCA cachear rutas API, auth, ni HMR
  if (isApiRequest(url) || isAuthRequest(url)) return;

  // 3. Ignorar peticiones cross-origin que no sean Cloudinary (imágenes de tickets)
  if (url.origin !== self.location.origin && !isCloudinaryUrl(url)) return;

  // 4. Assets estáticos → cache-first
  if (isStaticAsset(url) || isCloudinaryUrl(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 5. Navegación (HTML) → network-first, fallback a cache (para offline básico)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }
});

// Mensaje desde la app para forzar actualización
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});