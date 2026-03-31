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
      contents: `Find ${query} near the following location: lat=${lat}, lng=${lng}. 
      Return the results as a JSON array of objects with the following properties: 
      name, address, rating (number), type. 
      Also include the Google Maps URL if available from the grounding metadata.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    // Extract grounding chunks for URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsUrls = groundingChunks
      .filter(chunk => chunk.maps?.uri)
      .map(chunk => ({ uri: chunk.maps?.uri, title: chunk.maps?.title }));

    // The model might return a list of places in the text. 
    // Since we can't use responseSchema with googleMaps, we'll try to parse the text or just use the grounding metadata if possible.
    // However, the grounding metadata usually contains the links.
    
    // Let's try to extract structured data from the response text if it's JSON-like, 
    // or just parse the grounding chunks.
    
    const places: Place[] = [];
    
    if (groundingChunks.length > 0) {
      groundingChunks.forEach(chunk => {
        if (chunk.maps) {
          places.push({
            name: chunk.maps.title || "Unknown Place",
            address: "", // Grounding chunks might not have full address directly in the same way
            url: chunk.maps.uri,
            type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
          });
        }
      });
    }

    // If no grounding chunks, try parsing the text (fallback)
    if (places.length === 0) {
      const text = response.text || "";
      // Simple regex to find names and URLs if any
      const lines = text.split("\n");
      lines.forEach(line => {
        if (line.includes("http")) {
          const match = line.match(/(.*?)[:-]\s*(https?:\/\/\S+)/);
          if (match) {
            places.push({
              name: match[1].trim(),
              address: "",
              url: match[2].trim()
            });
          }
        }
      });
    }

    return places;
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}
