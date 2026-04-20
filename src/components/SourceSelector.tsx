import { X, Server, Check, Info, DownloadCloud } from "lucide-react";
import { QURAN_IMAGE_SOURCES } from "@/data/quranData";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "motion/react";

interface SourceSelectorProps {
  onClose: () => void;
}

const SourceSelector = ({ onClose }: SourceSelectorProps) => {
  const { preferredImageSource, setPreferredImageSource, tajweedMode } = useTheme();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-[90vw] max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Server size={20} />
            </div>
            <div>
              <h2 className="font-bold font-naskh text-lg">مصدر الصور</h2>
              <p className="text-[10px] text-muted-foreground font-naskh">اختر مصدر تحميل صفحات المصحف</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Default Option */}
          <button
            onClick={() => {
              setPreferredImageSource(null);
              onClose();
            }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              preferredImageSource === null ? "bg-primary/10 border-primary" : "bg-card border-border/40 hover:bg-muted"
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              preferredImageSource === null ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
            }`}>
              {preferredImageSource === null && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold font-naskh">تلقائي (الأفضل)</p>
              <p className="text-[10px] text-muted-foreground font-naskh">يحاول التحميل من أفضل مصدر متاح تلقائياً</p>
            </div>
          </button>

          <div className="h-px bg-border/40 my-2" />

          {QURAN_IMAGE_SOURCES.map((source) => (
            <button
              key={source.id}
              onClick={() => {
                setPreferredImageSource(source.id);
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                preferredImageSource === source.id ? "bg-primary/10 border-primary" : "bg-card border-border/40 hover:bg-muted"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                preferredImageSource === source.id ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
              }`}>
                {preferredImageSource === source.id && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold font-naskh">{source.nameAr}</p>
                <div className="flex items-center gap-2 mt-1">
                  {source.isTajweed && (
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">تجويد</span>
                  )}
                  <p className="text-[10px] text-muted-foreground font-naskh">{source.nameEn}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-naskh">
              في حال فشل تحميل الصورة من المصدر المختار، سيقوم النظام تلقائياً بالمحاولة من المصادر الأخرى لضمان استمرارية القراءة.
            </p>
          </div>
          
          <button 
            onClick={() => {
              onClose();
              window.location.href = "/offline";
            }}
            className="w-full py-3 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-bold font-naskh flex items-center justify-center gap-2 transition-all"
          >
            <DownloadCloud size={14} />
            تحميل المصحف كاملاً للاستخدام بدون إنترنت
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SourceSelector;
