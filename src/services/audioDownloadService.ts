import { toast } from "sonner";

const AUDIO_CACHE_NAME = 'quran-audio-cache';

export const audioDownloadService = {
  /**
   * Downloads and caches an audio file.
   */
  async downloadAudio(url: string, fileName: string): Promise<boolean> {
    if (!('caches' in window)) {
      toast.error("Audio caching is not supported in this browser.");
      return false;
    }

    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      await cache.put(url, response);
      toast.success(`Downloaded: ${fileName}`);
      return true;
    } catch (error) {
      console.error("Audio download failed:", error);
      toast.error(`Failed to download: ${fileName}`);
      return false;
    }
  },

  /**
   * Checks if an audio file is already cached.
   */
  async isCached(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  },

  /**
   * Removes an audio file from cache.
   */
  async deleteAudio(url: string): Promise<void> {
    if (!('caches' in window)) return;
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.delete(url);
  },

  /**
   * Clears all cached audio.
   */
  async clearAll(): Promise<void> {
    if (!('caches' in window)) return;
    await caches.delete(AUDIO_CACHE_NAME);
  }
};
