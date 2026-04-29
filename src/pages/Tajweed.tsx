import QuranHeader from "@/components/QuranHeader";
import { Book, Info, Sparkles, Star, Heart, Bookmark, List, Search, BookOpen, Shield, Zap, Mic2, Music, Volume2, Headphones, Play, Eye, EyeOff } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const tajweedRules = [
  {
    id: "noon",
    title: "أحكام النون الساكنة والتنوين",
    description: "تتكون من أربعة أحكام: الإظهار، الإدغام، الإقلاب، والإخفاء.",
    color: "emerald",
    icon: <Sparkles size={24} strokeWidth={1.5} />,
    rules: [
      { name: "الإظهار الحلقي", detail: "إخراج الحرف من مخرجه بغير غنة ظاهر في الحرف المظهر. حروفه: ء، هـ، ع، ح، غ، خ.", example: "مَنْ آمَنَ", highlight: "نْ آ" },
      { name: "الإدغام", detail: "دمج النون الساكنة أو التنوين في الحرف الذي يليها. حروفه: ي، ر، م، ل، و، ن (يرملون).", example: "مَنْ يَقُولُ", highlight: "نْ ي" },
      { name: "الإقلاب", detail: "قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة حرف الباء.", example: "مِنْ بَعْدِ", highlight: "نْ ب" },
      { name: "الإخفاء الحقيقي", detail: "نطق الحرف بحالة بين الإظهار والإدغام مع بقاء الغنة. حروفه باقي الحروف.", example: "مِنْ قَبْلِ", highlight: "نْ ق" }
    ]
  },
  {
    id: "meem",
    title: "أحكام الميم الساكنة",
    description: "تتكون من ثلاثة أحكام: الإخفاء الشفوي، إدغام المثلين الصغير، والإظهار الشفوي.",
    color: "blue",
    icon: <Shield size={24} strokeWidth={1.5} />,
    rules: [
      { name: "الإخفاء الشفوي", detail: "إخفاء الميم الساكنة عند حرف الباء مع الغنة.", example: "تَرْمِيهِمْ بِحِجَارَةٍ", highlight: "مْ ب" },
      { name: "إدغام المثلين الصغير", detail: "إدغام الميم الساكنة في ميم متحركة تليها مع الغنة.", example: "لَهُمْ مَا يَشَاءُونَ", highlight: "مْ م" },
      { name: "الإظهار الشفوي", detail: "إظهار الميم الساكنة عند باقي الحروف الهجائية ما عدا الباء والميم.", example: "لَكُمْ دِينُكُمْ", highlight: "مْ د" }
    ]
  },
  {
    id: "mad",
    title: "أحكام المد",
    description: "إطالة الصوت بحرف من حروف المد (الأيف، الواو، الياء).",
    color: "amber",
    icon: <Zap size={24} strokeWidth={1.5} />,
    rules: [
      { name: "المد الطبيعي", detail: "المد الذي لا تقوم ذات الحرف إلا به، ومقداره حركتان.", example: "قَالَ، يَقُولُ، قِيلَ", highlight: "ا، و، ي" },
      { name: "المد المتصل", detail: "أن يأتي حرف المد وبعده همزة في كلمة واحدة، ومقداره 4 أو 5 حركات.", example: "السَّمَاءُ", highlight: "اءُ" },
      { name: "المد المنفصل", detail: "أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية، ومقداره 4 أو 5 حركات.", example: "يَا أَيُّهَا", highlight: "ا أ" },
      { name: "المد اللازم", detail: "أن يأتي بعد حرف المد سكون أصلي ثابت، ومقداره 6 حركات.", example: "الضَّالِّينَ", highlight: "الِّ" }
    ]
  },
  {
    id: "qalqalah",
    title: "أحكام القلقلة",
    description: "اضطراب الصوت عند النطق بالحرف الساكن حتى يسمع له نبرة قوية.",
    color: "rose",
    icon: <Volume2 size={24} strokeWidth={1.5} />,
    rules: [
      { name: "حروف القلقلة", detail: "مجموعة في كلمة (قطب جد): ق، ط، ب، ج، د.", example: "الْفَلَقِ، مُحِيطٌ", highlight: "قِ، طٌ" },
      { name: "مراتب القلقلة", detail: "قلقلة كبرى (عند الوقف على الحرف المشدد)، وسطى (عند الوقف على الحرف غير المشدد)، صغرى (في وسط الكلمة).", example: "الْحَقُّ، الْحَجُّ", highlight: "قُّ، جُّ" }
    ]
  }
];

