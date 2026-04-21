import { GoogleGenerativeAI } from "@google/generative-ai";

// Support both common ways of environment variables in Vite/React apps
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AdvisorResponse {
  message: string;
  suggestedDuas?: string[];
  relevantVerses?: string[];
}

export async function getSpiritualAdvice(
  mood: string, 
  query?: string, 
  language: string = 'ar'
): Promise<AdvisorResponse> {
  if (!API_KEY) {
    throw new Error("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
    });

    const systemInstruction = language === 'ar' 
      ? "أنت مستشار روحاني إسلامي ذكي ورحيم. هدفك هو تقديم الدعم الروحاني بناءً على القرآن والسنة. استخدم لغة لطيفة ومطمئنة. قدم نصائح عملية وأدعية وآيات قرآنية مناسبة لحالة المستخدم."
      : "You are an intelligent and compassionate Islamic spiritual advisor. Your goal is to provide spiritual support based on the Quran and Sunnah. Use gentle and reassuring language. Provide practical advice, Duas, and Quranic verses relevant to the user's state.";

    const prompt = language === 'ar'
      ? `${systemInstruction}\n\nالمستخدم يشعر بـ: ${mood}. ${query ? `سؤاله هو: ${query}` : ""}. يرجى تقديم نصيحة روحانية قصيرة وجميلة، مع ذكر آية قرآنية واحدة ودعاء واحد على الأقل.`
      : `${systemInstruction}\n\nUser is feeling: ${mood}. ${query ? `Their query: ${query}` : ""}. Please provide short and beautiful spiritual advice, mentioning at least one Quranic verse and one Dua.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      message: text,
    };
  } catch (error) {
    console.error("Error getting spiritual advice:", error);
    throw error;
  }
}
