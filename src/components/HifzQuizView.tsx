import React, { useState, useEffect } from "react";
import { HifzQuestion, generatePageQuiz } from "@/lib/hifzGenerator";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, ArrowRight, Sparkles, Trophy, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import { toArabicNumber } from "@/data/quranData";

interface HifzQuizViewProps {
  pageNumber: number;
  onComplete: (score: number) => void;
  onClose: () => void;
}

const HifzQuizView: React.FC<HifzQuizViewProps> = ({ pageNumber, onComplete, onClose }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { saveResult } = useHifzMastery();

  const [difficulty, setDifficulty] = useState<"beginner" | "advanced">("beginner");
  const [questions, setQuestions] = useState<HifzQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startQuiz = async (diff: "beginner" | "advanced") => {
    setDifficulty(diff);
    setLoading(true);
    const generated = await generatePageQuiz(pageNumber, diff);
    setQuestions(generated);
    setLoading(false);
    setHasStarted(true);
  };

  const handleCheck = (answerOverride?: string) => {
    const current = questions[currentIndex];
    const actualAnswer = answerOverride || userAnswer;
    const cleanAnswer = current.answer.trim().toLowerCase();
    const cleanUser = actualAnswer.trim().toLowerCase();
    
    // Simple check (could be improved with normalization)
    const correct = cleanUser === cleanAnswer || 
                   (cleanAnswer.includes(cleanUser) && cleanUser.length > 2) ||
                   (cleanUser.includes(cleanAnswer) && cleanAnswer.length > 2);
    
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }
    if (answerOverride) setUserAnswer(answerOverride);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const finalScore = score + (isCorrect ? 1 : 0);
    const success = finalScore >= questions.length * 0.7; // 70% to count as success
    await saveResult(pageNumber, success);
    setQuizFinished(true);
  };

  if (!hasStarted) {
    return (
      <div className="p-8 text-center space-y-8">
        <div className="space-y-2">
          <GraduationCap className="w-12 h-12 text-accent mx-auto" />
          <h3 className="text-2xl font-bold font-serif">{isAr ? "اختبار حفظ الصفحة" : "Page Hifz Test"}</h3>
          <p className="text-muted-foreground text-sm">
            {isAr ? `صفحة رقم ${toArabicNumber(pageNumber)}` : `Page Number ${pageNumber}`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            variant="outline" 
            className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40"
            onClick={() => startQuiz("beginner")}
          >
            <span className="font-bold text-emerald-600">{isAr ? "مبتدئ / حفظ جديد" : "Beginner / New Hifz"}</span>
            <span className="text-[10px] text-muted-foreground">{isAr ? "خيارات متعددة وأسئلة سهلة" : "Multiple choice & easy questions"}</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-accent/20 hover:bg-accent/5 hover:border-accent/40"
            onClick={() => startQuiz("advanced")}
          >
            <span className="font-bold text-accent">{isAr ? "متقدم / مراجعة" : "Advanced / Review"}</span>
            <span className="text-[10px] text-muted-foreground">{isAr ? "كتابة يدوية وأسئلة دقيقة" : "Text input & detailed questions"}</span>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="font-serif text-sm">{isAr ? "جاري تجهيز الاختبار..." : "Preparing quiz..."}</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10 text-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-serif">{isAr ? "اكتمل الاختبار!" : "Quiz Completed!"}</h3>
          <p className="text-muted-foreground">
            {isAr ? `لقد أجبت على ${toArabicNumber(score)} من أصل ${toArabicNumber(questions.length)} أسئلة بشكل صحيح.` : `You answered ${score} out of ${questions.length} questions correctly.`}
          </p>
        </div>
        <Button onClick={onClose} className="w-full h-12 rounded-xl bg-primary">
          {isAr ? "العودة للمصحف" : "Back to Quran"}
        </Button>
      </motion.div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="p-6 space-y-8">
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
          {isAr ? `السؤال ${toArabicNumber(currentIndex + 1)} من ${toArabicNumber(questions.length)}` : `Question ${currentIndex + 1} of ${questions.length}`}
        </span>
        <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h4 className="text-xl font-bold font-serif text-center leading-relaxed">
            {current.question}
          </h4>

          <div className="space-y-4">
            {current.options ? (
              <div className="grid grid-cols-1 gap-2">
                {current.options.map((option, i) => (
                  <Button
                    key={i}
                    variant={isCorrect !== null && option === current.answer ? "default" : "outline"}
                    className={`h-14 rounded-2xl font-serif text-lg ${
                      isCorrect !== null 
                        ? option === current.answer 
                          ? "bg-emerald-500 text-white" 
                          : option === userAnswer 
                            ? "bg-rose-500 text-white" 
                            : ""
                        : "hover:border-accent hover:bg-accent/5"
                    }`}
                    onClick={() => isCorrect === null && handleCheck(option)}
                    disabled={isCorrect !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={isAr ? "اكتب الإجابة هنا..." : "Type answer here..."}
                className="h-14 text-center text-lg font-serif rounded-2xl border-2 focus-visible:ring-accent"
                dir={isAr ? "rtl" : "ltr"}
                onKeyDown={(e) => e.key === "Enter" && isCorrect === null && handleCheck()}
              />
            )}

            <div className="flex gap-2">
              {isCorrect === null ? (
                <>
                  {!current.options && (
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-xl"
                      onClick={() => setShowHint(!showHint)}
                    >
                      <HelpCircle className="w-4 h-4 ml-2" />
                      {isAr ? "تلميح" : "Hint"}
                    </Button>
                  )}
                  {!current.options && (
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent/90"
                      onClick={() => handleCheck()}
                      disabled={!userAnswer.trim()}
                    >
                      {isAr ? "تحقق" : "Check"}
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  className={`w-full h-12 rounded-xl ${isCorrect ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}`}
                  onClick={handleNext}
                >
                  {isAr ? "التالي" : "Next"}
                  {isAr ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showHint && current.hint && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-center text-xs text-muted-foreground bg-accent/5 p-3 rounded-xl border border-accent/10"
                >
                  {current.hint}
                </motion.p>
              )}
            </AnimatePresence>

            {isCorrect !== null && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl ${isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
              >
                {isCorrect ? <CheckCircle2 /> : <XCircle />}
                <span className="font-bold font-serif">
                  {isCorrect 
                    ? (isAr ? "إجابة صحيحة! أحسنت." : "Correct answer! Well done.") 
                    : (isAr ? `خطأ، الإجابة هي: ${current.answer}` : `Incorrect, the answer is: ${current.answer}`)}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HifzQuizView;
