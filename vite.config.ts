import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: "autoUpdate",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      includeAssets: ["icon.svg", "robots.txt", "sitemap.xml", "pwa-192x192.png", "pwa-512x512.png", "placeholder.svg", "Adhan Sounds/*.mp3"],
      manifest: {
        name: "القرآن الكريم - مصحف المدينة المنورة",
        short_name: "القرآن الكريم",
        description: "تصفح أجزاء المصحف الشريف الثلاثين بجودة عالية واستمع للتلاوات",
        theme_color: "#1a5c3a",
        background_color: "#f5f0e8",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "portrait",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        categories: ["books", "education", "lifestyle"],
        shortcuts: [
          {
            name: "أوقات الصلاة",
            short_name: "الصلاة",
            url: "/prayer-times",
            icons: [{ src: "/icon.svg", sizes: "192x192" }]
          },
          {
            name: "الأذكار اليومية",
            short_name: "الأذكار",
            url: "/daily-adhkar",
            icons: [{ src: "/icon.svg", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
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
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'motion'],
          ui: ['lucide-react', 'sonner'],
        },
      },
    },
  },
}));
