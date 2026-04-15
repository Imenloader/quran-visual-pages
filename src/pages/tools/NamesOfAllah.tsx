import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NAMES_OF_ALLAH, type NameOfAllah } from "@/data/namesOfAllahData";
import BackButton from "@/components/BackButton";

const NamesOfAllah = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const isAr = i18n.language === "ar";

  const filteredNames = useMemo(() => {
    return NAMES_OF_ALLAH.filter(n => 
      n.name.includes(searchQuery) || 
      n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.meaning.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.meaning.ar.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh">{t("hub.namesOfAllah")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={isAr ? "بحث في أسماء الله الحسنى..." : "Search in Names of Allah..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredNames.map((n, idx) => (
            <motion.button
              key={n.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => setSelectedName(n)}
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-3xl shadow-soft hover:bg-accent/5 transition-colors group"
            >
              <span className="text-3xl font-bold font-naskh text-primary mb-2 group-hover:scale-110 transition-transform">{n.name}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{n.transliteration}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedName && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedName(null)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
              >
                <button 
                  onClick={() => setSelectedName(null)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Heart className="w-32 h-32 text-primary" />
                </div>
                
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-5xl font-bold font-naskh mb-4">
                    {selectedName.name}
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-naskh text-foreground">{selectedName.transliteration}</h2>
                    <p className="text-primary font-medium font-naskh">{isAr ? selectedName.meaning.ar : selectedName.meaning.en}</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-sm font-naskh text-muted-foreground leading-relaxed">
                    {isAr ? selectedName.description.ar : selectedName.description.en}
                  </div>

                  <button
                    onClick={() => setSelectedName(null)}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-naskh shadow-islamic active:scale-95 transition-transform"
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NamesOfAllah;
