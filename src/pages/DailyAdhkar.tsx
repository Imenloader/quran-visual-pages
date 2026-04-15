import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  CheckCircle2,
  Search,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import BackButton from "@/components/BackButton";
import { dailySunnan } from "@/data/dailyAdhkarData";

const Sunnan = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredSunnan = dailySunnan.filter(s => 
    s.title.includes(searchQuery) || 
    s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.includes(searchQuery) ||
    s.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    toast.success(i18n.language === 'ar' ? "تم النسخ بنجاح" : "Copied successfully");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "السنن النبوية" : "Prophetic Sunnan"} 
        subtitle={i18n.language === 'ar' ? "سنن يومية مهجورة لإحياء هدي النبي ﷺ" : "Daily Sunnan to revive the guidance of the Prophet ﷺ"} 
        variant="compact" 
      />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <BackButton variant="outline" />

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={i18n.language === 'ar' ? "ابحث في السنن..." : "Search Sunnan..."}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSunnan.map((sunnah, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.05}>
              <div className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/40 transition-all duration-500 h-full flex flex-col justify-between group relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles size={24} />
                    </div>
                    <button 
                      onClick={() => handleCopy(`${i18n.language === 'ar' ? sunnah.title : sunnah.titleEn}\n${i18n.language === 'ar' ? sunnah.description : sunnah.descriptionEn}`, idx)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                    >
                      {copiedId === idx ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <h3 className="text-xl font-bold">{i18n.language === 'ar' ? sunnah.title : sunnah.titleEn}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {i18n.language === 'ar' ? sunnah.description : sunnah.descriptionEn}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-border flex justify-end">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                    {i18n.language === 'ar' ? "سنة نبوية" : "Prophetic Sunnah"}
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {filteredSunnan.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {i18n.language === 'ar' ? "لم يتم العثور على نتائج للبحث" : "No results found for your search"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sunnan;
