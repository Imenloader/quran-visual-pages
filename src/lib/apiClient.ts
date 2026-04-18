
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
      // If a previous attempt failed with a potential certificate error, try HTTP
      if (i > 0 && lastError instanceof TypeError && (currentUrl.includes("alquran.cloud") || currentUrl.includes("quran.com"))) {
        currentUrl = currentUrl.replace("https://", "http://");
        console.warn(`Retrying with HTTP due to potential SSL issue: ${currentUrl}`);
      }

      const response = await fetch(currentUrl, { 
        signal: controller.signal
      });
      
      // Fallback for older browsers if AbortSignal.any is not available
      // In modern browsers we can use AbortSignal.any([signal, controller.signal])
      // For now, let's just use the controller.signal and check the parent signal manually
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          try {
            const errorData = await response.json();
            return errorData;
          } catch (e) {
            // Fall through
          }
        }
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(`API error: ${response.status}`);
      }
      
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
      
      if (signal?.aborted || (e instanceof Error && e.name === 'AbortError' && signal?.aborted)) {
        throw new Error("Request aborted");
      }

      // Don't retry on 404 or 429 as they are likely permanent or should be handled by user waiting
      if (e instanceof Error && (e.message.includes("404") || e.message.includes("Rate limit"))) {
        throw e;
      }
      
      if (i < retries) {
        // Wait before retrying (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
