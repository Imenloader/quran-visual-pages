import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { registerPeriodicSync } from "./lib/pwa-utils";

// Hide splash screen as soon as app is ready
if (Capacitor.isNativePlatform()) {
  SplashScreen.hide();
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register periodic sync
registerPeriodicSync();

// Handle chunk loading errors (refresh the page if a chunk fails to load)
const handleChunkError = (message: string) => {
  const lowMsg = message.toLowerCase();
  if (lowMsg.includes('failed to fetch dynamically imported module') || 
      lowMsg.includes('importing a module script failed') ||
      lowMsg.includes('expected a javascript-or-wasm module script')) {
    console.warn('Chunk load failed, reloading...', message);
    window.location.reload();
  }
};

window.addEventListener('error', (e) => handleChunkError(e.message), true);
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message) {
    handleChunkError(e.reason.message);
  }
});

// Pre-cache embedded sites after app loads
const preCacheEmbeddedSites = async () => {
  const SITES_TO_CACHE = [
    "https://quraaniat.vercel.app",
    "https://www.mohammedhesham.site/aya",
  ];

  // Wait for idle time
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      SITES_TO_CACHE.forEach((url) => {
        fetch(url, { mode: "no-cors", cache: "force-cache" }).catch(() => {});
      });
    });
  } else {
    setTimeout(() => {
      SITES_TO_CACHE.forEach((url) => {
        fetch(url, { mode: "no-cors", cache: "force-cache" }).catch(() => {});
      });
    }, 3000);
  }
};

// Run after first paint
if (document.readyState === "complete") {
  preCacheEmbeddedSites();
} else {
  window.addEventListener("load", preCacheEmbeddedSites, { once: true });
}
