const CACHE_PREFIX = "quran_api_cache_";
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Helper to safely encode strings for localStorage keys
function safeEncode(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    // Fallback if btoa fails
    return str.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
  }
}

export async function fetchWithCache(
  url: string, 
  options: { expiry?: number; retries?: number; signal?: AbortSignal; timeout?: number } = {}
) {
  const { 
    expiry = CACHE_EXPIRY, 
    retries = 2, 
    signal, 
    timeout = 15000 
  } = options;
  
  const cacheKey = CACHE_PREFIX + safeEncode(url);
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < expiry) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }

  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    if (signal?.aborted) {
      throw new Error("Request aborted");
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // If a parent signal is provided, abort our controller when the parent aborts
      if (signal) {
        if (signal.aborted) {
          controller.abort();
        } else {
          signal.addEventListener('abort', () => controller.abort(), { once: true });
        }
      }

      let currentUrl = url;
      let response;

      try {
        response = await fetch(currentUrl, { 
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (fetchError) {
        // SSL/Network Fallback for Quran APIs
        if (url.includes("api.quran.com") || url.includes("api.qurancdn.com") || url.includes("mp3quran.net")) {
          console.warn("Primary API call failed, trying mirror or proxy...", fetchError);
          
          if (url.includes("api.quran.com") || url.includes("api.qurancdn.com")) {
            const isMain = url.includes("api.quran.com");
            const mirrorUrl = isMain 
              ? url.replace("api.quran.com", "api.qurancdn.com")
              : url.replace("api.qurancdn.com", "api.quran.com");

            // Try mirror first (it's faster than proxy)
            try {
              console.log(`Trying mirror fallback: ${mirrorUrl}`);
              const mirrorResponse = await fetch(mirrorUrl, { signal: controller.signal });
              if (mirrorResponse.ok) {
                return await mirrorResponse.json();
              }
            } catch (mirrorError) {
              console.warn("Mirror fallback failed, trying proxies...", mirrorError);
            }
          }

          // 1. Try AllOrigins first (very reliable)
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const proxyResponse = await fetch(proxyUrl, { signal: controller.signal });
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json();
              return typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
            }
          } catch (proxyError) {
            console.warn("AllOrigins proxy failed, trying CorsProxy.io...", proxyError);
            
            // 2. Try corsproxy.io
            try {
              const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
              const proxyResponse = await fetch(proxyUrl, { signal: controller.signal });
              if (proxyResponse.ok) {
                return await proxyResponse.json();
              }
            } catch (secondaryProxyError) {
              console.warn("CorsProxy.io failed, trying ThingProxy...", secondaryProxyError);

              // 3. Try ThingProxy
              try {
                const proxyUrl = `https://thingproxy.freeboard.io/fetch/${url}`;
                const proxyResponse = await fetch(proxyUrl, { signal: controller.signal });
                if (proxyResponse.ok) {
                   return await proxyResponse.json();
                }
              } catch (tertiaryProxyError) {
                 console.error("All fallbacks and proxies failed", tertiaryProxyError);
              }
            }
          }
          
          throw fetchError;
        } else {
          throw fetchError;
        }
      }
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        // LocalStorage might be full, clear old items
        if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          try {
            // Simple cleanup: remove all items with our prefix
            const keysToRemove = [];
            for (let j = 0; j < localStorage.length; j++) {
              const key = localStorage.key(j);
              if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          } catch (cleanupError) {
            console.error("Failed to cleanup localStorage", cleanupError);
          }
        }
        console.warn("Failed to cache API response", e);
      }
      
      return data;
    } catch (e) {
      lastError = e;
      
      const errorMessage = e instanceof Error ? e.message : String(e);
      const isFetchError = errorMessage.toLowerCase().includes("failed to fetch") || 
                          errorMessage.toLowerCase().includes("load failed") ||
                          errorMessage.toLowerCase().includes("network error");

      if (signal?.aborted || (e instanceof Error && e.name === 'AbortError' && signal?.aborted)) {
        throw new Error("Request aborted");
      }

      // Check for potential SSL/Clock issues if fetch fails
      if (isFetchError) {
        const year = new Date().getFullYear();
        if (year > 2030 || year < 2024) {
          console.error("Fetch failed, possibly due to incorrect system clock (Year: " + year + ")");
          // We don't throw a new error here to allow retries, 
          // but we log it for diagnostics
        }
      }

      // Don't retry on 404 or 429
      if (e instanceof Error && (e.message.includes("404") || e.message.includes("Rate limit"))) {
        throw e;
      }
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
