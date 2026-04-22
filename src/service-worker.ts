/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

type MetricRecord = {
  bundle: string;
  endpoint: string;
  cacheName: string;
  cacheHits: number;
  cacheMisses: number;
  networkSuccesses: number;
  networkFailures: number;
  handlerFailures: number;
};

const routeMetrics = new Map<string, MetricRecord>();

const getMetricKey = (bundle: string, endpoint: string) => `${bundle}::${endpoint}`;

const getMetricSnapshot = (bundle: string, endpoint: string, cacheName: string): MetricRecord => {
  const key = getMetricKey(bundle, endpoint);
  const existing = routeMetrics.get(key);
  if (existing) return existing;

  const fresh: MetricRecord = {
    bundle,
    endpoint,
    cacheName,
    cacheHits: 0,
    cacheMisses: 0,
    networkSuccesses: 0,
    networkFailures: 0,
    handlerFailures: 0,
  };

  routeMetrics.set(key, fresh);
  return fresh;
};

const publishMetricLog = (
  level: 'info' | 'warn' | 'error',
  event: string,
  metric: MetricRecord,
  request?: Request,
  extra?: Record<string, unknown>
) => {
  const cacheTotal = metric.cacheHits + metric.cacheMisses;
  const networkTotal = metric.networkSuccesses + metric.networkFailures;

  const payload = {
    event,
    bundle: metric.bundle,
    endpoint: metric.endpoint,
    cacheName: metric.cacheName,
    requestUrl: request?.url,
    method: request?.method,
    metrics: {
      cacheHits: metric.cacheHits,
      cacheMisses: metric.cacheMisses,
      cacheSuccessRate: cacheTotal ? Number((metric.cacheHits / cacheTotal).toFixed(4)) : null,
      networkSuccesses: metric.networkSuccesses,
      networkFailures: metric.networkFailures,
      networkSuccessRate: networkTotal ? Number((metric.networkSuccesses / networkTotal).toFixed(4)) : null,
      handlerFailures: metric.handlerFailures,
    },
    ...extra,
    timestamp: new Date().toISOString(),
  };

  console[level]('[sw-metrics]', payload);
};

const metricsPlugin = (bundle: string, endpoint: string, cacheName: string) => ({
  cachedResponseWillBeUsed: async ({ cachedResponse, request }: { cachedResponse?: Response | null; request: Request }) => {
    const metric = getMetricSnapshot(bundle, endpoint, cacheName);
    if (cachedResponse) {
      metric.cacheHits += 1;
      publishMetricLog('info', 'cache_hit', metric, request);
    } else {
      metric.cacheMisses += 1;
      publishMetricLog('warn', 'cache_miss', metric, request);
    }

    return cachedResponse;
  },

  fetchDidSucceed: async ({ response, request }: { response: Response; request: Request }) => {
    const metric = getMetricSnapshot(bundle, endpoint, cacheName);
    metric.networkSuccesses += 1;
    publishMetricLog('info', 'network_success', metric, request, { responseStatus: response.status });
    return response;
  },

  fetchDidFail: async ({ error, request }: { error: Error; request: Request }) => {
    const metric = getMetricSnapshot(bundle, endpoint, cacheName);
    metric.networkFailures += 1;
    publishMetricLog('error', 'network_failure', metric, request, { error: error.message });
  },

  handlerDidError: async ({ error, request }: { error: Error; request: Request }) => {
    const metric = getMetricSnapshot(bundle, endpoint, cacheName);
    metric.handlerFailures += 1;
    publishMetricLog('error', 'handler_failure', metric, request, { error: error.message });
  },
});

cleanupOutdatedCaches();

// @ts-expect-error: __WB_MANIFEST is injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'GET_SW_METRICS') return;

  event.source?.postMessage({
    type: 'SW_METRICS_SNAPSHOT',
    metrics: Array.from(routeMetrics.values()),
    timestamp: Date.now(),
  });
});

// Quran page images (local) - cache forever
registerRoute(
  ({ url }) => url.pathname.startsWith('/quran-images/'),
  new CacheFirst({
    cacheName: 'quran-pages-cache',
    plugins: [
      metricsPlugin('quran-pages', '/quran-images/*', 'quran-pages-cache'),
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
      metricsPlugin('quran-pages', 'jahedev.github.io/tajweed-quran-pages/*', 'quran-pages-cache'),
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
  /^https:\/\/(?:api\.alquran\.cloud|api\.quran\.com|mp3quran\.net)\/api\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'quran-api-cache',
    plugins: [
      metricsPlugin('quran-api', 'api.alquran.cloud|api.quran.com|mp3quran.net/api/*', 'quran-api-cache'),
      new ExpirationPlugin({
        maxEntries: 100,
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
      metricsPlugin('embedded', 'quraaniat.vercel.app/*', 'embedded-quraaniat-cache'),
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
      metricsPlugin('embedded', 'www.mohammedhesham.site/*', 'embedded-mohammedhesham-cache'),
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
      metricsPlugin('fonts', 'fonts.googleapis.com/*', 'google-fonts-stylesheets'),
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
      metricsPlugin('fonts', 'fonts.gstatic.com/*', 'google-fonts-webfonts'),
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
      metricsPlugin('prayer-times', 'api.aladhan.com/*', 'prayer-times-cache'),
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

// Sitemap.xml - serve as static
registerRoute(
  ({ url }) => url.pathname === '/sitemap.xml',
  new StaleWhileRevalidate({
    cacheName: 'static-assets-cache',
    plugins: [
      metricsPlugin('static-assets', '/sitemap.xml', 'static-assets-cache'),
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
      metricsPlugin('audio', '*.mp3', 'quran-audio-cache'),
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
      metricsPlugin('images', '*.(png|jpg|jpeg|svg|gif|webp)', 'images-cache'),
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
  let data: Record<string, unknown> = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_error) {
    data = { title: 'تنبيه إسلامي', body: event.data ? event.data.text() : 'حان وقت الصلاة أو الذكر' };
  }

  const title = (data.title as string) || 'تنبيه إسلامي';
  const options = {
    body: (data.body as string) || 'حان وقت الصلاة أو الذكر',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: (data.tag as string) || 'islamic-notification',
    renotify: true,
    data: {
      url: (data.url as string) || '/',
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

      for (let i = 0; i < windowClients.length; i += 1) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return undefined;
    })
  );
});
