import { fetchPageVerses } from "@/services/quranService";
import { normalizeArabic } from "./arabicUtils";
import { COMMON_ENDINGS, COMMON_STARTERS, CONFUSING_WORDS } from "./hifzDistractors";

export interface HifzQuestion {
  id: string;
  type: "positional" | "completion" | "transitional" | "statistical" | "mutashabihat" | "bridge" | "ending";
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  explanation?: string;
  verseKey?: string;
}

export const generatePageQuiz = async (pageNumber: number, difficulty: "beginner" | "advanced" = "beginner"): Promise<HifzQuestion[]> => {
  const ayahs = await fetchPageVerses(pageNumber);
  if (!ayahs || ayahs.length === 0) return [];

  // Fetch previous and next page for transitional questions
  let prevPageAyahs: any[] = [];
  let nextPageAyahs: any[] = [];
  
  if (pageNumber > 1) prevPageAyahs = await fetchPageVerses(pageNumber - 1);
  if (pageNumber < 604) nextPageAyahs = await fetchPageVerses(pageNumber + 1);

  const questions: HifzQuestion[] = [];

  // 1. Boundary: First word of the page
  const firstAyahText = ayahs[0].text;
  const words = firstAyahText.split(/\s+/).filter(w => w.length > 0);
  
  // Helper to skip signs/symbols (find first word with Arabic letters)
  const isRealWord = (w: string) => /[\u0600-\u06FF]/.test(w);
  const firstWordRaw = words.find(isRealWord) || words[0];
  
  // Clean decorative signs for display (e.g. remove Sajdah/Juz signs)
  const cleanWord = (w: any) => {
    if (!w || typeof w !== "string") return "";
    return w.replace(/[\u06DE\u06E9\u06D6-\u06ED]/g, "").trim();
  };
  
  const firstWord = cleanWord(firstWordRaw);
  
  questions.push({
    id: `pos-first-${pageNumber}`,
    type: "positional",
    question: "ما هي الكلمة التي تبدأ بها هذه الصفحة؟",
    answer: firstWord,
    options: difficulty === "beginner" ? shuffle([firstWord, "الحمد", "يا أيها", "إن الذين", "قل", "إذا", "سبح"].filter(w => w !== firstWord).slice(0, 3).concat(firstWord)) : undefined,
    hint: "انظر إلى بداية أول آية في الصفحة"
  });

  // 1b. Page Transition: From previous page
  if (prevPageAyahs.length > 0) {
    const lastAyahPrev = prevPageAyahs[prevPageAyahs.length - 1].text;
    const lastWordsPrev = lastAyahPrev.split(/\s+/).filter(w => w.length > 0).slice(-3).map(cleanWord).join(" ");
    
    questions.push({
      id: `transition-prev-${pageNumber}`,
      type: "bridge",
      question: `تنتهي الصفحة السابقة بـ: "... ${lastWordsPrev}". ما هي أول كلمة في هذه الصفحة؟`,
      answer: firstWord,
      hint: "الربط بين الصفحات من أساسيات الحفظ المتقن"
    });
  }

  // 2. Bridge Question: Transition between verses
  if (ayahs.length > 1) {
    const randomIdx = Math.floor(Math.random() * (ayahs.length - 1));
    const verseA = ayahs[randomIdx];
    const verseB = ayahs[randomIdx + 1];
    
    const wordsA = verseA.text.split(/\s+/).filter(w => w.length > 0);
    const wordsB = verseB.text.split(/\s+/).filter(w => w.length > 0);
    
    const endingA = wordsA.slice(-3).map(cleanWord).join(" ");
    const starterB = wordsB.slice(0, 3).map(cleanWord).join(" ");
    
    questions.push({
      id: `bridge-${pageNumber}-${randomIdx}`,
      type: "bridge",
      question: `تنتهي الآية بـ: "... ${endingA}". كيف تبدأ الآية التالية؟`,
      answer: starterB,
      options: difficulty === "beginner" ? shuffle([starterB, ...COMMON_STARTERS.filter(s => s !== starterB).slice(0, 3)]) : undefined,
      hint: "هذا اختبار للربط بين الآيات",
      explanation: "الربط بين رؤوس الآيات من أهم مهارات الحفظ."
    });
  }

  // 3. Ending Question: Mutashabihat focus
  const ayahsWithEndings = ayahs.filter(a => {
    const words = a.text.split(/\s+/).filter(w => w.length > 0).map(cleanWord);
    const ending = words.slice(-2).join(" ");
    return COMMON_ENDINGS.some(ce => ce.includes(ending) || CE_SIMILAR(ce, ending));
  });

  if (ayahsWithEndings.length > 0) {
    const verse = ayahsWithEndings[Math.floor(Math.random() * ayahsWithEndings.length)];
    const words = verse.text.split(/\s+/).filter(w => w.length > 0).map(cleanWord);
    const actualEnding = words.slice(-2).join(" ");
    const startOfVerse = words.slice(0, -2).join(" ");

    questions.push({
      id: `ending-${pageNumber}-${verse.verseKey}`,
      type: "ending",
      question: `أكمل ختام الآية: "${startOfVerse.split(" ").slice(-5).join(" ")} ..."`,
      answer: actualEnding,
      options: shuffle([
        actualEnding, 
        ...COMMON_ENDINGS.filter(ce => ce !== actualEnding && (ce.includes(actualEnding.split(" ").slice(-1)[0]) || actualEnding.includes(ce.split(" ").slice(-1)[0])))
          .slice(0, 3)
      ]),
      verseKey: verse.verseKey,
      explanation: "تنبيه: هذا الموضع من المتشابهات التي يكثر فيها الخطأ."
    });
  }

  // 5. Next Page Transition
  if (nextPageAyahs.length > 0) {
    const firstAyahNext = nextPageAyahs[0].text;
    const firstWordNextRaw = firstAyahNext.split(/\s+/).filter(isRealWord)[0] || firstAyahNext.split(/\s+/)[0];
    const firstWordNext = cleanWord(firstWordNextRaw);

    const lastAyahThis = ayahs[ayahs.length - 1].text;
    const lastWordsThis = lastAyahThis.split(/\s+/).filter(w => w.length > 0).slice(-3).map(cleanWord).join(" ");

    questions.push({
      id: `transition-next-${pageNumber}`,
      type: "bridge",
      question: `تنتهي هذه الصفحة بـ: "... ${lastWordsThis}". ما هي أول كلمة في الصفحة التالية؟`,
      answer: firstWordNext,
      hint: "حاول تذكر بداية الصفحة القادمة"
    });
  }

  // 4. Word Accuracy: Tiny words (إن/أن/قل/قالوا)
  const accuracyAyahs = ayahs.filter(a => Object.keys(CONFUSING_WORDS).some(word => a.text.includes(word)));
  if (accuracyAyahs.length > 0) {
    const verse = accuracyAyahs[Math.floor(Math.random() * accuracyAyahs.length)];
    const words = verse.text.split(/\s+/).filter(w => w.length > 0);
    
    // Find a confusing word in this verse
    let targetIdx = -1;
    let targetWord = "";
    for (let i = 0; i < words.length; i++) {
      if (CONFUSING_WORDS[words[i]]) {
        targetIdx = i;
        targetWord = words[i];
        break;
      }
    }

    if (targetIdx !== -1) {
      const partial = [...words];
      partial[targetIdx] = "__________";
      
      questions.push({
        id: `acc-${pageNumber}-${verse.verseKey}`,
        type: "mutashabihat",
        question: `اختر الكلمة الصحيحة: "... ${partial.slice(Math.max(0, targetIdx - 2), targetIdx + 3).join(" ")} ..."`,
        answer: targetWord,
        options: shuffle([targetWord, ...CONFUSING_WORDS[targetWord]]),
        verseKey: verse.verseKey,
        explanation: `دقة اللفظ تميز الحافظ المتقن. الكلمة الصحيحة هي ${targetWord}.`
      });
    }
  }

  // 5. Boundary: Last word
  if (difficulty === "advanced" || questions.length < 3) {
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

  return questions.slice(0, 5); // Return up to 5 varied questions
};

// Helper for finding similar endings even if not exact match (partial overlap)
function CE_SIMILAR(ce: string, ending: string): boolean {
  return ce.includes(ending) || ending.includes(ce);
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * Generates a comprehensive review quiz from multiple at-risk pages.
 */
export const generateSmartReviewQuiz = async (pageNumbers: number[], difficulty: "beginner" | "advanced" = "advanced"): Promise<HifzQuestion[]> => {
  let allQuestions: HifzQuestion[] = [];
  
  // Fetch up to 3 questions from each at-risk page
  for (const pageNum of pageNumbers.slice(0, 5)) {
    const pageQuestions = await generatePageQuiz(pageNum, difficulty);
    allQuestions = [...allQuestions, ...pageQuestions.slice(0, 3)];
  }

  return shuffle(allQuestions);
};
