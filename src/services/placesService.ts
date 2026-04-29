

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
    const isMosqueSearch = query.includes("مسجد") || query.includes("مساجد") || query.includes("mosque");
    const isHalalSearch = query.includes("حلال") || query.includes("halal");
    
    // Always include a Google Maps integration card as the first item
    const googleMapsCard: Place = {
      name: isMosqueSearch ? "البحث المتقدم في خرائط جوجل" : "بحث أماكن حلال في جوجل",
      address: "اضغط لفتح نتائج خرائط جوجل الرسمية مباشرة بدقة عالية",
      url: `https://www.google.com/maps/search/${encodeURIComponent(isMosqueSearch ? "mosques" : "halal restaurants")}/@${lat},${lng},15z`,
      type: "fallback"
    };

    if (lat === undefined || lng === undefined) {
      return [googleMapsCard];
    }

    // 1. Try Overpass API (Aggressive broad search)
    try {
      const radius = 10000; // 10km
      const overpassQuery = `[out:json][timeout:25];
        (
          nwr(around:${radius},${lat},${lng})[amenity=place_of_worship][religion=muslim];
          nwr(around:${radius},${lat},${lng})[cuisine=halal];
          nwr(around:${radius},${lat},${lng})["diet:halal"=yes];
          nwr(around:${radius},${lat},${lng})[shop=halal];
          nwr(around:${radius},${lat},${lng})["name"~"mosque",i];
          nwr(around:${radius},${lat},${lng})["name"~"مسجد",i];
          nwr(around:${radius},${lat},${lng})["name"~"halal",i];
          nwr(around:${radius},${lat},${lng})["name"~"حلال",i];
        );
        out center;`;

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
          console.warn(`Overpass endpoint ${endpoint} failed`);
        }
      }

      if (data?.elements?.length > 0) {
        const uniquePlaces = new Map<string, Place>();
        
        data.elements.forEach((el: any) => {
          const tags = el.tags || {};
          const pLat = el.lat || el.center?.lat;
          const pLon = el.lon || el.center?.lon;
          
          let name = tags.name || tags["name:ar"] || tags["name:en"];
          const category = isMosqueSearch ? "مسجد" : "مكان حلال";
          
          // If name is generic or missing, add context
          if (!name || name.toLowerCase().includes("halal") || name.includes("مسجد")) {
            const subType = tags.cuisine || tags.amenity || tags.shop || "";
            name = name || `${category} ${subType ? `(${subType})` : ""}`;
          }
          
          const key = `${Math.round(pLat*1000)},${Math.round(pLon*1000)},${name}`;
          if (uniquePlaces.has(key)) return;

          const addressParts = [];
          if (tags["addr:street"]) addressParts.push(tags["addr:street"]);
          if (tags["addr:suburb"]) addressParts.push(tags["addr:suburb"]);
          if (tags["addr:city"]) addressParts.push(tags["addr:city"]);
          
          const address = addressParts.length > 0 ? addressParts.join(", ") : "العنوان متاح في الخريطة";
          
          uniquePlaces.set(key, {
            name,
            address,
            url: `https://www.google.com/maps/search/?api=1&query=${pLat},${pLon}`,
            type: isMosqueSearch ? "مسجد" : "مكان حلال"
          });
        });

        const results = Array.from(uniquePlaces.values()).slice(0, 20);
        return [googleMapsCard, ...results];
      }
    } catch (err) {
      console.error("Overpass API error:", err);
    }

    // 2. Nominatim Fallback
    const searchQuery = isMosqueSearch ? "mosque" : "halal food";
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lng}&limit=15`;
    
    const response = await fetch(url, { headers: { 'User-Agent': 'QuraaniatApp/1.0', 'Accept-Language': 'ar' } });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const results = data.map((el: any) => ({
          name: el.name || (isMosqueSearch ? "مسجد" : "مكان حلال"),
          address: el.display_name.split(',').slice(0, 3).join(','),
          url: `https://www.google.com/maps/search/?api=1&query=${el.lat},${el.lon}`,
          type: isMosqueSearch ? "مسجد" : "مكان حلال"
        }));
        return [googleMapsCard, ...results];
      }
    }

    return [googleMapsCard];

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

