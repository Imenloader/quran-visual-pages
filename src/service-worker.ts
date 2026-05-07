/// <reference lib="webworker" />

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

// --- Metrics System ---
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

  // Only log in production for errors, or all logs in development
  const isDev = self.location.hostname === 'localhost';
  if (!isDev && level === 'info') return;

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
    return undefined;
  },

  handlerDidError: async ({ error, request }: { error: Error; request: Request }) => {
    const metric = getMetricSnapshot(bundle, endpoint, cacheName);
    metric.handlerFailures += 1;
    publishMetricLog('error', 'handler_failure', metric, request, { error: error.message });
    return undefined;
  },
});

// --- Broadcast Channel System ---
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
    return undefined;
  },
  handlerDidComplete: async ({ request }: { request: Request }) => {
    broadcastCacheEvent('CACHE_DONE', {
      resource: request.url,
    });
    return undefined;
  },
};

// --- Route Registration Functions ---

function registerQuranImageRoutes() {
  // Quran page images (local)
  registerRoute(
    ({ url }) => url.pathname.startsWith('/quran-images/'),
    new CacheFirst({
      cacheName: 'quran-pages-cache',
      plugins: [
        metricsPlugin('quran-pages', '/quran-images/*', 'quran-pages-cache'),
        new ExpirationPlugin({
          maxEntries: 700,
          maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        cacheEventPlugin,
      ],
    })
  );

  // Quran page images (external fallback)
  registerRoute(
    ({ url }) => url.hostname === 'jahedev.github.io' && url.pathname.startsWith('/tajweed-quran-pages/'),
    new CacheFirst({
      cacheName: 'quran-pages-cache',
      plugins: [
        metricsPlugin('quran-pages', 'jahedev.github.io/tajweed-quran-pages/*', 'quran-pages-cache'),
        new ExpirationPlugin({
          maxEntries: 700,
          maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        cacheEventPlugin,
      ],
    })
  );
}

function registerTafsirRoutes() {
  const tafsirCacheName = 'quran-tafsir-cache';
  
  const isTafsirRequest = ({ url }: { url: URL }) => {
    // Only catch specific API calls to avoid over-matching
    if (url.hostname === 'api.quran.com') {
      return url.pathname.includes('/tafsirs') || 
             url.pathname.includes('/tafsir') || 
             url.pathname.includes('/resources/recitations') ||
             url.pathname.includes('/chapter_recitations');
    }

    if (url.hostname === 'api.qurancdn.com') {
      return url.pathname.startsWith('/api/v4/') || url.pathname.includes('/tafsir');
    }

    return false;
  };

  registerRoute(
    isTafsirRequest,
    new NetworkFirst({
      cacheName: 'quran-tafsir-cache',
      plugins: [
        metricsPlugin('quran-api-v4', 'api.quran.com|api.qurancdn.com/*', 'quran-tafsir-cache'),
        new ExpirationPlugin({
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
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
  const apiCacheName = 'quran-api-cache';
  const audioCacheName = 'quran-audio-cache';

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
        metricsPlugin('quran-api', 'mp3quran.net/api/*', 'quran-api-cache'),
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
        metricsPlugin('audio', '*.mp3', 'quran-audio-cache'),
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
        metricsPlugin('embedded', 'quraaniat.vercel.app/*', 'embedded-quraaniat-cache'),
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
        metricsPlugin('embedded', 'mohammedhesham.site/*', 'embedded-mohammedhesham-cache'),
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
        metricsPlugin('fonts', 'fonts.googleapis.com/*', 'google-fonts-stylesheets'),
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
    ({ url }) => url.hostname === 'api.aladhan.com',
    new StaleWhileRevalidate({
      cacheName: 'prayer-times-cache',
      plugins: [
        metricsPlugin('prayer-times', 'api.aladhan.com/*', 'prayer-times-cache'),
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
        metricsPlugin('static-assets', '/sitemap.xml', 'static-assets-cache'),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Generic images (excluding Firebase Storage)
  registerRoute(
    ({ request, url }) => {
      const isImage = request.destination === 'image' || /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname);
      const isFirebase = url.hostname.includes('firebasestorage.googleapis.com') || 
                        url.hostname.includes('firebasestorage.app') ||
                        url.hostname.includes('firebaseapp.com');
      return isImage && !isFirebase;
    },
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

  // Catch-all navigation fallback for SPA routes
  const navigationHandler = createHandlerBoundToURL('/index.html');
  registerRoute(
    new NavigationRoute(async (params) => {
      // metricsPlugin('shell', 'navigation', 'shell-cache')
      return navigationHandler(params);
    }, {
      denylist: [/^\/api\//, /^\/quran-images\//],
    })
  );
}

// --- Initialization ---

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// Register modular routes
registerQuranImageRoutes();
registerTafsirRoutes();
registerAudioRoutes();
registerShellRoutes();

// --- Event Listeners ---

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_SW_METRICS') {
    event.source?.postMessage({
      type: 'SW_METRICS_SNAPSHOT',
      metrics: Array.from(routeMetrics.values()),
      timestamp: Date.now(),
    });
    return;
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-prayer-times') {
    event.waitUntil(refreshPrayerTimes());
  }
});

async function refreshPrayerTimes() {
  const cache = await caches.open('prayer-times-cache');
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

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
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
