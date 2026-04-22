export type OfflineCacheStrategy = "CacheFirst" | "StaleWhileRevalidate";
export type OfflineBundlePriority = "critical" | "optional";

export interface OfflineBundleRetention {
  maxEntries: number;
  maxAgeSeconds: number;
}

export interface OfflineAssetPatterns {
  images: string[];
  audio: string[];
  json: string[];
  api: string[];
}

export interface OfflineBundleConfig {
  cacheName: string;
  strategy: OfflineCacheStrategy;
  retention: OfflineBundleRetention;
  priority: OfflineBundlePriority;
  requiredAssetPatterns: OfflineAssetPatterns;
}

export const offlineBundles = {
  globalShell: {
    cacheName: "offline-global-shell-v1",
    strategy: "StaleWhileRevalidate",
    retention: {
      maxEntries: 80,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
    priority: "critical",
    requiredAssetPatterns: {
      images: ["/icons/**", "/favicon.ico", "/og-image.png"],
      audio: [],
      json: ["/manifest*.json", "/locales/**/*.json"],
      api: ["/api/config/**", "/api/settings/**"],
    },
  },
  juzViewer: {
    cacheName: "offline-juz-viewer-v1",
    strategy: "CacheFirst",
    retention: {
      maxEntries: 400,
      maxAgeSeconds: 60 * 60 * 24 * 90,
    },
    priority: "critical",
    requiredAssetPatterns: {
      images: ["/quran-pages/**", "/images/quran/**"],
      audio: ["/audio/quran/**", "https://*.everyayah.com/data/**"],
      json: ["/data/juz/**/*.json", "/data/quran/**/*.json"],
      api: ["/api/juz/**", "/api/quran/**"],
    },
  },
  quranImages: {
    cacheName: "offline-quran-images-v1",
    strategy: "CacheFirst",
    retention: {
      maxEntries: 650,
      maxAgeSeconds: 60 * 60 * 24 * 180,
    },
    priority: "critical",
    requiredAssetPatterns: {
      images: ["/quran-pages/*.jpg", "/quran-pages/*.webp", "/images/mushaf/**"],
      audio: [],
      json: ["/data/page-map.json"],
      api: ["/api/pages/**"],
    },
  },
  tafsir: {
    cacheName: "offline-tafsir-v1",
    strategy: "StaleWhileRevalidate",
    retention: {
      maxEntries: 300,
      maxAgeSeconds: 60 * 60 * 24 * 45,
    },
    priority: "optional",
    requiredAssetPatterns: {
      images: [],
      audio: ["/audio/tafsir/**"],
      json: ["/data/tafsir/**/*.json", "/tafsir/**/*.json"],
      api: ["/api/tafsir/**", "/api/translations/**"],
    },
  },
} as const satisfies Record<string, OfflineBundleConfig>;

export type OfflineBundleKey = keyof typeof offlineBundles;

const allRoutePaths = [
  "/",
  "/juz/:juzNumber",
  "/install",
  "/recitations",
  "/athkar",
  "/favorites",
  "/profile",
  "/prayer-times",
  "/hub",
  "/tasbih",
  "/qibla",
  "/names-of-allah",
  "/zakat",
  "/prayer-tracker",
  "/khatma",
  "/hijri",
  "/daily-verse",
  "/mosque-finder",
  "/halal-places",
  "/tafsir",
  "/search",
  "/offline",
  "/friday-sunan",
  "/ramadan",
  "/library",
  "/hajj-guide",
  "/prophet-stories",
  "/names-directory",
  "/daily-adhkar",
  "/khatma-jamaaiya",
  "/hadith",
  "/seerah-timeline",
  "/islamic-quiz",
  "/inheritance-calculator",
  "/fasting-tracker",
  "/routine-builder",
  "/sadaqah-logger",
  "/dua-library",
  "/global-dhikr",
  "/privacy",
  "/moon-tracker",
  "/memorization",
  "/leaderboard",
  "/athkar-circles",
  "/ramadan/virtues",
  "/ramadan/fasting-rules",
  "/ramadan/duas",
  "/ramadan/tips",
  "/ramadan/laylatul-qadr",
  "/ramadan/zakat-al-fitr",
  "/how-to-use",
  "/tajweed",
  "/embed/:siteId",
] as const;

export type CoreRoutePath = (typeof allRoutePaths)[number];

export const coreRouteBundles: Record<CoreRoutePath, OfflineBundleKey[]> = {
  "/": ["globalShell", "quranImages"],
  "/juz/:juzNumber": ["globalShell", "juzViewer", "quranImages"],
  "/install": ["globalShell"],
  "/recitations": ["globalShell", "juzViewer"],
  "/athkar": ["globalShell"],
  "/favorites": ["globalShell", "quranImages", "tafsir"],
  "/profile": ["globalShell"],
  "/prayer-times": ["globalShell"],
  "/hub": ["globalShell"],
  "/tasbih": ["globalShell"],
  "/qibla": ["globalShell"],
  "/names-of-allah": ["globalShell"],
  "/zakat": ["globalShell"],
  "/prayer-tracker": ["globalShell"],
  "/khatma": ["globalShell", "juzViewer", "quranImages"],
  "/hijri": ["globalShell"],
  "/daily-verse": ["globalShell", "juzViewer", "quranImages", "tafsir"],
  "/mosque-finder": ["globalShell"],
  "/halal-places": ["globalShell"],
  "/tafsir": ["globalShell", "juzViewer", "quranImages", "tafsir"],
  "/search": ["globalShell", "juzViewer", "quranImages", "tafsir"],
  "/offline": ["globalShell", "juzViewer", "quranImages", "tafsir"],
  "/friday-sunan": ["globalShell"],
  "/ramadan": ["globalShell"],
  "/library": ["globalShell", "tafsir"],
  "/hajj-guide": ["globalShell"],
  "/prophet-stories": ["globalShell", "tafsir"],
  "/names-directory": ["globalShell"],
  "/daily-adhkar": ["globalShell"],
  "/khatma-jamaaiya": ["globalShell", "juzViewer", "quranImages"],
  "/hadith": ["globalShell", "tafsir"],
  "/seerah-timeline": ["globalShell", "tafsir"],
  "/islamic-quiz": ["globalShell"],
  "/inheritance-calculator": ["globalShell"],
  "/fasting-tracker": ["globalShell"],
  "/routine-builder": ["globalShell"],
  "/sadaqah-logger": ["globalShell"],
  "/dua-library": ["globalShell", "tafsir"],
  "/global-dhikr": ["globalShell"],
  "/privacy": ["globalShell"],
  "/moon-tracker": ["globalShell"],
  "/memorization": ["globalShell", "juzViewer", "quranImages", "tafsir"],
  "/leaderboard": ["globalShell"],
  "/athkar-circles": ["globalShell"],
  "/ramadan/virtues": ["globalShell", "tafsir"],
  "/ramadan/fasting-rules": ["globalShell", "tafsir"],
  "/ramadan/duas": ["globalShell", "tafsir"],
  "/ramadan/tips": ["globalShell", "tafsir"],
  "/ramadan/laylatul-qadr": ["globalShell", "tafsir"],
  "/ramadan/zakat-al-fitr": ["globalShell", "tafsir"],
  "/how-to-use": ["globalShell"],
  "/tajweed": ["globalShell", "tafsir"],
  "/embed/:siteId": ["globalShell", "quranImages"],
};

export interface BundleProgressCounts {
  downloaded: number;
  total: number;
  failed: number;
}

export interface BundleCompletionStatus extends BundleProgressCounts {
  key: OfflineBundleKey;
  pending: number;
  progressRatio: number;
  isComplete: boolean;
  hasFailures: boolean;
}

export const computeBundleCompletionStatus = (
  progress: Partial<Record<OfflineBundleKey, BundleProgressCounts>>,
): Record<OfflineBundleKey, BundleCompletionStatus> => {
  return (Object.keys(offlineBundles) as OfflineBundleKey[]).reduce(
    (accumulator, key) => {
      const counts = progress[key] ?? { downloaded: 0, total: 0, failed: 0 };
      const downloaded = Math.max(0, counts.downloaded);
      const total = Math.max(0, counts.total);
      const failed = Math.max(0, counts.failed);
      const pending = Math.max(total - downloaded - failed, 0);
      const completedAssets = Math.min(downloaded + failed, total);

      accumulator[key] = {
        key,
        downloaded,
        total,
        failed,
        pending,
        progressRatio: total === 0 ? 0 : completedAssets / total,
        isComplete: total > 0 && downloaded + failed >= total,
        hasFailures: failed > 0,
      };

      return accumulator;
    },
    {} as Record<OfflineBundleKey, BundleCompletionStatus>,
  );
};
