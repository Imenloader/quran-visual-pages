import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";

type TajweedRule = "Idgham" | "Ikhfa" | "Qalqalah" | "Idhar" | "Iqlab";

interface Question {
  id: number;
  text: string;
  highlight: string;
  correctRule: TajweedRule;
  explanationAr: string;
  explanationEn: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "مِن بَعْدِ",
    highlight: "ن ب",
    correctRule: "Iqlab",
    explanationAr: "تقلب النون الساكنة ميماً مخفاة بغنة عند حرف الباء.",
    explanationEn: "The silent Nun turns into a hidden Mim with Ghunnah when followed by Ba.",
  },
  {
    id: 2,
    text: "مَن يَقُولُ",
    highlight: "ن ي",
    correctRule: "Idgham",
    explanationAr: "إدغام بغنة لأن النون الساكنة جاء بعدها حرف الياء.",
    explanationEn: "Idgham with Ghunnah because the silent Nun is followed by Ya.",
  },
  {
    id: 3,
    text: "مِن قَبْلُ",
    highlight: "ن ق",
    correctRule: "Ikhfa",
    explanationAr: "إخفاء حقيقي لأن النون الساكنة جاء بعدها حرف القاف.",
    explanationEn: "True Ikhfa because the silent Nun is followed by Qaf.",
  },
  {
    id: 4,
    text: "أَحَدٌ",
    highlight: "دٌ (عند الوقف)",
    correctRule: "Qalqalah",
    explanationAr: "قلقلة لأن الدال من حروف القلقلة (قطب جد) وجاءت ساكنة عند الوقف.",
    explanationEn: "Qalqalah because Dal is a Qalqalah letter (Qutb Jad) and is silent at a stop.",
  },
  {
    id: 5,
    text: "مِنْ عِلْمٍ",
    highlight: "نْ ع",
    correctRule: "Idhar",
    explanationAr: "إظهار حلقي لأن النون الساكنة جاء بعدها حرف العين (من حروف الحلق).",
    explanationEn: "Idhar Halqi because the silent Nun is followed by Ayn (a throat letter).",
  },
];

const rules: { id: TajweedRule; labelAr: string; labelEn: string }[] = [
  { id: "Idgham", labelAr: "إدغام (Idgham)", labelEn: "Idgham" },
  { id: "Ikhfa", labelAr: "إخفاء (Ikhfa)", labelEn: "Ikhfa" },
  { id: "Qalqalah", labelAr: "قلقلة (Qalqalah)", labelEn: "Qalqalah" },
  { id: "Idhar", labelAr: "إظهار (Idhar)", labelEn: "Idhar" },
  { id: "Iqlab", labelAr: "إقلاب (Iqlab)", labelEn: "Iqlab" },
];

export default function TajweedGames() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<TajweedRule | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const question = questions[currentQuestionIndex];

  const handleAnswer = (ruleId: TajweedRule) => {
    if (showExplanation) return; // Prevent multiple clicks
    setSelectedAnswer(ruleId);
    setShowExplanation(true);
    if (ruleId === question.correctRule) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((c) => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsGameOver(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader title={isAr ? "ألعاب التجويد" : "Tajweed Games"} variant="compact" showBack />
      
      <main className="container max-w-2xl mx-auto px-4 mt-8">
        <ScrollReveal>
          <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-islamic text-center relative overflow-hidden">
            <div className="absolute inset-0 pattern-islamic opacity-5" />
            
            {!isGameOver ? (
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {isAr ? `السؤال ${currentQuestionIndex + 1} من ${questions.length}` : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                  </span>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-primary font-bold">
                    <Trophy size={16} />
                    <span>{score}</span>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg md:text-xl font-naskh text-foreground/70 mb-4">
                    {isAr ? "ما هو حكم التجويد في:" : "What is the Tajweed rule in:"}
                  </h3>
                  <div className="text-4xl md:text-6xl font-quran text-foreground leading-loose py-4 bg-muted/30 rounded-3xl border border-border/50">
                    {question.text}
                  </div>
                  <p className="text-sm text-primary font-bold mt-4 font-naskh">
                    ({isAr ? "التركيز على:" : "Focus on:"} <span className="text-accent">{question.highlight}</span>)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {rules.map((rule) => {
                    const isSelected = selectedAnswer === rule.id;
                    const isCorrect = showExplanation && rule.id === question.correctRule;
                    const isWrong = showExplanation && isSelected && rule.id !== question.correctRule;

                    let btnClass = "bg-muted/50 text-foreground hover:bg-muted";
                    if (isCorrect) btnClass = "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400";
                    else if (isWrong) btnClass = "bg-destructive text-white shadow-lg shadow-destructive/20 border-destructive";
                    else if (showExplanation) btnClass = "opacity-50 pointer-events-none bg-muted/20 text-muted-foreground";

                    return (
                      <button
                        key={rule.id}
                        onClick={() => handleAnswer(rule.id)}
                        disabled={showExplanation}
                        className={`p-4 rounded-2xl font-naskh text-lg font-bold border border-transparent transition-all active:scale-95 flex items-center justify-center gap-2 ${btnClass}`}
                      >
                        {isCorrect && <CheckCircle2 size={20} />}
                        {isWrong && <XCircle size={20} />}
                        {isAr ? rule.labelAr : rule.labelEn}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
                      <p className="font-naskh text-foreground font-bold">
                        {isAr ? question.explanationAr : question.explanationEn}
                      </p>
                    </div>
                    <button
                      onClick={nextQuestion}
                      className="w-full md:w-auto mx-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      {isAr ? "التالي" : "Next"} <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 py-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-6">
                  <Trophy size={48} className="text-gold" />
                </div>
                <h2 className="text-3xl font-bold font-naskh text-foreground mb-4">
                  {isAr ? "اكتمل الاختبار!" : "Quiz Complete!"}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {isAr ? `لقد أجبت بشكل صحيح على ${score} من ${questions.length}` : `You scored ${score} out of ${questions.length}`}
                </p>
                <button
                  onClick={restartGame}
                  className="px-8 py-3 bg-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-colors"
                >
                  <RotateCcw size={18} />
                  {isAr ? "إعادة المحاولة" : "Try Again"}
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