const PRACTICE_VERSES = [
  {
    surah: "سورة الإخلاص",
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ . لَمْ يَلِدْ وَلَمْ يُولَدْ . وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    highlights: [
      { text: "أَحَدٌ", rule: "قلقلة كبرى (عند الوقف)", color: "text-rose-500" },
      { text: "يَلِدْ", rule: "قلقلة صغرى", color: "text-rose-500" },
      { text: "يُولَدْ", rule: "قلقلة كبرى (عند الوقف)", color: "text-rose-500" },
      { text: "يَكُنْ لَهُ", rule: "إدغام بغير غنة", color: "text-emerald-500" },
      { text: "كُفُوًا أَحَدٌ", rule: "إظهار حلقي", color: "text-emerald-500" },
    ]
  },
  {
    surah: "سورة الفلق",
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ . مِنْ شَرِّ مَا خَلَقَ . وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ . وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ . وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    highlights: [
      { text: "الْفَلَقِ", rule: "قلقلة كبرى", color: "text-rose-500" },
      { text: "مِنْ شَرِّ", rule: "إخفاء حقيقي", color: "text-emerald-500" },
      { text: "غَاسِقٍ إِذَا", rule: "إظهار حلقي", color: "text-emerald-500" },
      { text: "وَقَبَ", rule: "قلقلة كبرى", color: "text-rose-500" },
      { text: "النَّفَّاثَاتِ", rule: "غنة (نون مشددة)", color: "text-emerald-500" },
    ]
  }
];

