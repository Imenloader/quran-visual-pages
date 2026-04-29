

export interface Place {
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  url?: string;
  type?: string;
}

export async function searchPlaces(query: string, lat?: number, lng?: number): Promise<Place[]> {
  try {
    if (lat === undefined || lng === undefined) {
      return [{
        name: (query.includes("مسجد") || query.includes("مساجد")) ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
        address: "يرجى الضغط للانتقال إلى الخريطة مباشرة",
        url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        type: "fallback"
      }];
    }

    const isMosqueSearch = query.includes("مسجد") || query.includes("مساجد") || query.includes("mosque");
    const isHalalSearch = query.includes("حلال") || query.includes("halal");
    
    // 1. Try Overpass API first (Highest quality results for categorical search)
    try {
      const radius = 15000; // 15km
      let overpassQuery = "";
      
      if (isMosqueSearch) {
        overpassQuery = `[out:json][timeout:25];nwr(around:${radius},${lat},${lng})[amenity=place_of_worship][religion=muslim];out center;`;
      } else if (isHalalSearch) {
        overpassQuery = `[out:json][timeout:25];nwr(around:${radius},${lat},${lng})[cuisine=halal];nwr(around:${radius},${lat},${lng})["diet:halal"=yes];nwr(around:${radius},${lat},${lng})[shop=halal];out center;`;
      } else {
        overpassQuery = `[out:json][timeout:25];nwr(around:${radius},${lat},${lng})["name"~"${query}",i];out center;`;
      }

      // Try multiple endpoints in sequence
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
            if (data?.elements?.length > 0) break;
          }
        } catch (e) {
          console.warn(`Overpass endpoint ${endpoint} failed, trying next...`);
        }
      }

      if (data?.elements?.length > 0) {
        return data.elements.map((el: any) => {
          const tags = el.tags || {};
          const name = tags.name || tags.name_ar || tags.name_en || (isMosqueSearch ? "مسجد" : "مكان حلال");
          const address = tags["addr:street"] 
            ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}` 
            : "العنوان متاح على الخريطة";
          
          return {
            name,
            address,
            url: `https://www.google.com/maps/search/?api=1&query=${el.lat || el.center?.lat},${el.lon || el.center?.lon}`,
            type: isMosqueSearch ? "مسجد" : "مكان حلال",
            rating: tags.rating ? parseFloat(tags.rating) : undefined
          };
        }).slice(0, 20);
      }
    } catch (err) {
      console.error("Overpass API error, falling back to Nominatim:", err);
    }

    // 2. Fallback to Nominatim (More reliable but less precise tagging)
    const searchQuery = isMosqueSearch ? "mosque" : isHalalSearch ? "halal food" : query;
    const degreeOffset = 0.2; // roughly 22km
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${lng-degreeOffset},${lat+degreeOffset},${lng+degreeOffset},${lat-degreeOffset}&bounded=0&limit=20`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'QuraaniatApp/1.0', 'Accept-Language': 'ar' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data.map((el: any) => ({
          name: el.name || (isMosqueSearch ? "مسجد" : "مكان"),
          address: el.display_name || "العنوان متاح على الخريطة",
          url: `https://www.google.com/maps/search/?api=1&query=${el.lat},${el.lon}`,
          type: isMosqueSearch ? "مسجد" : "مكان حلال"
        }));
      }
    }

    // 3. Final Fallback to Google Maps Link
    return [{
      name: isMosqueSearch ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
      address: "يرجى الضغط للانتقال إلى الخريطة مباشرة",
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      type: "fallback"
    }];

  } catch (error) {
    console.error("Critical error in searchPlaces:", error);
    return [{
      name: "البحث في الخرائط",
      address: "الرجاء استخدام خرائط جوجل مباشرة",
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      type: "fallback"
    }];
  }
}
