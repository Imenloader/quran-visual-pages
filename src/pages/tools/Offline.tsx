import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, DownloadCloud, Info, CheckCircle2, Trash2, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Offline = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [downloadedSize, setDownloadedSize] = useState("0 MB");

  useEffect(() => {
    const checkStorage = async () => {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const { usage } = await navigator.storage.estimate();
        if (usage) {
          setDownloadedSize(`${(usage / (1024 * 1024)).toFixed(1)} MB`);
        }
      }
    };
    checkStorage();
  }, []);

  const clearCache = async () => {
    if (confirm("هل تريد حذف جميع الملفات المحملة؟")) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        setDownloadedSize("0 MB");
        toast.success("تم حذف جميع الملفات بنجاح");
      } catch (err) {
        toast.error("حدث خطأ أثناء حذف الملفات");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-naskh">{t("hub.offline")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Database className="w-48 h-48 text-emerald-deep" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-deep/10 text-emerald-deep flex items-center justify-center mx-auto">
                <DownloadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-naskh">المساحة المستخدمة</p>
                <p className="text-4xl font-bold font-mono text-foreground">{downloadedSize}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-naskh text-foreground">القرآن الكريم</h3>
                  <p className="text-[10px] text-muted-foreground font-naskh">متاح للقراءة دون اتصال</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-deep font-mono">12 MB</span>
            </div>

            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-naskh text-foreground">الأذكار</h3>
                  <p className="text-[10px] text-muted-foreground font-naskh">متاحة للقراءة دون اتصال</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-deep font-mono">0.5 MB</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={clearCache}
              className="w-full h-14 rounded-2xl border-2 border-destructive/20 text-destructive font-bold font-naskh hover:bg-destructive/5 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              حذف جميع الملفات
            </button>

            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
                يتم تحميل المحتوى تلقائياً عند تصفحه لأول مرة ليكون متاحاً لك في المرات القادمة دون الحاجة للاتصال بالإنترنت.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
