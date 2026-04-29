export interface Place {
  name: string;
  address: string;
  distance?: string;
  distanceRaw?: number;
  rating?: number;
  url?: string;
  type?: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} متر`;
  }
  return `${(meters / 1000).toFixed(1)} كم`;
}

export async function searchPlaces(query: string, lat?: number, lng?: number, categoryType?: 'mosque' | 'halal'): Promise<Place[]> {
  try {
    const isMosqueSearch = categoryType === 'mosque' || query.includes("مسجد") || query.includes("مساجد") || query.includes("mosque");
    const isHalalSearch = categoryType === 'halal' || query.includes("حلال") || query.includes("halal");
    
    // Always include a Google Maps integration card as the first item
    const googleMapsCard: Place = {
      name: isMosqueSearch ? "البحث المتقدم في خرائط جوجل" : "بحث في جوجل",
      address: "اضغط لفتح نتائج خرائط جوجل الرسمية مباشرة بدقة عالية",
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},15z`,
      type: "fallback"
    };

    if (lat === undefined || lng === undefined) {
      return [googleMapsCard];
    }

    const qLower = query.trim().toLowerCase();
    const genericMosqueQueries = ["مساجد", "مساجد قريبة", "مساجد قريبه", "مسجد", "mosque", "mosques"];
    const genericHalalQueries = ["حلال", "أماكن حلال", "اماكن حلال", "مطاعم حلال", "مطاعم حلال قريبة", "halal", "halal food"];
    const isGenericSearch = genericMosqueQueries.includes(qLower) || genericHalalQueries.includes(qLower) || qLower === "";

    let nominatimResults: Place[] = [];
    let overpassResults: Place[] = [];

    // Search function for Nominatim
    const searchNominatim = async () => {
      const searchQuery = query;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lng}&limit=15`;
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'QuraaniatApp/1.0', 'Accept-Language': 'ar' } });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return (data as {lat: string, lon: string, name: string, display_name: string}[]).map((el) => {
              const pLat = parseFloat(el.lat);
              const pLon = parseFloat(el.lon);
              const distanceRaw = calculateDistance(lat, lng, pLat, pLon);
              return {
                name: el.name || (isMosqueSearch ? "مسجد" : "مكان حلال"),
                address: el.display_name.split(',').slice(0, 3).join(','),
                url: `https://www.google.com/maps/search/?api=1&query=${pLat},${pLon}`,
                type: isMosqueSearch ? "مسجد" : "مكان حلال",
                distanceRaw,
                distance: formatDistance(distanceRaw)
              };
            });
          }
        }
      } catch (err) {
        console.warn("Nominatim search failed:", err);
      }
      return [];
    };

    // Search function for Overpass
    const searchOverpass = async () => {
      const radius = 10000; // 10km
      let overpassQuery = `[out:json][timeout:25];(`;

      if (isMosqueSearch) {
        overpassQuery += `nwr(around:${radius},${lat},${lng})[amenity=place_of_worship][religion=muslim];`;
        if (!isGenericSearch) {
          overpassQuery += `nwr(around:${radius},${lat},${lng})[amenity=place_of_worship]["name"~"${query}",i];`;
        }
      } else {
        overpassQuery += `nwr(around:${radius},${lat},${lng})[cuisine=halal];
          nwr(around:${radius},${lat},${lng})["diet:halal"=yes];
          nwr(around:${radius},${lat},${lng})[shop=halal];`;
        if (!isGenericSearch) {
          overpassQuery += `nwr(around:${radius},${lat},${lng})["name"~"${query}",i];`;
        }
      }
      overpassQuery += `);out center;`;

      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      let data: any = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'QuraaniatApp/1.0 (contact: support@quraan-visual.com)'
            },
            body: 'data=' + encodeURIComponent(overpassQuery)
          });
          if (response.ok) {
            data = await response.json();
            if (data && data.elements && data.elements.length > 0) break;
          }
        } catch (e) {
          console.warn(`Overpass endpoint ${endpoint} failed`);
        }
      }

      if (data && data.elements && data.elements.length > 0) {
        const uniquePlaces = new Map<string, Place>();
        
        data.elements.forEach((el: any) => {
          const tags = el.tags || {};
          const pLat: number = el.lat || el.center?.lat;
          const pLon: number = el.lon || el.center?.lon;
          
          let name = tags.name || tags["name:ar"] || tags["name:en"];
          const category = isMosqueSearch ? "مسجد" : "مكان حلال";
          
          if (!name || name.toLowerCase().includes("halal") || name.includes("مسجد")) {
            const subType = tags.cuisine || tags.amenity || tags.shop || "";
            name = name || `${category} ${subType ? `(${subType})` : ""}`;
          }
          
          const key = `${Math.round(pLat!*1000)},${Math.round(pLon!*1000)},${name}`;
          if (uniquePlaces.has(key)) return;

          const addressParts = [];
          if (tags["addr:street"]) addressParts.push(tags["addr:street"]);
          if (tags["addr:suburb"]) addressParts.push(tags["addr:suburb"]);
          if (tags["addr:city"]) addressParts.push(tags["addr:city"]);
          
          const address = addressParts.length > 0 ? addressParts.join(", ") : "العنوان متاح في الخريطة";
          const distanceRaw = calculateDistance(lat, lng, pLat!, pLon!);
          
          uniquePlaces.set(key, {
            name,
            address,
            url: `https://www.google.com/maps/search/?api=1&query=${pLat},${pLon}`,
            type: isMosqueSearch ? "مسجد" : "مكان حلال",
            distanceRaw,
            distance: formatDistance(distanceRaw)
          });
        });

        return Array.from(uniquePlaces.values());
      }
      return [];
    };

    if (!isGenericSearch) {
      nominatimResults = await searchNominatim();
      if (nominatimResults.length === 0) {
        overpassResults = await searchOverpass();
      }
    } else {
      overpassResults = await searchOverpass();
      if (overpassResults.length === 0) {
        nominatimResults = await searchNominatim();
      }
    }

    const combinedResults = [...nominatimResults, ...overpassResults];
    
    // Deduplicate by name and approximate location
    const uniqueMap = new Map<string, Place>();
    for (const place of combinedResults) {
        const key = place.name; // Keep it simple, or combine with distance
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, place);
        }
    }

    const finalResults = Array.from(uniqueMap.values())
        .sort((a, b) => (a.distanceRaw || Infinity) - (b.distanceRaw || Infinity))
        .slice(0, 20);

    return [googleMapsCard, ...finalResults];

  } catch (error) {
    console.error("Critical error:", error);
    return [{
      name: "خرائط جوجل",
      address: "افتح خرائط جوجل للبحث المباشر",
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      type: "fallback"
    }];
  }
}