const Tajweed = () => {
  const { i18n } = useTranslation();
  const [showHighlights, setShowHighlights] = useState(false);
  const [activeVerse, setActiveVerse] = useState(0);

  const renderHighlightedText = (verse: typeof PRACTICE_VERSES[0]) => {
    if (!showHighlights) return verse.text;

    let result = verse.text;
    verse.highlights.forEach(h => {
      const regex = new RegExp(`(${h.text})`, 'g');
      result = result.replace(regex, `<span class="${h.color} font-bold underline decoration-dotted underline-offset-8 cursor-help" title="${h.rule}">$1</span>`);
    });

    return <div dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-accent/20">
      <QuranHeader title="أحكام التجويد" showBack />
      
      <main className="container max-w-5xl mx-auto px-6 mt-12">
        <div 
          className="text-center mb-16"
        >
          <div className="w-24 h-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto mb-6 shadow-inner relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
            >
              <div className="w-full h-full pattern-islamic" />
            </div>
            <BookOpen size={48} strokeWidth={1.5} className="relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 text-primary tracking-tight">دليل أحكام التجويد</h1>
          <p className="text-muted-foreground font-naskh text-lg max-w-2xl mx-auto leading-relaxed">
            تعلم قواعد التجويد الأساسية لتحسين تلاوتك للقرآن الكريم وإتقان مخارج الحروف والصفات.
          </p>
        </div>

        {/* Interactive Practice Section */}
        <ScrollReveal index={0}>
          <section className="mb-24 relative">
            <div className="absolute -inset-4 bg-gold/5 rounded-[4rem] blur-3xl -z-10" />
            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-[3rem] p-8 md:p-12 shadow-islamic overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                    <Eye size={24} />
                  </div>
                  <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-2xl font-serif font-bold text-primary">تطبيق عملي تفاعلي</h2>
                    <p className="text-sm text-muted-foreground font-naskh">شاهد الأحكام مطبقة على آيات من القرآن</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHighlights(!showHighlights)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-serif font-bold transition-all ${
                      showHighlights ? 'bg-emerald-deep text-gold shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary/10'
                    }`}
                  >
                    {showHighlights ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showHighlights ? 'إخفاء التلوين' : 'إظهار التلوين'}
                  </button>
                  
                  <div className="flex gap-1">
                    {PRACTICE_VERSES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveVerse(i)}
                        className={`w-10 h-10 rounded-xl font-serif font-bold transition-all ${
                          activeVerse === i ? 'bg-gold text-emerald-deep' : 'bg-primary/5 text-primary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative p-10 md:p-16 rounded-[2.5rem] bg-background/40 border border-border/20 text-center min-h-[200px] flex flex-col justify-center">
                <div className="absolute top-6 right-8 text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full">
                  {PRACTICE_VERSES[activeVerse].surah}
                </div>
                
                <div
                  key={activeVerse + (showHighlights ? '-h' : '-n')}
                  className="text-3xl md:text-5xl font-naskh text-primary leading-[2] md:leading-[2.5] text-right"
                  dir="rtl"
                >
                  {renderHighlightedText(PRACTICE_VERSES[activeVerse])}
                </div>

                  {showHighlights && (
                    <div
                      className="mt-12 flex flex-wrap justify-center gap-3"
                    >
                      {PRACTICE_VERSES[activeVerse].highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/20 shadow-sm">
                          <div className={`w-3 h-3 rounded-full ${h.color.replace('text-', 'bg-')}`} />
                          <span className="text-xs font-serif font-bold text-primary">{h.text}:</span>
                          <span className="text-xs font-naskh text-muted-foreground">{h.rule}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <div className="space-y-16">
          {tajweedRules.map((section, idx) => (
            <ScrollReveal key={idx} index={idx + 1}>
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${
                  section.color === 'emerald' ? 'from-primary/20 to-primary/10' :
                  section.color === 'blue' ? 'from-blue-500/20 to-indigo-500/20' :
                  section.color === 'amber' ? 'from-amber-500/20 to-orange-500/20' :
                  'from-rose-500/20 to-pink-500/20'
                } rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`} />
                
                <div className="relative bg-card/60 backdrop-blur-md border border-border/40 rounded-[3rem] p-8 md:p-12 shadow-islamic overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  
                  <div className="flex items-center gap-6 mb-10 relative z-10">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                        section.color === 'emerald' ? 'bg-primary/10 text-primary' :
                        section.color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                        section.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {section.icon}
                    </div>
                    <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h2 className="text-3xl font-serif font-medium text-primary">{section.title}</h2>
                      <p className="text-base text-muted-foreground font-naskh mt-1">{section.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {section.rules.map((rule, rIdx) => (
                      <div 
                        key={rIdx}
                        className="p-8 rounded-[2.5rem] bg-background/40 border border-border/20 hover:border-accent/40 transition-all group/rule shadow-sm hover:shadow-md flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover/rule:bg-accent group-hover/rule:text-white transition-all shadow-inner">
                              <Star size={18} fill="currentColor" />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-primary">{rule.name}</h3>
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">Rule {rIdx + 1}</div>
                        </div>
                        
                        <p className="text-muted-foreground font-naskh text-base leading-relaxed mb-6">
                          {rule.detail}
                        </p>

                        {rule.example && (
                          <div className="mt-auto pt-4 border-t border-border/10">
                            <div className="text-[10px] uppercase tracking-wider text-accent mb-2 font-bold">مثال:</div>
                            <div className="text-2xl font-naskh text-primary text-right leading-loose bg-accent/5 p-4 rounded-2xl border border-accent/10">
                              {rule.example}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Tips Section */}
        <div 
          className="mt-24 p-12 rounded-[4rem] gradient-islamic text-primary-foreground relative overflow-hidden shadow-2xl group"
        >
          <div className="absolute inset-0 pattern-islamic opacity-[0.07] group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div 
              className="w-28 h-28 rounded-[2.5rem] bg-primary/10 backdrop-blur-md flex items-center justify-center text-gold shrink-0 shadow-2xl border border-primary/10"
            >
              <Info size={56} strokeWidth={1} />
            </div>
            <div className="space-y-6 text-center md:text-right">
              <h3 className="text-3xl font-serif font-medium">نصيحة للمتعلم</h3>
              <p className="font-naskh text-xl leading-relaxed opacity-90">
                التجويد علم يؤخذ بالتلقي والمشافهة من أفواه المتقنين، فاحرص على القراءة على شيخ أو معلم متقن لتصحيح تلاوتك وضبط مخارج حروفك.
              </p>
              <div className="flex justify-center md:justify-start pt-4">
                <div className="px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-sm font-serif border border-primary/5">
                  رزقنا الله وإياكم حسن التلاوة
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tajweed;
