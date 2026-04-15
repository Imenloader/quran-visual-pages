import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Trophy, Timer, RotateCcw, CheckCircle2, XCircle, Brain, Book, Users, Star } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  category: "quran" | "fiqh" | "sahaba";
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    category: "quran",
    questionEn: "Which Surah is known as the 'Heart of the Quran'?",
    questionAr: "أي سورة تُعرف بـ 'قلب القرآن'؟",
    optionsEn: ["Surah Al-Baqarah", "Surah Yaseen", "Surah Al-Mulk", "Surah Al-Ikhlas"],
    optionsAr: ["سورة البقرة", "سورة يس", "سورة الملك", "سورة الإخلاص"],
    correctIndex: 1,
    explanationEn: "Surah Yaseen is often referred to as the heart of the Quran in various traditions.",
    explanationAr: "سورة يس غالباً ما يُشار إليها بقلب القرآن في العديد من الأحاديث والآثار."
  },
  {
    id: 2,
    category: "sahaba",
    questionEn: "Who was the first person to embrace Islam among women?",
    questionAr: "من هي أول من أسلم من النساء؟",
    optionsEn: ["Aisha (RA)", "Fatima (RA)", "Khadijah (RA)", "Sumayyah (RA)"],
    optionsAr: ["عائشة رضي الله عنها", "فاطمة رضي الله عنها", "خديجة رضي الله عنها", "سمية رضي الله عنها"],
    correctIndex: 2,
    explanationEn: "Khadijah bint Khuwaylid (RA), the Prophet's first wife, was the first person to believe in his message.",
    explanationAr: "خديجة بنت خويلد رضي الله عنها، زوجة النبي الأولى، كانت أول من آمن برسالته."
  },
  {
    id: 3,
    category: "fiqh",
    questionEn: "How many pillars of Islam are there?",
    questionAr: "كم عدد أركان الإسلام؟",
    optionsEn: ["3", "4", "5", "6"],
    optionsAr: ["٣", "٤", "٥", "٦"],
    correctIndex: 2,
    explanationEn: "The five pillars are Shahada, Salah, Zakat, Sawm, and Hajj.",
    explanationAr: "أركان الإسلام الخمسة هي: الشهادة، الصلاة، الزكاة، الصوم، والحج."
  },
  {
    id: 4,
    category: "quran",
    questionEn: "What is the longest Surah in the Holy Quran?",
    questionAr: "ما هي أطول سورة في القرآن الكريم؟",
    optionsEn: ["Surah Al-Imran", "Surah Al-Nisa", "Surah Al-Baqarah", "Surah Al-Ma'idah"],
    optionsAr: ["سورة آل عمران", "سورة النساء", "سورة البقرة", "سورة المائدة"],
    correctIndex: 2,
    explanationEn: "Surah Al-Baqarah is the longest Surah with 286 verses.",
    explanationAr: "سورة البقرة هي أطول سورة في القرآن الكريم وتتكون من ٢٨٦ آية."
  },
  {
    id: 5,
    category: "sahaba",
    questionEn: "Who was known as 'As-Siddiq' (The Truthful)?",
    questionAr: "من الذي لُقب بـ 'الصديق'؟",
    optionsEn: ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan", "Ali ibn Abi Talib"],
    optionsAr: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"],
    correctIndex: 1,
    explanationEn: "Abu Bakr (RA) was given this title by the Prophet (PBUH) for his immediate belief in the Isra and Mi'raj.",
    explanationAr: "لُقب أبو بكر رضي الله عنه بهذا اللقب من قبل النبي صلى الله عليه وسلم لتصديقه الفوري لرحلة الإسراء والمعراج."
  },
  {
    id: 6,
    category: "quran",
    questionEn: "How many Surahs are there in the Holy Quran?",
    questionAr: "كم عدد سور القرآن الكريم؟",
    optionsEn: ["110", "114", "120", "124"],
    optionsAr: ["١١٠", "١١٤", "١٢٠", "١٢٤"],
    correctIndex: 1,
    explanationEn: "The Holy Quran consists of 114 Surahs.",
    explanationAr: "يتكون القرآن الكريم من ١١٤ سورة."
  },
  {
    id: 7,
    category: "sahaba",
    questionEn: "Who was the first Muadhin (caller to prayer) in Islam?",
    questionAr: "من هو أول مؤذن في الإسلام؟",
    optionsEn: ["Abu Bakr (RA)", "Umar (RA)", "Bilal ibn Rabah (RA)", "Ali (RA)"],
    optionsAr: ["أبو بكر رضي الله عنه", "عمر رضي الله عنه", "بلال بن رباح رضي الله عنه", "علي رضي الله عنه"],
    correctIndex: 2,
    explanationEn: "Bilal ibn Rabah (RA) was chosen by the Prophet (PBUH) to be the first Muadhin.",
    explanationAr: "اختار النبي صلى الله عليه وسلم بلال بن رباح رضي الله عنه ليكون أول مؤذن في الإسلام."
  },
  {
    id: 8,
    category: "fiqh",
    questionEn: "What is the first month of the Islamic (Hijri) calendar?",
    questionAr: "ما هو الشهر الأول في التقويم الهجري؟",
    optionsEn: ["Ramadan", "Muharram", "Shawwal", "Dhul-Hijjah"],
    optionsAr: ["رمضان", "محرم", "شوال", "ذو الحجة"],
    correctIndex: 1,
    explanationEn: "Muharram is the first month of the Islamic lunar calendar.",
    explanationAr: "شهر محرم هو أول شهر في السنة الهجرية."
  },
  {
    id: 9,
    category: "quran",
    questionEn: "Which Surah does not start with Bismillah?",
    questionAr: "ما هي السورة التي لا تبدأ بالبسملة؟",
    optionsEn: ["Surah Al-Fatihah", "Surah Al-Ikhlas", "Surah At-Tawbah", "Surah An-Nas"],
    optionsAr: ["سورة الفاتحة", "سورة الإخلاص", "سورة التوبة", "سورة الناس"],
    correctIndex: 2,
    explanationEn: "Surah At-Tawbah is the only Surah in the Quran that does not begin with Bismillah.",
    explanationAr: "سورة التوبة هي السورة الوحيدة في القرآن التي لا تبدأ بالبسملة."
  },
  {
    id: 10,
    category: "sahaba",
    questionEn: "Who was known as 'The Sword of Allah'?",
    questionAr: "من هو الصحابي الملقب بـ 'سيف الله المسلول'؟",
    optionsEn: ["Khalid ibn al-Walid", "Hamza ibn Abdul-Muttalib", "Sa'd ibn Abi Waqqas", "Ja'far ibn Abi Talib"],
    optionsAr: ["خالد بن الوليد", "حمزة بن عبد المطلب", "سعد بن أبي وقاص", "جعفر بن أبي طالب"],
    correctIndex: 0,
    explanationEn: "The Prophet (PBUH) gave Khalid ibn al-Walid (RA) the title 'Saifullah' (The Sword of Allah).",
    explanationAr: "لقب النبي صلى الله عليه وسلم خالد بن الوليد رضي الله عنه بـ 'سيف الله المسلول'."
  },
  {
    id: 11,
    category: "fiqh",
    questionEn: "How many times is Salah (prayer) obligatory per day?",
    questionAr: "كم عدد الصلوات المفروضة في اليوم؟",
    optionsEn: ["3", "4", "5", "6"],
    optionsAr: ["٣", "٤", "٥", "٦"],
    correctIndex: 2,
    explanationEn: "Muslims are required to perform five daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha.",
    explanationAr: "يجب على المسلم أداء خمس صلوات في اليوم: الفجر، الظهر، العصر، المغرب، والعشاء."
  },
  {
    id: 12,
    category: "quran",
    questionEn: "In which month was the Holy Quran first revealed?",
    questionAr: "في أي شهر نزل القرآن الكريم لأول مرة؟",
    optionsEn: ["Muharram", "Rajab", "Ramadan", "Dhul-Hijjah"],
    optionsAr: ["محرم", "رجب", "رمضان", "ذو الحجة"],
    correctIndex: 2,
    explanationEn: "The Quran was first revealed to the Prophet (PBUH) during the month of Ramadan, specifically on Laylat al-Qadr.",
    explanationAr: "نزل القرآن الكريم لأول مرة على النبي صلى الله عليه وسلم في شهر رمضان، وتحديداً في ليلة القدر."
  },
  {
    id: 13,
    category: "sahaba",
    questionEn: "Who was the youngest Sahabi to lead an army?",
    questionAr: "من هو أصغر صحابي قاد جيشاً؟",
    optionsEn: ["Ali ibn Abi Talib", "Usama ibn Zayd", "Zayd ibn Harithah", "Mus'ab ibn Umayr"],
    optionsAr: ["علي بن أبي طالب", "أسامة بن زيد", "زيد بن حارثة", "مصعب بن عمير"],
    correctIndex: 1,
    explanationEn: "Usama ibn Zayd (RA) was appointed by the Prophet (PBUH) to lead an army at the age of 18.",
    explanationAr: "عين النبي صلى الله عليه وسلم أسامة بن زيد رضي الله عنه قائداً للجيش وهو في سن الثامنة عشرة."
  },
  {
    id: 14,
    category: "fiqh",
    questionEn: "What is the direction of prayer (Qibla) for Muslims?",
    questionAr: "ما هي القبلة التي يتجه إليها المسلمون في صلاتهم؟",
    optionsEn: ["Al-Aqsa Mosque", "The Kaaba in Makkah", "The Prophet's Mosque", "Mount Sinai"],
    optionsAr: ["المسجد الأقصى", "الكعبة المشرفة في مكة", "المسجد النبوي", "جبل سيناء"],
    correctIndex: 1,
    explanationEn: "The Kaaba in Makkah is the Qibla for all Muslims around the world.",
    explanationAr: "الكعبة المشرفة في مكة المكرمة هي قبلة المسلمين في جميع أنحاء العالم."
  },
  {
    id: 15,
    category: "quran",
    questionEn: "Which Prophet is mentioned most by name in the Quran?",
    questionAr: "من هو النبي الذي ذكر اسمه أكثر في القرآن الكريم؟",
    optionsEn: ["Prophet Muhammad (PBUH)", "Prophet Ibrahim (AS)", "Prophet Musa (AS)", "Prophet Isa (AS)"],
    optionsAr: ["النبي محمد صلى الله عليه وسلم", "النبي إبراهيم عليه السلام", "النبي موسى عليه السلام", "النبي عيسى عليه السلام"],
    correctIndex: 2,
    explanationEn: "Prophet Musa (AS) is mentioned 136 times in the Holy Quran.",
    explanationAr: "ذكر اسم النبي موسى عليه السلام ١٣٦ مرة في القرآن الكريم."
  }
];

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
  const [userAnswers, setUserAnswers] = useState<{ questionId: number; selectedIndex: number; isCorrect: boolean }[]>([]);

  const filteredQuestions = category === "all" 
    ? quizQuestions 
    : quizQuestions.filter(q => q.category === category);

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
