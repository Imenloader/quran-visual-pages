import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Sparkles, Send, Brain, Heart, Sun, Moon, Cloud, Loader2, Info } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { getSpiritualAdvice } from "@/services/aiAdvisorService";
import { toast } from "sonner";

interface Message {
  role: "user" | "ai";
  content: string;
  mood?: string;
}

const moods = [
  { id: "anxious", labelAr: "قلق", labelEn: "Anxious", icon: <Cloud className="w-5 h-5 text-blue-400" />, color: "bg-blue-500/10" },
  { id: "grateful", labelAr: "ممتن", labelEn: "Grateful", icon: <Sun className="w-5 h-5 text-amber-400" />, color: "bg-amber-500/10" },
  { id: "tired", labelAr: "متعب", labelEn: "Tired", icon: <Moon className="w-5 h-5 text-indigo-400" />, color: "bg-indigo-500/10" },
  { id: "sad", labelAr: "حزين", labelEn: "Sad", icon: <Heart className="w-5 h-5 text-rose-400" />, color: "bg-rose-500/10" },
  { id: "seeking-guidance", labelAr: "أبحث عن هدى", labelEn: "Seeking Guidance", icon: <Brain className="w-5 h-5 text-emerald-400" />, color: "bg-emerald-500/10" },
];

const AiAdvisor = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (moodId?: string) => {
    const activeMood = moodId || selectedMood;
    if (!activeMood && !input.trim()) return;

    const userMessage = input.trim() || (isAr ? `أشعر بـ ${moods.find(m => m.id === activeMood)?.labelAr}` : `I feel ${moods.find(m => m.id === activeMood)?.labelEn}`);
    
    setMessages(prev => [...prev, { role: "user", content: userMessage, mood: activeMood || undefined }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getSpiritualAdvice(
        activeMood || "neutral",
        input.trim() || undefined,
        i18n.language
      );

      setMessages(prev => [...prev, { role: "ai", content: response.message }]);
    } catch (error) {
      toast.error(isAr ? "عذراً، فشل الاتصال بالمستشار الروحاني" : "Sorry, failed to connect to the spiritual advisor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    handleSend(moodId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 overflow-x-hidden">
      <QuranHeader 
        title={isAr ? "المستشار الروحاني الذكي" : "AI Spiritual Advisor"} 
        subtitle={isAr ? "دعم روحاني مبني على القرآن والسنة باستخدام الذكاء الاصطناعي" : "Spiritual support based on Quran and Sunnah powered by AI"}
        variant="compact"
      />

      <div className="max-w-3xl mx-auto w-full px-4 mt-8 flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-6">
          <BackButton />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Live AI Guidance</span>
          </div>
        </header>

        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl border border-white/10">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-bold font-naskh">{isAr ? "كيف حالك اليوم؟" : "How are you feeling today?"}</h2>
              <p className="text-muted-foreground font-naskh leading-relaxed">
                {isAr 
                  ? "اختر حالتك الشعورية لنبدأ جلسة روحانية هادئة أو اطرح سؤالاً للحصول على توجيه من الكتاب والسنة." 
                  : "Choose your mood to start a peaceful spiritual session or ask a question to get guidance from Quran and Sunnah."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full">
              {moods.map((mood) => (
                <motion.button
                  key={mood.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`p-6 rounded-[2rem] ${mood.color} border border-border/40 flex flex-col items-center gap-3 transition-all group`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {mood.icon}
                  </div>
                  <span className="text-sm font-bold font-naskh">{isAr ? mood.labelAr : mood.labelEn}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 mb-8 overflow-y-auto min-h-[400px]">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-card border border-border/40 rounded-tl-none font-naskh leading-loose text-lg"
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted/50 p-4 rounded-full flex items-center gap-3 px-6 border border-border/20">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Advisor is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="sticky bottom-4 z-50">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3 p-2 bg-card/80 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-2xl">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder={isAr ? "اسأل المستشار الروحاني..." : "Ask the spiritual advisor..."}
                className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-3 text-lg font-naskh text-foreground placeholder:text-muted-foreground/50"
              />
              <Button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex items-start gap-2 px-6 text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed italic">
              {isAr 
                ? "هذا نظام ذكاء اصطناعي يقدم نصائح عامة. يرجى استشارة أهل العلم في الفتاوى الشرعية الدقيقة." 
                : "This is an AI system providing general advice. Please consult scholars for specific religious rulings (Fatawa)."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;
