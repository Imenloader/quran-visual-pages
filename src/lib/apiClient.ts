
const CACHE_PREFIX = "quran_api_cache_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchWithCache(url: string, expiry = CACHE_EXPIRY) {
  const cacheKey = CACHE_PREFIX + btoa(url);
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < expiry) {
        return data;
      }
    } catch (e) {
      console.error("Cache parse error", e);
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
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
    // LocalStorage might be full
    console.warn("Failed to cache API response", e);
  }
  
  return data;
}
