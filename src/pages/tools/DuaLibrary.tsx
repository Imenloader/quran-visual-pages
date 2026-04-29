import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Copy, BookOpen, Plus, Trash2, X, Share2, Star, Check } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LayoutGrid, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { allDuas, duaCategories } from "@/data/duaData";
import { syncService } from "@/services/syncService";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect } from "react";

interface CustomDua {
  id: string;
  titleAr: string;
  titleEn: string;
  arabic: string;
  note?: string;
}

const DuaLibrary = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [newNote, setNewNote] = useState("");
  const [customDuas, setCustomDuas] = useState<CustomDua[]>([]);
  const [globalDuas, setGlobalDuas] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const saved = await syncService.loadCollection<CustomDua>("custom-duas");
      setCustomDuas(saved);
      
      // Fetch Admin-managed Global Duas
      try {
        const q = query(collection(db, "content_duas"), orderBy("titleAr"));
        const snap = await getDocs(q);
        setGlobalDuas(snap.docs.map(d => ({ id: d.id, ...d.data(), isGlobal: true })));
      } catch (error) {
        console.error("Global Duas Error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInitialData();
      }
    });

    loadInitialData();
    return () => unsubscribe();
  }, []);

  const combinedDuas = [...globalDuas, ...allDuas];

  const filteredDuas = combinedDuas.filter(dua => {
    const matchesSearch =
      (dua.titleEn && dua.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dua.titleAr && dua.titleAr.includes(searchQuery)) ||
      (dua.arabic && dua.arabic.includes(searchQuery)) ||
      (dua.translationEn && dua.translationEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dua.translationAr && dua.translationAr.includes(searchQuery));
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

  const saveCustomDua = () => {
    if (!newArabic.trim()) return;
    const entry: CustomDua = {
      id: Date.now().toString(),
      titleAr: newTitleAr.trim() || "دعاء شخصي",
      titleEn: newTitleEn.trim() || "Personal Dua",
      arabic: newArabic.trim(),
      note: newNote.trim() || undefined,
    };
    const updated = [entry, ...customDuas];
    setCustomDuas(updated);
    syncService.saveCollectionItem("custom-duas", entry);
    setNewTitleAr(""); setNewTitleEn(""); setNewArabic(""); setNewNote("");
    setShowAddModal(false);
    toast.success(isAr ? "تم حفظ الدعاء" : "Dua saved!");
  };

  const deleteCustomDua = (id: string) => {
    const updated = customDuas.filter(d => d.id !== id);
    setCustomDuas(updated);
    syncService.deleteCollectionItem("custom-duas", id);
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
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                placeholder={isAr ? "ابحث عن دعاء..." : "Search for a Dua..."}
                className="h-14 pl-12 rounded-2xl text-lg font-naskh shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-14 px-5 rounded-2xl gap-2 font-naskh shrink-0 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              {isAr ? "دعاء خاص" : "Add Dua"}
            </Button>
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

        {/* Custom Duas */}
        {customDuas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {isAr ? "أدعيتي الخاصة" : "My Personal Duas"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customDuas.map(dua => (
                <div
                  key={dua.id}
                  className="bento-card !p-6 space-y-4 border-primary/20 bg-primary/5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {isAr ? "خاص" : "Personal"}
                      </span>
                      <h4 className="text-lg font-bold font-naskh mt-2">
                        {isAr ? dua.titleAr : dua.titleEn}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => copyToClipboard(dua.arabic)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteCustomDua(dua.id)} className="p-2 rounded-xl hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/40">
                    <p className="text-xl font-naskh leading-loose text-center">{dua.arabic}</p>
                  </div>
                  {dua.note && <p className="text-xs text-muted-foreground italic">{dua.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Dua Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <div
              className="w-full max-w-md bg-card border border-border rounded-[2rem] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-naskh text-lg">{isAr ? "إضافة دعاء خاص" : "Add Personal Dua"}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Input placeholder={isAr ? "العنوان بالعربي" : "Title in Arabic"} value={newTitleAr} onChange={e => setNewTitleAr(e.target.value)} className="h-11 rounded-xl font-naskh" dir="rtl" />
              <Input placeholder={isAr ? "العنوان بالإنجليزية" : "Title in English"} value={newTitleEn} onChange={e => setNewTitleEn(e.target.value)} className="h-11 rounded-xl" />
              <textarea
                placeholder={isAr ? "نص الدعاء بالعربية *" : "Dua text in Arabic *"}
                value={newArabic}
                onChange={e => setNewArabic(e.target.value)}
                rows={4}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border font-naskh text-lg leading-loose resize-none focus:outline-none focus:border-primary transition-colors"
              />
              <Input placeholder={isAr ? "ملاحظة (اختياري)" : "Note (optional)"} value={newNote} onChange={e => setNewNote(e.target.value)} className="h-11 rounded-xl" />
              <Button onClick={saveCustomDua} className="w-full h-12 rounded-xl gap-2 active:scale-95" disabled={!newArabic.trim()}>
                <Plus className="w-4 h-4" />
                {isAr ? "حفظ الدعاء" : "Save Dua"}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDuas.map((dua) => (
            <div 
              key={dua.id}
              className="bento-card !p-8 space-y-6 flex flex-col group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {isAr ? (dua.categoryAr || dua.category) : dua.category}
                    </span>
                    {dua.isGlobal && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        {isAr ? "رسمي" : "Official"}
                      </span>
                    )}
                  </div>
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
            </div>
          ))}
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
