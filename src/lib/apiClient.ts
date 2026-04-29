import { openDB } from 'idb';

const CACHE_PREFIX = "quran_api_cache_";
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Circuit Breaker setup per origin/endpoint
const MAX_FAILURES = 5;
const RESET_TIMEOUT = 30000; // 30 seconds
const circuitBreakers = new Map<string, { failureCount: number, nextAttempt: number }>();

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

// IndexedDB Setup
const dbPromise = openDB('quran-api-cache-db', 1, {
  upgrade(db) {
    db.createObjectStore('api-cache');
  },
});

// Helper to safely encode strings for cache keys
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
  
  // Try reading from IndexedDB first
  try {
    const db = await dbPromise;
    const cached = await db.get('api-cache', cacheKey);
    if (cached) {
      if (Date.now() - cached.timestamp < expiry) {
        return cached.data;
      }
    }
  } catch (e) {
    console.warn("IndexedDB Cache read error", e);
  }

  const origin = getOrigin(url);
  let breaker = circuitBreakers.get(origin) || { failureCount: 0, nextAttempt: 0 };

  // Circuit Breaker check
  if (breaker.failureCount >= MAX_FAILURES && Date.now() < breaker.nextAttempt) {
    console.warn(`Circuit breaker open for ${origin}, aborting request to:`, url);
    throw new Error(`Circuit breaker is open for ${origin} due to repeated failures`);
  } else if (breaker.failureCount >= MAX_FAILURES && Date.now() >= breaker.nextAttempt) {
    // Half-open state
    breaker.failureCount = MAX_FAILURES - 1;
    circuitBreakers.set(origin, breaker);
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
        if (url.includes("api.quran.com") || url.includes("api.qurancdn.com")) {
          console.warn("Primary API call failed, trying mirror or proxy...", fetchError);
          
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

          // Using allorigins as a proxy fallback
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const proxyResponse = await fetch(proxyUrl, { signal: controller.signal });
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json();
              return typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
            }
          } catch (proxyError) {
            console.error("All fallbacks and proxies failed", proxyError);
          }
          
          throw fetchError;
        } else {
          throw fetchError;
        }
      }
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      // Request succeeded, reset circuit breaker
      breaker.failureCount = 0;
      breaker.nextAttempt = 0;
      circuitBreakers.set(origin, breaker);

      // Save to IndexedDB
      try {
        const db = await dbPromise;
        await db.put('api-cache', { data, timestamp: Date.now() }, cacheKey);
      } catch (e) {
        console.warn("Failed to cache API response in IndexedDB", e);
      }
      
      return data;
    } catch (e) {
      lastError = e;
      
      // Update circuit breaker state
      breaker.failureCount++;
      if (breaker.failureCount >= MAX_FAILURES) {
        breaker.nextAttempt = Date.now() + RESET_TIMEOUT;
      }
      circuitBreakers.set(origin, breaker);

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
