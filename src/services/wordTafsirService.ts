interface WordTafsir {
  root?: string;
  meaning?: string;
  notes?: string;
}

const wordTafsirDB: Record<string, WordTafsir> = {
  "عظيم": {
    root: "ع ظ م",
    meaning: "عظيم في ذاته وصفاته، يدل على الكمال والجلال",
    notes: "يستخدم لوصف الله تعالى بالكمال المطلق"
  },
  "رب": {
    root: "ر ب ب",
    meaning: "المالك، المدبر، المربي لجميع الخلق"
  }
};

export const getWordTafsir = (word: string): WordTafsir | null => {
  return wordTafsirDB[word] || null;
};