

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
      console.warn("Location not provided for searchPlaces, returning fallback link");
      return [{
        name: query.includes("مسجد") ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
        address: "يرجى الضغط للانتقال إلى الخريطة مباشرة",
        url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        type: "fallback"
      }];
    }

    // Use Nominatim as Overpass API frequently blocks requests with 406 Not Acceptable
    // Create a ~10km bounding box around the user
    const degreeOffset = 0.1; // roughly 11km
    const left = lng - degreeOffset;
    const right = lng + degreeOffset;
    const top = lat + degreeOffset;
    const bottom = lat - degreeOffset;
    
    // For mosques, use more specific query terms
    const searchQuery = query.includes("مسجد") ? "مسجد" : query.includes("حلال") ? "halal restaurant" : query;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=20`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'QuraaniatApp/1.0',
        'Accept-Language': 'ar'
      }
    });
    
    if (!response.ok) throw new Error("Nominatim API failed");

    const data = await response.json();
    
    if (!data || data.length === 0) {
      // Fallback to Google Maps if no results found
      return [{
        name: query.includes("مسجد") ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
        address: "يرجى الضغط للانتقال إلى الخريطة مباشرة",
        url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        type: "fallback"
      }];
    }

    return data.map((el: any) => {
      const name = el.name || (query.includes("مسجد") ? "مسجد" : "مكان");
      const address = el.display_name || "العنوان متاح على الخريطة";
      
      return {
        name,
        address,
        url: `https://www.google.com/maps/search/?api=1&query=${el.lat},${el.lon}`,
        type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
      };
    });

  } catch (error) {
    console.error("Error searching places:", error);
    return [{
      name: query.includes("مسجد") ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
      address: "الرجاء استخدام خرائط جوجل مباشرة",
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      type: "fallback"
    }];
  }
}
