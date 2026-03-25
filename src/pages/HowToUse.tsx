import { Link } from "react-router-dom";
import { BookOpen, Download, Headphones, Shield, Settings, Smartphone, WifiOff, Hand, Moon, Heart, ListMusic, Star, Maximize, Bell } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: <BookOpen size={22} />,
    title: "تصفح الأجزاء",
    desc: "من الصفحة الرئيسية، اضغط على أي جزء لفتحه وقراءة صفحاته. يمكنك التكبير والتصغير والتنقل بين الصفحات بالسحب.",
  },
  {
    icon: <Maximize size={22} />,
    title: "وضع ملء الشاشة",
    desc: "أثناء قراءة الجزء، اضغط زر ملء الشاشة (أسفل يسار الصفحة) للقراءة بدون أي أشرطة. انقر على الشاشة لإظهار/إخفاء الأزرار، واضغط زر التصغير للخروج.",
  },
  {
    icon: <Download size={22} />,
    title: "التحميل للأوفلاين",
    desc: "اضغط على زر التحميل (⬇) بجانب أي جزء لتحميله، أو اضغط مطولاً على بطاقة الجزء. يمكنك أيضاً تحميل المصحف كاملاً من الزر المخصص.",
  },
  {
    icon: <WifiOff size={22} />,
    title: "مؤشر الأوفلاين",
    desc: "كل بطاقة جزء تعرض مؤشراً يوضح حالة التحميل: \"متاح أوفلاين\" (أخضر)، \"جزئياً\" (ذهبي)، أو \"غير محمّل\" (رمادي). تظهر رسالة تنبيه عند انقطاع أو عودة الاتصال.",
  },
  {
    icon: <Hand size={22} />,
    title: "العلامة المرجعية",
    desc: "يتم حفظ موضع قراءتك تلقائياً. عند العودة للصفحة الرئيسية ستجد زر \"أكمل القراءة\" للاستئناف من حيث توقفت.",
  },
  {
    icon: <Headphones size={22} />,
    title: "التلاوات",
    desc: "اختر قارئاً من صفحة التلاوات واستمع لأي سورة. يمكنك تحميل التلاوات للاستماع بدون إنترنت، واستئناف آخر تلاوة من حيث توقفت.",
  },
  {
    icon: <Heart size={22} />,
    title: "المفضلة",
    desc: "اضغط على القلب (❤️) بجانب أي سورة لإضافتها للمفضلة، أو النجمة (⭐) بجانب أي قارئ لتفضيله. يمكنك تصفح كل المفضلات من صفحة المفضلة مع تبويبات منفصلة للأجزاء والأذكار والتلاوات والقراء.",
  },
  {
    icon: <ListMusic size={22} />,
    title: "قوائم التشغيل",
    desc: "من تبويب \"قوائم التشغيل\" في صفحة التلاوات: استخدم القوائم الجاهزة (سور قصيرة، الرقية، قبل النوم...) أو أنشئ قوائم مخصصة. اضغط (+) بجانب أي سورة لإضافتها لقائمة، ثم شغّل القائمة كبلاي ليست متتالية.",
  },
  {
    icon: <Star size={22} />,
    title: "تفضيل القراء",
    desc: "اضغط على النجمة (⭐) بجانب اسم أي قارئ لتفضيله. يظهر القراء المفضلون في قسم خاص بصفحة المفضلة للوصول السريع.",
  },
  {
    icon: <Shield size={22} />,
    title: "الأذكار",
    desc: "تصفح أذكار الصباح والمساء والنوم وغيرها. اضغط على العداد لتتبع تكرارك، ويُحفظ تلقائياً. يمكنك إضافة أي ذكر للمفضلة بالقلب.",
  },
  {
    icon: <Moon size={22} />,
    title: "الوضع الداكن والإعتام",
    desc: "من الإعدادات أو زر القمر أثناء القراءة: فعّل الوضع الداكن. استخدم شريط تمرير \"شدة الإعتام\" لضبط سطوع صفحات المصحف حسب راحة عينيك (من 30% إلى 100%).",
  },
  {
    icon: <Bell size={22} />,
    title: "التنبيهات",
    desc: "فعّل تنبيهات أذكار الصباح والمساء وورد القرآن اليومي من الإعدادات. حدد الوقت المناسب لكل تنبيه وسيذكرك التطبيق تلقائياً.",
  },
  {
    icon: <Settings size={22} />,
    title: "الإعدادات",
    desc: "غيّر المظهر بين الفاتح والداكن والبني الدافئ، وتحكم في حجم خط الأذكار وشدة إعتام صفحات المصحف من صفحة الإعدادات.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "تثبيت التطبيق",
    desc: "يمكنك تثبيت الموقع كتطبيق على هاتفك من صفحة \"التطبيق\" في القائمة السفلية للوصول السريع والعمل بدون إنترنت.",
  },
];

const HowToUse = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
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
            <span className="text-[10px] font-bold text-gold/80 uppercase tracking-[0.4em]">دليل المستخدم الشامل</span>
            <div className="h-px w-12 bg-gradient-to-r from-gold/50 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-[2rem] bg-gold/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-gold/30 shadow-gold-glow">
              <Hand size={32} className="text-gold" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
              دليل <span className="italic font-light text-gold/80">الاستخدام</span>
            </h1>
            
            <p className="text-white/80 font-serif italic text-lg max-w-xl mx-auto leading-relaxed">
              تعرف على أسرار ومميزات التطبيق لتجعل من وردك اليومي رحلة إيمانية متكاملة وسهلة
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

      <main className="container max-w-3xl mx-auto px-6 -mt-12 relative z-20 space-y-4">
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
              <p className="font-naskh text-xs text-muted-foreground/90 leading-relaxed">{step.desc}</p>
            </div>
            <span className="font-amiri text-2xl text-accent/60 font-bold shrink-0 leading-none mt-1">
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
