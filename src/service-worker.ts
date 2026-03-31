/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

// @ts-expect-error: __WB_MANIFEST is injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Quran page images (local) - cache forever
registerRoute(
  ({ url }) => url.pathname.startsWith('/quran-images/'),
  new CacheFirst({
    cacheName: 'quran-pages-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 700,
        maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Quran page images (external fallback) - cache forever
registerRoute(
  /^https:\/\/jahedev\.github\.io\/tajweed-quran-pages\/.*/i,
  new CacheFirst({
    cacheName: 'quran-pages-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 700,
        maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Quran API - stale while revalidate
registerRoute(
  /^https:\/\/mp3quran\.net\/api\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'quran-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Embedded sites
registerRoute(
  /^https:\/\/quraaniat\.vercel\.app\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'embedded-quraaniat-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/www\.mohammedhesham\.site\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'embedded-mohammedhesham-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Prayer times API
registerRoute(
  /^https:\/\/api\.aladhan\.com\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'prayer-times-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// MP3 audio files
registerRoute(
  /\.mp3$/i,
  new CacheFirst({
    cacheName: 'quran-audio-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new RangeRequestsPlugin(),
    ],
  })
);

// Generic images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Background Notifications logic
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'تنبيه إسلامي', body: event.data ? event.data.text() : 'حان وقت الصلاة أو الذكر' };
  }
  
  const title = data.title || 'تنبيه إسلامي';
  const options = {
    body: data.body || 'حان وقت الصلاة أو الذكر',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'islamic-notification',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
