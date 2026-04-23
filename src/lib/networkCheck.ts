export const checkNetworkReliability = async (): Promise<{ ok: boolean; reason?: string; details?: string }> => {
  try {
    // Try to fetch a small resource from the problematic API
    const res = await fetch("https://api.quran.g0v.id/v1/ayah/1:1", { 
      mode: 'cors', // Use cors to actually see if it succeeds
      cache: 'no-cache'
    });
    
    if (res.ok) return { ok: true };
    return { ok: false, reason: "api_error", details: `Status: ${res.status}` };
  } catch (err) {
    const errorMessage = (err instanceof Error ? err.message : String(err)).toLowerCase();
    
    // Check for common SSL/Network failure indicators
    if (errorMessage.includes("failed to fetch") || 
        errorMessage.includes("load failed") || 
        errorMessage.includes("networkerror")) {
      
      const year = new Date().getFullYear();
      if (year > 2030 || year < 2024) {
        return { ok: false, reason: "clock_error", details: `Year is ${year}. Please correct your device date/time.` };
      }
      
      return { ok: false, reason: "certificate_or_network", details: errorMessage };
    }
    
    return { ok: false, reason: "unknown", details: errorMessage };
  }
};
