import { Link } from "react-router-dom";
import { BookOpen, Download, Headphones, Shield, Settings, Smartphone, Wifi, WifiOff, Hand, Moon, Type, RotateCcw } from "lucide-react";

const steps = [
  {
    icon: <BookOpen size={22} />,
    title: "تصفح الأجزاء",
    desc: "من الصفحة الرئيسية، اضغط على أي جزء لفتحه وقراءة صفحاته. يمكنك التكبير والتصغير والتنقل بين الصفحات بالسحب.",
  },
  {
    icon: <Download size={22} />,
    title: "التحميل للأوفلاين",
    desc: "اضغط على زر التحميل (⬇) بجانب أي جزء لتحميله، أو اضغط مطولاً على بطاقة الجزء. يمكنك أيضاً تحميل المصحف كاملاً من الزر المخصص.",
  },
  {
    icon: <WifiOff size={22} />,
    title: "مؤشر الأوفلاين",
    desc: "كل بطاقة جزء تعرض مؤشراً يوضح حالة التحميل: \"متاح أوفلاين\" (أخضر)، \"جزئياً\" (ذهبي)، أو \"غير محمّل\" (رمادي).",
  },
  {
    icon: <Hand size={22} />,
    title: "العلامة المرجعية",
    desc: "يتم حفظ موضع قراءتك تلقائياً. عند العودة للصفحة الرئيسية ستجد زر \"أكمل القراءة\" للاستئناف من حيث توقفت.",
  },
  {
    icon: <Headphones size={22} />,
    title: "التلاوات",
    desc: "اختر قارئاً من صفحة التلاوات واستمع لأي سورة. يمكنك تحميل التلاوات للاستماع بدون إنترنت.",
  },
  {
    icon: <Shield size={22} />,
    title: "الأذكار",
    desc: "تصفح أذكار الصباح والمساء والنوم وغيرها. اضغط على العداد لتتبع تكرارك، ويُحفظ تلقائياً.",
  },
  {
    icon: <Settings size={22} />,
    title: "الإعدادات",
    desc: "غيّر المظهر بين الفاتح والداكن والبني الدافئ، وتحكم في حجم خط الأذكار من صفحة الإعدادات.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "تثبيت التطبيق",
    desc: "يمكنك تثبيت الموقع كتطبيق على هاتفك من صفحة \"التطبيق\" في القائمة السفلية للوصول السريع.",
  },
];

const HowToUse = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="pb-6 pt-4">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">كيفية الاستخدام</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">دليل سريع لاستخدام جميع مميزات التطبيق</p>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 bg-card border border-border rounded-2xl p-4 shadow-soft"
          >
            <div className="w-11 h-11 rounded-xl gradient-islamic flex items-center justify-center shrink-0 text-primary-foreground">
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-naskh text-sm font-bold text-foreground mb-1">{step.title}</h3>
              <p className="font-naskh text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
            <span className="font-amiri text-2xl text-accent/30 font-bold shrink-0 leading-none mt-1">
              {i + 1}
            </span>
          </div>
        ))}

        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 gradient-islamic text-primary-foreground px-6 py-3 rounded-xl font-naskh text-sm font-bold shadow-islamic hover:opacity-90 transition-all active:scale-95"
          >
            <BookOpen size={16} />
            ابدأ القراءة الآن
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowToUse;