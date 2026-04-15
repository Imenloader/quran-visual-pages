import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { registerPeriodicSync } from "./lib/pwa-utils";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register periodic sync
registerPeriodicSync();

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
