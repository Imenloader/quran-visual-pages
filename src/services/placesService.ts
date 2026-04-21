import { GoogleGenAI } from "@google/genai";

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    const config: { 
      tools: { googleMaps: Record<string, never> }[]; 
      toolConfig?: { 
        retrievalConfig: { 
          latLng: { latitude: number; longitude: number } 
        } 
      } 
    } = {
      tools: [{ googleMaps: {} }],
    };

    if (lat !== undefined && lng !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      };
    }

    const locationStr = lat !== undefined && lng !== undefined 
      ? `lat=${lat}, lng=${lng}` 
      : "my current location (please infer from IP or context if possible, or provide general famous ones)";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find ${query} near ${locationStr}. 
      Please provide a list of places with their names and descriptions.`,
      config,
    });

    const places: Place[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    // Map grounding chunks to places
    if (groundingChunks.length > 0) {
      groundingChunks.forEach((chunk: { maps?: { title?: string; uri?: string }; web?: { title?: string; uri?: string } }) => {
        if (chunk.maps) {
          places.push({
            name: chunk.maps.title || "Unknown Place",
            address: "", // Address might be in the text or snippets
            url: chunk.maps.uri,
            type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
          });
        } else if (chunk.web) {
          places.push({
            name: chunk.web.title || "Unknown Place",
            address: "",
            url: chunk.web.uri,
            type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
          });
        }
      });
    }

    // If we have text, we can try to enrich the places or find more
    const text = response.text || "";
    if (places.length === 0 && text) {
      // Fallback: try to parse text for names and links if grounding chunks are missing but text has info
      // Match markdown links: [Name](URL)
      const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = markdownLinkRegex.exec(text)) !== null) {
        places.push({
          name: match[1].trim(),
          address: "",
          url: match[2],
          type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
        });
      }

      if (places.length === 0) {
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
                url,
                type: query.includes("مسجد") ? "مسجد" : "مكان حلال"
              });
            }
          }
        });
      }
    }

    // Remove duplicates by URL
    const uniquePlaces = Array.from(new Map(places.map(p => [p.url, p])).values());

    if (uniquePlaces.length === 0) {
      console.log("No places found. Text response:", text);
      console.log("Grounding chunks:", groundingChunks);
    }

    return uniquePlaces;
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
}
