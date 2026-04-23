import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Trophy, Timer, RotateCcw, CheckCircle2, XCircle, Brain, Book, Users, Star } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

import { QUIZ_QUESTIONS, Question } from "@/data/quizData";

const quizQuestions = QUIZ_QUESTIONS;

const IslamicQuiz = () => {

const IslamicQuiz = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  
  const [currentStep, setCurrentStep] = useState<"start" | "quiz" | "result">("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(30);
  const [category, setCategory] = useState<Question["category"] | "all">("all");
  const [userAnswers, setUserAnswers] = useState<{ questionId: number | string; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [remoteQuestions, setRemoteQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchRemoteQuestions = async () => {
      try {
        const snap = await getDocs(collection(db, "content_quiz"));
        setRemoteQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
      } catch (err) {
        console.error("Quiz fetch error:", err);
      }
    };
    fetchRemoteQuestions();
  }, []);

  const allQuestions = [...remoteQuestions, ...quizQuestions];

  const filteredQuestions = category === "all" 
    ? allQuestions 
    : allQuestions.filter(q => q.category === category);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleAnswer = React.useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setUserAnswers(prev => [...prev, { questionId: currentQuestion.id, selectedIndex: index, isCorrect }]);
  }, [isAnswered, currentQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === "quiz" && !isAnswered && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(-1); // Time out
    }
    return () => clearInterval(interval);
  }, [currentStep, isAnswered, timer, handleAnswer]);

  const handleStart = (cat: Question["category"] | "all") => {
    setCategory(cat);
    setCurrentStep("quiz");
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimer(30);
    setIsAnswered(false);
    setSelectedOption(null);
    setUserAnswers([]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimer(30);
    } else {
      setCurrentStep("result");
    }
  };

  const resetQuiz = () => {
    setCurrentStep("start");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "المسابقة الإسلامية" : "Islamic Quiz"} 
        subtitle={isAr ? "اختبر معلوماتك الدينية بأسلوب ممتع" : "Test your religious knowledge in a fun way"}
        variant="compact"
      />

      <div className="max-w-2xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {currentStep === "start" && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bento-card !p-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Brain className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-naskh">{isAr ? "جاهز للتحدي؟" : "Ready for the challenge?"}</h2>
                  <p className="text-muted-foreground">{isAr ? "اختر فئة وابدأ المسابقة" : "Choose a category and start the quiz"}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-1" onClick={() => handleStart("all")}>
                    <Star className="w-5 h-5 text-amber-500" />
                    <span>{isAr ? "كل الفئات" : "All Categories"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-1" onClick={() => handleStart("quran")}>
                    <Book className="w-5 h-5 text-emerald-500" />
                    <span>{isAr ? "القرآن الكريم" : "Holy Quran"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-1" onClick={() => handleStart("sahaba")}>
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>{isAr ? "الصحابة" : "Sahaba"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-1" onClick={() => handleStart("fiqh")}>
                    <Brain className="w-5 h-5 text-rose-500" />
                    <span>{isAr ? "الفقه" : "Fiqh"}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "quiz" && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <span>{isAr ? "السؤال" : "Question"} {currentQuestionIndex + 1}/{filteredQuestions.length}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timer < 10 ? "border-rose-500 text-rose-500 animate-pulse" : "border-border"}`}>
                    <Timer className="w-4 h-4" />
                    <span className="font-mono font-bold">{timer}s</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bento-card !p-8 space-y-8">
                <h3 className="text-xl font-bold font-naskh leading-relaxed text-center">
                  {isAr ? currentQuestion.questionAr : currentQuestion.questionEn}
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {(isAr ? currentQuestion.optionsAr : currentQuestion.optionsEn).map((option, idx) => {
                    const variant: "outline" | "default" | "secondary" = "outline";
                    let className = "h-auto py-4 px-6 rounded-2xl text-start justify-start font-naskh text-base transition-all duration-300 ";
                    
                    if (isAnswered) {
                      if (idx === currentQuestion.correctIndex) {
                        className += "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ";
                      } else if (idx === selectedOption) {
                        className += "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ";
                      } else {
                        className += "opacity-50 ";
                      }
                    } else {
                      className += "hover:border-primary hover:bg-primary/5 ";
                    }

                    return (
                      <Button 
                        key={idx}
                        variant={variant}
                        className={className}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span>{option}</span>
                          {isAnswered && idx === currentQuestion.correctIndex && (
                            <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500" />
                          )}
                          {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                            <XCircle className="w-5 h-5 ml-auto text-rose-500" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-4 border-t border-border/40"
                  >
                    <div className="p-4 rounded-xl bg-muted/50 text-sm leading-relaxed font-naskh">
                      <p className="font-bold mb-1 text-primary">{isAr ? "التفسير:" : "Explanation:"}</p>
                      {isAr ? currentQuestion.explanationAr : currentQuestion.explanationEn}
                    </div>
                    <Button className="w-full h-12 rounded-xl" onClick={handleNext}>
                      {currentQuestionIndex < filteredQuestions.length - 1 ? (isAr ? "السؤال التالي" : "Next Question") : (isAr ? "عرض النتيجة" : "View Result")}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === "result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bento-card !p-12 text-center space-y-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                    <Trophy className="w-16 h-16" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-naskh">{isAr ? "أحسنت!" : "Well Done!"}</h2>
                  <p className="text-muted-foreground text-lg">
                    {isAr ? "لقد أكملت المسابقة بنجاح" : "You have successfully completed the quiz"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-muted/50 border border-border/40">
                    <p className="text-sm text-muted-foreground mb-1">{isAr ? "النتيجة" : "Score"}</p>
                    <p className="text-3xl font-bold text-primary">{score}/{filteredQuestions.length}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-muted/50 border border-border/40">
                    <p className="text-sm text-muted-foreground mb-1">{isAr ? "النسبة" : "Percentage"}</p>
                    <p className="text-3xl font-bold text-primary">{Math.round((score / filteredQuestions.length) * 100)}%</p>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl text-lg gap-2" onClick={resetQuiz}>
                  <RotateCcw className="w-5 h-5" />
                  {isAr ? "إعادة المحاولة" : "Try Again"}
                </Button>
              </div>

              {/* Review Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-naskh px-2">{isAr ? "مراجعة الإجابات" : "Review Answers"}</h3>
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => {
                    const answer = userAnswers.find(a => a.questionId === q.id);
                    return (
                      <div key={idx} className={`bento-card !p-6 space-y-4 border-l-4 ${answer?.isCorrect ? "border-l-emerald-500" : "border-l-rose-500"}`}>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold font-naskh leading-relaxed">
                            {isAr ? q.questionAr : q.questionEn}
                          </h4>
                          {answer?.isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-3 rounded-xl bg-muted/50">
                            <p className="text-muted-foreground mb-1">{isAr ? "إجابتك:" : "Your Answer:"}</p>
                            <p className={`font-bold ${answer?.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                              {answer?.selectedIndex === -1 
                                ? (isAr ? "انتهى الوقت" : "Time Out") 
                                : (isAr ? q.optionsAr[answer?.selectedIndex || 0] : q.optionsEn[answer?.selectedIndex || 0])}
                            </p>
                          </div>
                          {!answer?.isCorrect && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                              <p className="text-emerald-600/70 mb-1">{isAr ? "الإجابة الصحيحة:" : "Correct Answer:"}</p>
                              <p className="font-bold text-emerald-600">
                                {isAr ? q.optionsAr[q.correctIndex] : q.optionsEn[q.correctIndex]}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 text-sm font-naskh leading-relaxed">
                          <p className="font-bold text-primary mb-1">{isAr ? "التفسير:" : "Explanation:"}</p>
                          {isAr ? q.explanationAr : q.explanationEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IslamicQuiz;
