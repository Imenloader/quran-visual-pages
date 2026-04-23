

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
    // If no location is provided, we can't reliably use Overpass API
    // Fallback to a generic Google Maps search link if we can't get coordinates
    if (lat === undefined || lng === undefined) {
      console.warn("Location not provided for searchPlaces, returning fallback link");
      // Return a single "Virtual" result that redirects to a broad maps search
      return [{
        name: query.includes("مسجد") ? "البحث في خرائط جوجل" : "البحث عن أماكن حلال",
        address: "يرجى الضغط للانتقال إلى الخريطة مباشرة",
        url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        type: "fallback"
      }];
    }

    const radius = 10000; // 10km radius
    let overpassQuery = "";

    if (query.includes("مسجد") || query.includes("mosque")) {
      overpassQuery = `[out:json];node(around:${radius},${lat},${lng})[amenity=place_of_worship][religion=muslim];out;`;
    } else if (query.includes("حلال") || query.includes("halal")) {
      overpassQuery = `[out:json];(node(around:${radius},${lat},${lng})["diet:halal"=yes];node(around:${radius},${lat},${lng})[cuisine=halal];node(around:${radius},${lat},${lng})[shop=halal];);out;`;
    } else {
      // Generic search fallback using text
      overpassQuery = `[out:json];node(around:${radius},${lat},${lng})["name"~"${query}",i];out;`;
    }

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    
    if (!response.ok) throw new Error("Overpass API failed");

    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) return [];

    return data.elements.map((el: any) => {
      const name = el.tags.name || el.tags.name_en || (query.includes("مسجد") ? "مسجد" : "مكان حلال");
      const address = el.tags["addr:street"] ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}` : "العنوان متاح على الخريطة";
      
      return {
        name,
        address,
        url: `https://www.google.com/maps/search/?api=1&query=${el.lat},${el.lon}`,
        type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
      };
    }).slice(0, 20); // Limit to top 20 results

  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}
