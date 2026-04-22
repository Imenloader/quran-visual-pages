export type OfflineBundleId =
  | "global-shell"
  | "quran-pages"
  | "tafsir"
  | "audio-recitations";

export interface OfflineBundleConfig {
  id: OfflineBundleId;
  label: string;
  cacheName: string;
  maxEntries: number;
  priority: "critical" | "optional";
  description: string;
}

export const OFFLINE_BUNDLES: Record<OfflineBundleId, OfflineBundleConfig> = {
  "global-shell": {
    id: "global-shell",
    label: "Global Navigation",
    cacheName: "workbox-precache-v2",
    maxEntries: 250,
    priority: "critical",
    description: "App shell and global navigation routes",
  },
  "quran-pages": {
    id: "quran-pages",
    label: "Quran Pages (Juz Viewer)",
    cacheName: "quran-pages-cache",
    maxEntries: 700,
    priority: "critical",
    description: "Quran image pages and fallback sources",
  },
  tafsir: {
    id: "tafsir",
    label: "Tafsir",
    cacheName: "tafsir-cache",
    maxEntries: 500,
    priority: "critical",
    description: "Tafsir responses and ayah text payloads",
  },
  "audio-recitations": {
    id: "audio-recitations",
    label: "Audio Recitations",
    cacheName: "quran-audio-cache",
    maxEntries: 1000,
    priority: "optional",
    description: "Recitation MP3 files for offline playback",
  },
};

export const OFFLINE_ROUTE_BUNDLES: Record<string, OfflineBundleId[]> = {
  "/": ["global-shell"],
  "/hub": ["global-shell"],
  "/offline": ["global-shell", "quran-pages", "audio-recitations", "tafsir"],
  "/juz/:juzNumber": ["global-shell", "quran-pages", "audio-recitations"],
  "/tafsir": ["global-shell", "tafsir"],
  "/recitations": ["global-shell", "audio-recitations"],
};

