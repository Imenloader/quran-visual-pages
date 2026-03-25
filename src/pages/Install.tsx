import { useState, useEffect } from "react";
import { Download, Smartphone, Share, MoreVertical, Plus, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-accent/20">
      {/* Immersive Experiential Header */}
      <header className="relative overflow-hidden pt-16 pb-24 px-6 text-center">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-emerald-deep z-0" />
        <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
        
        {/* Atmospheric Elements */}
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -right-1/4 w-full h-full bg-gold/20 rounded-full blur-[120px] z-0" 
        />

        <div className="relative z-10 container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-gradient-to-l from-gold/50 to-transparent" />
            <span className="text-[10px] font-bold text-gold/80 uppercase tracking-[0.4em]">تثبيت التطبيق الذكي</span>
            <div className="h-px w-12 bg-gradient-to-r from-gold/50 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-[2rem] bg-gold/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-gold/30 shadow-gold-glow">
              <Smartphone size={32} className="text-gold" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
              تثبيت <span className="italic font-light text-gold/80">التطبيق</span>
            </h1>
            
            <p className="text-white/80 font-serif italic text-lg max-w-xl mx-auto leading-relaxed">
              احصل على تجربة قراءة متكاملة وسريعة حتى بدون اتصال بالإنترنت، لتكون آيات الله معك في كل وقت وحين
            </p>

            <motion.p 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="font-amiri text-gold text-3xl mt-10"
            >
              ﷽
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="container max-w-lg mx-auto px-6 -mt-12 relative z-20 space-y-6">
        {/* Install status */}
        {isInstalled && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-primary/10 border border-emerald-primary/30">
            <CheckCircle2 className="text-emerald-primary shrink-0" size={24} />
            <div>
              <p className="font-bold font-naskh text-foreground">التطبيق مُثبّت بالفعل! ✅</p>
              <p className="text-sm text-muted-foreground font-naskh">يمكنك فتحه من الشاشة الرئيسية</p>
            </div>
          </div>
        )}

        {/* Direct install button (Android/Desktop Chrome) */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl gradient-gold text-foreground font-bold font-naskh text-lg shadow-islamic transition-transform active:scale-95"
          >
            <Download size={22} />
            تثبيت التطبيق الآن
          </button>
        )}

        {/* iOS Instructions */}
        {isIOS && !isInstalled && (
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={20} className="text-gold" />
              <h2 className="font-bold font-naskh text-lg">التثبيت على آيفون / آيباد</h2>
            </div>
            <div className="space-y-3">
              <Step number={1} icon={<Share size={18} />}>
                اضغط على زر <strong>المشاركة</strong> <Share size={14} className="inline mx-1" /> أسفل الشاشة في Safari
              </Step>
              <Step number={2} icon={<Plus size={18} />}>
                مرّر للأسفل واضغط <strong>"إضافة إلى الشاشة الرئيسية"</strong>
              </Step>
              <Step number={3} icon={<CheckCircle2 size={18} />}>
                اضغط <strong>"إضافة"</strong> في الأعلى
              </Step>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {!isIOS && !isInstalled && !deferredPrompt && (
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={20} className="text-gold" />
              <h2 className="font-bold font-naskh text-lg">التثبيت على أندرويد</h2>
            </div>
            <div className="space-y-3">
              <Step number={1} icon={<MoreVertical size={18} />}>
                اضغط على <strong>القائمة</strong> <MoreVertical size={14} className="inline mx-1" /> (ثلاث نقاط) في Chrome
              </Step>
              <Step number={2} icon={<Download size={18} />}>
                اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>
              </Step>
              <Step number={3} icon={<CheckCircle2 size={18} />}>
                اضغط <strong>"تثبيت"</strong> للتأكيد
              </Step>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-bold font-naskh text-lg mb-4 text-center">مميزات التطبيق</h2>
          <div className="grid grid-cols-2 gap-3">
            <Feature icon="📖" title="تصفح سهل" desc="تصفح المصحف بسهولة" />
            <Feature icon="🔖" title="حفظ الموضع" desc="استكمل من حيث توقفت" />
            <Feature icon="📱" title="بدون إنترنت" desc="يعمل بدون اتصال" />
            <Feature icon="🌙" title="وضع مريح" desc="مناسب للقراءة الليلية" />
          </div>
        </div>

        {/* Back to Quran */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-naskh font-bold transition-transform active:scale-95"
        >
          <BookOpen size={18} />
          العودة للمصحف
        </Link>
      </div>
    </div>
  );
};

const Step = ({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full gradient-islamic flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
      {number}
    </div>
    <p className="text-sm font-naskh text-foreground pt-1">{children}</p>
  </div>
);

const Feature = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="font-bold font-naskh text-sm">{title}</span>
    <span className="text-xs text-muted-foreground font-naskh">{desc}</span>
  </div>
);

export default Install;
