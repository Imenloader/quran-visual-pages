import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find ${query} near the following location: lat=${lat || "unknown"}, lng=${lng || "unknown"}. 
      Please provide a list of places with their names and descriptions.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    const places: Place[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const searchQueries = groundingMetadata?.searchQueries || [];

    // Map grounding chunks to places
    if (groundingChunks.length > 0) {
      groundingChunks.forEach((chunk) => {
        if (chunk.maps) {
          places.push({
            name: chunk.maps.title || "Unknown Place",
            address: "", // Address might be in the text or snippets
            url: chunk.maps.uri,
            type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
          });
        }
      });
    }

    // If we have text, we can try to enrich the places or find more
    const text = response.text || "";
    if (places.length === 0 && text) {
      // Fallback: try to parse text for names and links if grounding chunks are missing but text has info
      const lines = text.split("\n");
      lines.forEach(line => {
        const urlMatch = line.match(/https?:\/\/[\w\-.]+\.\w+\/\S+/);
        if (urlMatch) {
          const url = urlMatch[0];
          const name = line.replace(url, "").replace(/^[*\-\s]+/, "").replace(/[:-]\s*$/, "").trim();
          if (name) {
            places.push({
              name,
              address: "",
              url
            });
          }
        }
      });
    }

    // Remove duplicates by URL
    const uniquePlaces = Array.from(new Map(places.map(p => [p.url, p])).values());

    return uniquePlaces;
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}
