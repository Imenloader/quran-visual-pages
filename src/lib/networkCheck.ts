export const checkNetworkReliability = async (): Promise<{ ok: boolean; reason?: string }> => {
  try {
    const start = Date.now();
    const res = await fetch("https://api.alquran.cloud/v1/ayah/1:1", { mode: 'no-cors' });
    // no-cors fetch will still fail if there's a cert error or network is down
    return { ok: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "";
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network")) {
      return { ok: false, reason: "certificate_or_network" };
    }
    return { ok: false, reason: "unknown" };
  }
};
