import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-192x192.png", "pwa-512x512.png", "placeholder.svg"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        // Pre-cache all app assets aggressively
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2,ttf,json}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // Runtime caching rules
        runtimeCaching: [
          // Quran page images - cache forever
          {
            urlPattern: /^https:\/\/jahedev\.github\.io\/tajweed-quran-pages\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-pages-cache",
              expiration: {
                maxEntries: 700,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Quran API - stale while revalidate
          {
            urlPattern: /^https:\/\/mp3quran\.net\/api\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "quran-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Embedded sites (quraaniat.vercel.app, mohammedhesham.site)
          {
            urlPattern: /^https:\/\/quraaniat\.vercel\.app\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "embedded-quraaniat-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/www\.mohammedhesham\.site\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "embedded-mohammedhesham-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
              },
            },
          },
          // Google Fonts webfonts
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Prayer times API
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "prayer-times-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // MP3 audio files for recitations - cache forever
          {
            urlPattern: /\.mp3$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-audio-cache",
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 2,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
          // Generic images from any CDN
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "القرآن الكريم - مصحف المدينة المنورة",
        short_name: "القرآن الكريم",
        description: "تصفح أجزاء المصحف الشريف الثلاثين بجودة عالية",
        theme_color: "#1a5c3a",
        background_color: "#f5f0e8",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
