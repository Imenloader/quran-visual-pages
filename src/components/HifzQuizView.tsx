import React, { useState, useEffect } from "react";
import { HifzQuestion, generatePageQuiz, generateSmartReviewQuiz } from "@/lib/hifzGenerator";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, ArrowRight, Sparkles, Trophy, Loader2, GraduationCap, Volume2, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import { toArabicNumber } from "@/data/quranData";
import { normalizeArabic, areArabicWordsSimilar } from "@/lib/arabicUtils";
import { getVerseAudioUrl } from "@/services/quranService";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import HifzMasteryMap from "./HifzMasteryMap";

interface HifzQuizViewProps {
  pageNumber?: number;
  isSmartReview?: boolean;
  atRiskPages?: number[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const HifzQuizView: React.FC<HifzQuizViewProps> = ({ pageNumber, isSmartReview, atRiskPages, onComplete, onClose }) => {
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioTimeoutRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  const playVerseAudio = async (verseKey: string, duration?: number) => {
    if (!verseKey) return;
    
    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }

    setIsPlayingAudio(true);
    const audio = new Audio(getVerseAudioUrl(verseKey));
    audioRef.current = audio;
    
    audio.play().catch(e => console.warn("Audio play failed:", e));
    
    if (duration) {
      audioTimeoutRef.current = setTimeout(() => {
        audio.pause();
        setIsPlayingAudio(false);
        audioTimeoutRef.current = null;
      }, duration);
    } else {
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };
    }
  };

  const startQuiz = async (diff: "beginner" | "advanced") => {
    setDifficulty(diff);
    setLoading(true);
    try {
      let generated: HifzQuestion[] = [];
      
      if (isSmartReview && atRiskPages && atRiskPages.length > 0) {
        generated = await generateSmartReviewQuiz(atRiskPages, diff);
      } else if (pageNumber) {
        generated = await generatePageQuiz(pageNumber, diff);
      } else {
        toast.error(isAr ? "رقم الصفحة غير صالح" : "Invalid page number");
        setLoading(false);
        return;
      }
      
      if (!generated || generated.length === 0) {
        toast.error(isAr ? "لم نتمكن من إنشاء أسئلة حالياً" : "Could not generate questions at this time");
        setLoading(false);
        return;
      }
      
      setQuestions(generated);
      setLoading(false);
      setHasStarted(true);
    } catch (error) {
      console.error("Quiz generation error:", error);
      setLoading(false);
      toast.error(isAr ? "تعذر إنشاء الاختبار. يرجى التحقق من الاتصال." : "Could not generate quiz. Please check connection.");
    }
  };

  const handleCheck = (answerOverride?: string) => {
    const current = questions[currentIndex];
    const actualAnswer = answerOverride || userAnswer;
    const correct = areArabicWordsSimilar(actualAnswer, current.answer);
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Success });
      }
      // Play audio on success if available
      if (questions[currentIndex].verseKey) {
        playVerseAudio(questions[currentIndex].verseKey);
      }
    } else {
      if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Error });
      }
    }
    if (answerOverride) setUserAnswer(answerOverride);
    else setUserAnswer(actualAnswer); // Sync state for non-override calls too if needed
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
    
    // Only save mastery if it's a specific page test
    if (pageNumber && !isSmartReview) {
      await saveResult(pageNumber, success);
    }
    
    setQuizFinished(true);
  };

  if (!hasStarted) {
    return (
      <div className="p-8 text-center space-y-8">
        <div className="space-y-2">
          <GraduationCap className="w-12 h-12 text-accent mx-auto" />
          <h3 className="text-2xl font-bold font-serif">{isSmartReview ? (isAr ? "مراجعة ذكية شاملة" : "Complete Smart Review") : (isAr ? "اختبار حفظ الصفحة" : "Page Hifz Test")}</h3>
          <p className="text-muted-foreground text-sm">
            {isSmartReview 
              ? (isAr ? "أسئلة مخصصة من صفحاتك الضعيفة" : "Custom questions from your weak pages")
              : (isAr ? `صفحة رقم ${toArabicNumber(pageNumber || 0)}` : `Page Number ${pageNumber}`)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <Button 
            variant="outline" 
            className="w-full h-24 rounded-[2rem] flex flex-col items-center justify-center gap-1 border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40 cursor-pointer transition-all active:scale-95"
            onClick={() => startQuiz("beginner")}
          >
            <span className="font-bold text-emerald-600 text-lg">{isAr ? "مبتدئ / حفظ جديد" : "Beginner / New Hifz"}</span>
            <span className="text-xs text-muted-foreground">{isAr ? "خيارات متعددة وأسئلة سهلة" : "Multiple choice & easy questions"}</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-24 rounded-[2rem] flex flex-col items-center justify-center gap-1 border-accent/20 hover:bg-accent/5 hover:border-accent/40 cursor-pointer transition-all active:scale-95"
            onClick={() => startQuiz("advanced")}
          >
            <span className="font-bold text-accent text-lg">{isAr ? "متقدم / مراجعة" : "Advanced / Review"}</span>
            <span className="text-xs text-muted-foreground">{isAr ? "كتابة يدوية وأسئلة دقيقة" : "Text input & detailed questions"}</span>
          </Button>
        </div>

        {/* Mastery Map Section */}
        <div className="pt-4 border-t border-primary/10">
          <h3 className="text-sm font-serif font-bold text-primary mb-4 flex items-center gap-2 justify-center">
            <Sparkles size={16} className="text-accent" />
            {isAr ? "خريطة إتقان الحفظ" : "Hifz Mastery Map"}
          </h3>
          <HifzMasteryMap />
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
                    variant={isCorrect !== null && normalizeArabic(option) === normalizeArabic(current.answer) ? "default" : "outline"}
                    className={`h-14 rounded-2xl font-serif text-lg ${
                      isCorrect !== null 
                        ? normalizeArabic(option) === normalizeArabic(current.answer) 
                          ? "bg-emerald-500 text-white" 
                          : normalizeArabic(option) === normalizeArabic(userAnswer) 
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
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-accent text-white font-bold"
                    onClick={() => handleCheck()}
                    disabled={!current.options && !userAnswer.trim()}
                  >
                    {isAr ? "تحقق" : "Check"}
                  </Button>
                  {current.verseKey && (
                    <Button
                      variant="outline"
                      className={`h-12 w-12 rounded-xl border-accent/20 text-accent ${isPlayingAudio ? 'animate-pulse bg-accent/10' : ''}`}
                      onClick={() => playVerseAudio(current.verseKey!, 3000)}
                      disabled={isPlayingAudio}
                      title={isAr ? "استمع للتلميح" : "Listen to Hint"}
                    >
                      <Volume2 size={20} />
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    className="h-12 w-12 rounded-xl text-muted-foreground"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <HelpCircle size={20} />
                  </Button>
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
                className="space-y-4"
              >
                <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl ${isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  {isCorrect ? <CheckCircle2 /> : <XCircle />}
                  <span className="font-bold font-serif">
                    {isCorrect 
                      ? (isAr ? "إجابة صحيحة! أحسنت." : "Correct answer! Well done.") 
                      : (isAr ? `خطأ، الإجابة هي: ${current.answer}` : `Incorrect, the answer is: ${current.answer}`)}
                  </span>
                </div>
                
                {current.explanation && (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 text-sm text-center font-serif leading-relaxed italic">
                    <Sparkles className="w-4 h-4 inline-block ml-2 opacity-70" />
                    {current.explanation}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HifzQuizView;
