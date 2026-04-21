import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
    });

    const locationStr = lat !== undefined && lng !== undefined 
      ? `lat=${lat}, lng=${lng}` 
      : "my current location";

    const prompt = `Find ${query} near ${locationStr}. Please provide a list of places with their names and Google Maps links.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const places: Place[] = [];
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

    return Array.from(new Map(places.map(p => [p.url, p])).values());
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}
