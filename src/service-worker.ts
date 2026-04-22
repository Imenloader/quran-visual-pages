/// <reference lib="webworker" />

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

type CacheEventType = 'CACHE_PROGRESS' | 'CACHE_ERROR' | 'CACHE_DONE';

interface CacheEventPayload {
  cacheName?: string;
  resource?: string;
  source?: string;
  error?: string;
}

const CACHE_EVENT_CHANNEL = 'sw-cache-events';

function broadcastCacheEvent(type: CacheEventType, payload: CacheEventPayload = {}) {
  const message = {
    type,
    payload,
    timestamp: Date.now(),
  };

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CACHE_EVENT_CHANNEL);
    channel.postMessage(message);
    channel.close();
  }

  void self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => client.postMessage(message));
    });
}

const cacheEventPlugin = {
  cacheDidUpdate: async ({ cacheName, request }: { cacheName: string; request: Request }) => {
    broadcastCacheEvent('CACHE_PROGRESS', {
      cacheName,
      resource: request.url,
    });
  },
  fetchDidFail: async ({ request, error }: { request: Request; error: Error }) => {
    broadcastCacheEvent('CACHE_ERROR', {
      resource: request.url,
      error: error?.message ?? 'Failed to fetch resource',
    });
  },
  handlerDidComplete: async ({ request }: { request: Request }) => {
    broadcastCacheEvent('CACHE_DONE', {
      resource: request.url,
    });
  },
};

function registerQuranImageRoutes() {
  const commonImagePlugins = [
    new ExpirationPlugin({
      maxEntries: 700,
      maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
    }),
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    cacheEventPlugin,
  ];

  // Quran page images (local)
  registerRoute(
    ({ url }) => url.pathname.startsWith('/quran-images/'),
    new CacheFirst({
      cacheName: 'quran-pages-cache',
      plugins: commonImagePlugins,
    })
  );

  // Quran page images (external fallback)
  registerRoute(
    ({ url }) => url.hostname === 'jahedev.github.io' && url.pathname.startsWith('/tajweed-quran-pages/'),
    new CacheFirst({
      cacheName: 'quran-pages-cache',
      plugins: commonImagePlugins,
    })
  );
}

function registerTafsirRoutes() {
  const isTafsirRequest = ({ url }: { url: URL }) => {
    if (url.hostname === 'api.quran.com') {
      return url.pathname.startsWith('/api/') || url.pathname.includes('/tafsirs') || url.pathname.includes('/tafsir');
    }

    if (url.hostname === 'api.alquran.cloud') {
      return url.pathname.startsWith('/v1/') || url.pathname.includes('/tafsir');
    }

    return false;
  };

  registerRoute(
    isTafsirRequest,
    new StaleWhileRevalidate({
      cacheName: 'quran-tafsir-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        cacheEventPlugin,
      ],
    })
  );
}

function registerAudioRoutes() {
  const isMp3QuranApiRequest = ({ url }: { url: URL }) => {
    if (!/^(?:www\.)?mp3quran\.net$/i.test(url.hostname)) {
      return false;
    }

    const pathname = url.pathname.toLowerCase();

    return pathname.startsWith('/api/') || pathname.startsWith('/api/v3/') || pathname.startsWith('/api/v4/');
  };

  registerRoute(
    isMp3QuranApiRequest,
    new StaleWhileRevalidate({
      cacheName: 'quran-api-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        cacheEventPlugin,
      ],
    })
  );

  // MP3 audio files
  registerRoute(
    ({ request, url }) => request.destination === 'audio' || /\.mp3$/i.test(url.pathname),
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
        cacheEventPlugin,
      ],
    })
  );
}

function registerShellRoutes() {
  // Embedded sites
  registerRoute(
    ({ url }) => url.hostname === 'quraaniat.vercel.app',
    new StaleWhileRevalidate({
      cacheName: 'embedded-quraaniat-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  registerRoute(
    ({ url }) => url.hostname === 'www.mohammedhesham.site',
    new StaleWhileRevalidate({
      cacheName: 'embedded-mohammedhesham-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Google Fonts
  registerRoute(
    ({ url }) => url.hostname === 'fonts.googleapis.com',
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
    ({ url }) => url.hostname === 'fonts.gstatic.com',
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
    ({ url }) => url.hostname === 'api.aladhan.com',
    new StaleWhileRevalidate({
      cacheName: 'prayer-times-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Static XML
  registerRoute(
    ({ url }) => url.pathname === '/sitemap.xml',
    new StaleWhileRevalidate({
      cacheName: 'static-assets-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Generic images
  registerRoute(
    ({ request, url }) => request.destination === 'image' || /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname),
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

  // Catch-all navigation fallback for SPA routes (deep links / refresh while offline)
  const navigationHandler = createHandlerBoundToURL('/index.html');
  registerRoute(
    new NavigationRoute(navigationHandler, {
      denylist: [/^\/api\//, /^\/quran-images\//],
    })
  );
}

cleanupOutdatedCaches();

// @ts-expect-error: __WB_MANIFEST is injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

registerQuranImageRoutes();
registerTafsirRoutes();
registerAudioRoutes();
registerShellRoutes();

// Background Notifications logic
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-prayer-times') {
    event.waitUntil(refreshPrayerTimes());
  }
});

async function refreshPrayerTimes() {
  const cache = await caches.open('prayer-times-cache');
  // This is a simplified version, in a real app you'd get the user's location from IndexedDB
  // and fetch the latest times to ensure they are ready when the user opens the app.
  console.log('Periodic sync: Refreshing prayer times...', cache);
}

self.addEventListener('push', (event) => {
  let data = {} as Record<string, string>;
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
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  // Send message to all clients to stop adhan
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Send stop signal to all clients
      windowClients.forEach((client) => {
        if ('postMessage' in client) {
          client.postMessage({ type: 'STOP_ADHAN' });
        }
      });

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
