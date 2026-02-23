import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Restore theme preference
const savedTheme = localStorage.getItem("quran-theme");
if (savedTheme === "dark" || savedTheme === "night") {
  document.documentElement.classList.add("dark");
  const dimming = localStorage.getItem("quran-page-dimming") || "80";
  document.documentElement.style.setProperty("--page-brightness", `${parseInt(dimming) / 100}`);
}

createRoot(document.getElementById("root")!).render(<App />);

// Pre-cache embedded sites after app loads
const preCacheEmbeddedSites = async () => {
  const SITES_TO_CACHE = [
    "https://quraaniat.vercel.app",
    "https://www.mohammedhesham.site/aya",
  ];

  // Wait for idle time
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => {
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
