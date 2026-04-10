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

interface Dua {
  id: number;
  category: string;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationAr: string;
  reference: string;
}

const duas: Dua[] = [
  {
    id: 1,
    category: "Exams & Knowledge",
    categoryAr: "الامتحانات والعلم",
    titleEn: "Dua for Knowledge",
    titleAr: "دعاء طلب العلم",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translationEn: "My Lord, increase me in knowledge.",
    translationAr: "ربِ زدني علماً.",
    reference: "Surah Taha, 20:114"
  },
  {
    id: 2,
    category: "Exams & Knowledge",
    categoryAr: "الامتحانات والعلم",
    titleEn: "Dua for Ease in Tasks",
    titleAr: "دعاء تيسير الأمور",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbi-shrah li sadri, wa yassir li amri",
    translationEn: "My Lord, expand for me my breast [with assurance] and ease for me my task.",
    translationAr: "ربِ اشرح لي صدري ويسر لي أمري.",
    reference: "Surah Taha, 20:25-26"
  },
  {
    id: 3,
    category: "Health & Healing",
    categoryAr: "الصحة والشفاء",
    titleEn: "Dua for the Sick",
    titleAr: "دعاء للمريض",
    arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا",
    transliteration: "Adhibil-ba'sa Rabba-nnas, ishfi wa Antash-Shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
    translationEn: "Remove the hardship, O Lord of mankind, grant cure for You are the Healer. There is no cure but from You, a cure which leaves no illness behind.",
    translationAr: "أذهب البأس رب الناس، اشف وأنت الشافي، لا شفاء إلا شفاؤك، شفاءً لا يغادر سقماً.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 4,
    category: "Protection & Safety",
    categoryAr: "الحماية والأمان",
    titleEn: "Protection from Evil",
    titleAr: "الاستعاذة من الشرور",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim",
    translationEn: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    translationAr: "باسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    reference: "Sunan Abi Dawud"
  },
  {
    id: 5,
    category: "Guidance & Decisions",
    categoryAr: "الهداية والقرار",
    titleEn: "Dua for Istikhara (Seeking Guidance)",
    titleAr: "دعاء الاستخارة",
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ",
    transliteration: "Allahumma inni astakhiruka bi'ilmika wa astaqdiruka biqudratika wa as'aluka min fadlikal-'azim",
    translationEn: "O Allah, I seek Your counsel through Your knowledge and I seek Your strength through Your power, and I ask You of Your immense bounty.",
    translationAr: "اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك وأسألك من فضلك العظيم.",
    reference: "Sahih al-Bukhari (Excerpt)"
  },
  {
    id: 6,
    category: "Gratitude & Success",
    categoryAr: "الشكر والنجاح",
    titleEn: "Dua for Gratitude",
    titleAr: "دعاء الشكر",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya",
    translationEn: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me.",
    translationAr: "ربِ أوزعني أن أشكر نعمتك التي أنعمت علي.",
    reference: "Surah An-Naml, 27:19"
  }
];

const categories = [
  { en: "All", ar: "الكل", icon: <LayoutGrid className="w-4 h-4" /> },
  { en: "Exams & Knowledge", ar: "الامتحانات والعلم", icon: <GraduationCap className="w-4 h-4" /> },
  { en: "Health & Healing", ar: "الصحة والشفاء", icon: <Stethoscope className="w-4 h-4" /> },
  { en: "Protection & Safety", ar: "الحماية والأمان", icon: <Shield className="w-4 h-4" /> },
  { en: "Guidance & Decisions", ar: "الهداية والقرار", icon: <Brain className="w-4 h-4" /> },
  { en: "Gratitude & Success", ar: "الشكر والنجاح", icon: <Sparkles className="w-4 h-4" /> },
];

import { LayoutGrid } from "lucide-react";

const DuaLibrary = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDuas = duas.filter(dua => {
    const matchesSearch = 
      dua.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.titleAr.includes(searchQuery) ||
      dua.arabic.includes(searchQuery);
    
    const matchesCategory = selectedCategory === "All" || dua.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isAr ? "تم النسخ إلى الحافظة" : "Copied to clipboard");
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
            {categories.map((cat) => (
              <Button 
                key={cat.en}
                variant={selectedCategory === cat.en ? "default" : "outline"}
                className="rounded-full h-10 px-6 gap-2 font-naskh"
                onClick={() => setSelectedCategory(cat.en)}
              >
                {cat.icon}
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
                  <p className="text-xs text-muted-foreground italic text-center font-serif">
                    {dua.transliteration}
                  </p>
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
