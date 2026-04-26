const { data: analysis } = useWordAnalysis(surahNumber, ayahNumber, word, wordIndex);
const { data: tafsir } = useTafsir(analysis?.verseKey);
const { data: meaning } = useTranslation(
  analysis?.englishMeaning,
  analysis?.arabicMeaning
);