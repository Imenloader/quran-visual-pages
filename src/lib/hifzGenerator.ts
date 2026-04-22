import { fetchPageVerses } from "@/services/quranService";
import { normalizeArabic } from "./arabicUtils";

export interface HifzQuestion {
  id: string;
  type: "positional" | "completion" | "transitional" | "statistical" | "mutashabihat";
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  verseKey?: string;
}

export const generatePageQuiz = async (pageNumber: number, difficulty: "beginner" | "advanced" = "beginner"): Promise<HifzQuestion[]> => {
  const ayahs = await fetchPageVerses(pageNumber);
  if (!ayahs || ayahs.length === 0) return [];

  const questions: HifzQuestion[] = [];

  // 1. Positional: First word of the page (Good for everyone)
  const firstAyahText = ayahs[0].text;
  const firstWord = firstAyahText.split(/\s+/)[0];
  
  if (difficulty === "beginner") {
    // MCQ for beginners
    questions.push({
      id: `pos-first-${pageNumber}`,
      type: "positional",
      question: "ما هي الكلمة التي تبدأ بها هذه الصفحة؟",
      answer: firstWord,
      options: shuffle([firstWord, "الحمد", "يا أيها", "إن الذين"]),
      hint: "انظر إلى بداية أول آية"
    });
  } else {
    questions.push({
      id: `pos-first-${pageNumber}`,
      type: "positional",
      question: "ما هي الكلمة الأولى في هذه الصفحة؟",
      answer: firstWord,
      hint: `تبدأ بحرف: ${firstWord[0]}`
    });
  }

  // 2. Completion: Verse Start (Good for newcomers)
  const randomIdx = Math.floor(Math.random() * ayahs.length);
  const verse = ayahs[randomIdx];
  const verseWords = verse.text.split(/\s+/).filter(w => w.length > 0);
  
  if (difficulty === "beginner" && verseWords.length > 3) {
    const start = verseWords.slice(0, 3).join(" ");
    const nextWord = verseWords[3];
    questions.push({
      id: `comp-start-${pageNumber}`,
      type: "completion",
      question: `ما هي الكلمة التالية بعد: "${start} ..."؟`,
      answer: nextWord,
      options: shuffle([nextWord, "الله", "الذين", "كذلك"]),
      verseKey: `${verse.surah.number}:${verse.numberInSurah}`
    });
  } else if (verseWords.length > 5) {
    // Fill in the blank for advanced
    const targetIdx = Math.floor(Math.random() * (verseWords.length - 3)) + 2;
    const missingWord = verseWords[targetIdx];
    const partialVerse = [...verseWords];
    partialVerse[targetIdx] = "..........";
    
    questions.push({
      id: `comp-${pageNumber}-${randomIdx}`,
      type: "completion",
      question: `أكمل الفراغ في الآية: "${partialVerse.slice(Math.max(0, targetIdx - 3), targetIdx + 4).join(" ")}"`,
      answer: missingWord,
      verseKey: `${verse.surah.number}:${verse.numberInSurah}`
    });
  }

  // 3. Positional: Last word (Advanced/Reviewer)
  if (difficulty === "advanced") {
    const lastAyahText = ayahs[ayahs.length - 1].text;
    const words = lastAyahText.split(/\s+/).filter(w => w.length > 0);
    const lastWord = words[words.length - 1];
    questions.push({
      id: `pos-last-${pageNumber}`,
      type: "positional",
      question: "ما هي الكلمة الأخيرة في هذه الصفحة؟",
      answer: lastWord,
      hint: `تنتهي بحرف: ${lastWord[lastWord.length - 1]}`
    });
  }

  // 4. Transitional: First verse of next page (Reviewer)
  if (pageNumber < 604) {
    const nextAyahs = await fetchPageVerses(pageNumber + 1);
    if (nextAyahs && nextAyahs.length > 0) {
      const nextFirstVerse = nextAyahs[0].text;
      const nextWords = nextFirstVerse.split(/\s+/).slice(0, 3).join(" ");
      questions.push({
        id: `trans-${pageNumber}`,
        type: "transitional",
        question: difficulty === "beginner" ? "كيف تبدأ الصفحة التالية؟" : "اذكر أول كلمات الصفحة التالية",
        answer: nextWords,
        options: difficulty === "beginner" ? shuffle([nextWords, "يا أيها الناس", "الم", "تبارك الذي"]) : undefined,
      });
    }
  }

  return questions;
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
