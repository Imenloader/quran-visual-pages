import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { 
  Heart, 
  Search, 
  Copy, 
  Share2, 
  Star, 
  BookOpen, 
  Brain, 
  Shield, 
  Sparkles, 
  Sun,
  Moon,
  CloudRain,
  GraduationCap,
  Stethoscope
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { LayoutGrid, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { allDuas, duaCategories, type Dua } from "@/data/duaData";

const DuaLibrary = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDuas = allDuas.filter(dua => {
    const matchesSearch = 
      dua.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.titleAr.includes(searchQuery) ||
      dua.arabic.includes(searchQuery) ||
      dua.translationEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translationAr.includes(searchQuery);
    
    const matchesCategory = selectedCategory === "all" || dua.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isAr ? "تم النسخ إلى الحافظة" : "Copied to clipboard");
  };

  const getIcon = (iconName: string): React.ReactNode => {
    const Icon = (Icons as any)[iconName] as LucideIcon;
    return Icon ? <Icon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "مكتبة الأدعية" : "Dua Library"} 
        subtitle={isAr ? "أدعية من الكتاب والسنة لمختلف مواقف الحياة" : "Supplications from Quran and Sunnah for life situations"}
        variant="compact"
      />

      <div className="max-w-6xl mx-auto px-4 mt-12 space-y-8">
        {/* Search & Categories */}
        <div className="space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Input 
              placeholder={isAr ? "ابحث عن دعاء..." : "Search for a Dua..."} 
              className="h-14 pl-12 rounded-2xl text-lg font-naskh shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {duaCategories.map((cat) => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className="rounded-full h-10 px-6 gap-2 font-naskh"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {getIcon(cat.icon)}
                {isAr ? cat.ar : cat.en}
              </Button>
            ))}
          </div>
        </div>

        {/* Dua Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDuas.map((dua) => (
              <motion.div 
                key={dua.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bento-card !p-8 space-y-6 flex flex-col group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {isAr ? dua.categoryAr : dua.category}
                    </span>
                    <h3 className="text-xl font-bold font-naskh pt-2">{isAr ? dua.titleAr : dua.titleEn}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => copyToClipboard(dua.arabic)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-3xl space-y-4 border border-border/40">
                  <p className="text-2xl font-naskh leading-loose text-center text-foreground font-medium">
                    {dua.arabic}
                  </p>
                  {!isAr && (
                    <p className="text-xs text-muted-foreground italic text-center font-serif">
                      {dua.transliteration}
                    </p>
                  )}
                </div>


                <div className="space-y-4 flex-grow">
                  <p className="text-sm leading-relaxed font-naskh text-muted-foreground">
                    <span className="font-bold text-foreground block mb-1">{isAr ? "الترجمة:" : "Translation:"}</span>
                    {isAr ? dua.translationAr : dua.translationEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    {dua.reference}
                  </div>
                  <Star className="w-3 h-3 text-amber-500 fill-current" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDuas.length === 0 && (
          <div className="text-center py-24 space-y-4 opacity-30">
            <Search className="w-16 h-16 mx-auto" />
            <p className="text-xl font-medium">{isAr ? "لم يتم العثور على أدعية تطابق بحثك" : "No Duas found matching your search"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuaLibrary;
