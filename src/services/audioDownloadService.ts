import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

const AUDIO_CACHE_NAME = 'quran-audio-cache';
const AUDIO_DIR = 'quran_audio';

// Helper to generate a safe filename from a URL
const getSafeFileName = (url: string) => {
  // Simple hash or base64 to ensure unique and safe filenames
  return btoa(url).replace(/[/+=]/g, '_') + '.mp3';
};

export const audioDownloadService = {
  /**
   * Initialize the native directory if it doesn't exist
   */
  async initNativeCache() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Filesystem.mkdir({
        path: AUDIO_DIR,
        directory: Directory.Data,
        recursive: true
      });
    } catch (e) {
      // Directory might already exist, which is fine
    }
  },

  /**
   * Downloads and caches an audio file.
   */
  async downloadAudio(url: string, fileName: string): Promise<boolean> {
    const isAr = document.documentElement.lang === 'ar' || window.location.pathname.includes('/ar');
    
    // Check if already cached
    const cached = await this.isCached(url);
    if (cached) {
      toast.info(`${fileName} ${isAr ? 'موجود بالفعل في الذاكرة' : 'is already cached'}`);
      return true;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await this.initNativeCache();
        const safeName = getSafeFileName(url);
        
        // Use native fetch to get blob and write to filesystem
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        
        // Convert blob to base64 for Capacitor Filesystem
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            // Extract the base64 string without the data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        await Filesystem.writeFile({
          path: `${AUDIO_DIR}/${safeName}`,
          data: base64Data,
          directory: Directory.Data
        });
      } else {
        if (!('caches' in window)) {
          toast.error("Audio caching is not supported in this browser.");
          return false;
        }
        
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        await cache.put(url, response);
        
        // Ensure persistence is requested for Web
        if (navigator.storage && navigator.storage.persist) {
          await navigator.storage.persist();
        }
      }

      toast.success(`${isAr ? 'تم التحميل:' : 'Downloaded:'} ${fileName}`);
      return true;
    } catch (error) {
      console.error("Audio download failed:", error);
      toast.error(`${isAr ? 'فشل التحميل:' : 'Failed to download:'} ${fileName}`);
      return false;
    }
  },

  /**
   * Checks if an audio file is already cached.
   */
  async isCached(url: string): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const safeName = getSafeFileName(url);
        await Filesystem.stat({
          path: `${AUDIO_DIR}/${safeName}`,
          directory: Directory.Data
        });
        return true;
      } else {
        if (!('caches' in window)) return false;
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await cache.match(url);
        return !!response;
      }
    } catch {
      return false; // stat throws if file doesn't exist
    }
  },

  /**
   * Returns a local URL for the audio if cached, otherwise returns the original URL.
   * Useful for feeding into <audio src={url}> in Native where SW doesn't intercept.
   */
  async getAudioUrl(url: string): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      const isDownloaded = await this.isCached(url);
      if (isDownloaded) {
        const safeName = getSafeFileName(url);
        const { uri } = await Filesystem.getUri({
          path: `${AUDIO_DIR}/${safeName}`,
          directory: Directory.Data
        });
        return Capacitor.convertFileSrc(uri);
      }
    }
    // Web relies on Service Worker to intercept the original URL, so just return it
    return url;
  },

  /**
   * Removes an audio file from cache.
   */
  async deleteAudio(url: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const safeName = getSafeFileName(url);
        await Filesystem.deleteFile({
          path: `${AUDIO_DIR}/${safeName}`,
          directory: Directory.Data
        });
      } catch (e) {
        console.warn("Failed to delete native audio file", e);
      }
    } else {
      if (!('caches' in window)) return;
      const cache = await caches.open(AUDIO_CACHE_NAME);
      await cache.delete(url);
    }
  },

  /**
   * Clears all cached audio.
   */
  async clearAll(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.rmdir({
          path: AUDIO_DIR,
          directory: Directory.Data,
          recursive: true
        });
        // Recreate empty dir
        await this.initNativeCache();
      } catch (e) {
        console.warn("Failed to clear native audio directory", e);
      }
    } else {
      if (!('caches' in window)) return;
      await caches.delete(AUDIO_CACHE_NAME);
    }
  }
};
