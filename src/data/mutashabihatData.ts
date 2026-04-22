export interface MutashabihQuestion {
  pageNumber: number;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  optionsAr?: string[];
  optionsEn?: string[];
}

export const mutashabihatData: MutashabihQuestion[] = [
  {
    pageNumber: 2,
    questionAr: "كم مرة وردت كلمة 'الْمُفْلِحُونَ' في هذه الصفحة؟",
    questionEn: "How many times does the word 'Al-Muflihun' appear on this page?",
    answerAr: "مرتين",
    answerEn: "Twice",
    optionsAr: ["مرة واحدة", "مرتين", "ثلاث مرات"],
    optionsEn: ["Once", "Twice", "Three times"]
  },
  {
    pageNumber: 3,
    questionAr: "في أي آية ذكرت صفة 'الْغَاوِينَ' في هذه الصفحة؟",
    questionEn: "In which verse is the attribute 'Al-Ghawin' mentioned on this page?",
    answerAr: "لا توجد في هذه الصفحة (خداع)",
    answerEn: "It is not on this page (trick)",
    optionsAr: ["الآية 15", "الآية 20", "لا توجد"],
    optionsEn: ["Verse 15", "Verse 20", "Does not exist"]
  }
];
