import { motion } from "framer-motion";
import QuranHeader from "@/components/QuranHeader";
import { Book, Info, Sparkles, Star, Heart, Bookmark, List, Search, BookOpen, Shield, Zap } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const tajweedRules = [
  {
    title: "أحكام النون الساكنة والتنوين",
    description: "تتكون من أربعة أحكام: الإظهار، الإدغام، الإقلاب، والإخفاء.",
    rules: [
      { name: "الإظهار الحلقي", detail: "إخراج الحرف من مخرجه بغير غنة ظاهر في الحرف المظهر. حروفه: ء، هـ، ع، ح، غ، خ." },
      { name: "الإدغام", detail: "دمج النون الساكنة أو التنوين في الحرف الذي يليها. حروفه: ي، ر، م، ل، و، ن (يرملون)." },
      { name: "الإقلاب", detail: "قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة حرف الباء." },
      { name: "الإخفاء الحقيقي", detail: "نطق الحرف بحالة بين الإظهار والإدغام مع بقاء الغنة. حروفه باقي الحروف." }
    ]
  },
  {
    title: "أحكام الميم الساكنة",
    description: "تتكون من ثلاثة أحكام: الإخفاء الشفوي، إدغام المثلين الصغير، والإظهار الشفوي.",
    rules: [
      { name: "الإخفاء الشفوي", detail: "إخفاء الميم الساكنة عند حرف الباء مع الغنة." },
      { name: "إدغام المثلين الصغير", detail: "إدغام الميم الساكنة في ميم متحركة تليها مع الغنة." },
      { name: "الإظهار الشفوي", detail: "إظهار الميم الساكنة عند باقي الحروف الهجائية ما عدا الباء والميم." }
    ]
  },
  {
    title: "أحكام المد",
    description: "إطالة الصوت بحرف من حروف المد (الأيف، الواو، الياء).",
    rules: [
      { name: "المد الطبيعي", detail: "المد الذي لا تقوم ذات الحرف إلا به، ومقداره حركتان." },
      { name: "المد المتصل", detail: "أن يأتي حرف المد وبعده همزة في كلمة واحدة، ومقداره 4 أو 5 حركات." },
      { name: "المد المنفصل", detail: "أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية، ومقداره 4 أو 5 حركات." },
      { name: "المد اللازم", detail: "أن يأتي بعد حرف المد سكون أصلي ثابت، ومقداره 6 حركات." }
    ]
  },
  {
    title: "أحكام القلقلة",
    description: "اضطراب الصوت عند النطق بالحرف الساكن حتى يسمع له نبرة قوية.",
    rules: [
      { name: "حروف القلقلة", detail: "مجموعة في كلمة (قطب جد): ق، ط، ب، ج، د." },
      { name: "مراتب القلقلة", detail: "قلقلة كبرى (عند الوقف على الحرف المشدد)، وسطى (عند الوقف على الحرف غير المشدد)، صغرى (في وسط الكلمة)." }
    ]
  }
];

const Tajweed = () => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader title="أحكام التجويد" showBack />
      
      <main className="container max-w-5xl mx-auto px-6 mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto mb-6 shadow-inner">
            <Book size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 text-primary">دليل أحكام التجويد</h1>
          <p className="text-muted-foreground font-naskh text-lg max-w-2xl mx-auto leading-relaxed">
            تعلم قواعد التجويد الأساسية لتحسين تلاوتك للقرآن الكريم وإتقان مخارج الحروف والصفات.
          </p>
        </motion.div>

        <div className="space-y-12">
          {tajweedRules.map((section, idx) => (
            <ScrollReveal key={idx} index={idx}>
              <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-[3rem] p-8 md:p-12 shadow-islamic">
                <div className="flex items-center gap-4 mb-8 ornament-border pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <Sparkles size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-medium text-primary">{section.title}</h2>
                    <p className="text-sm text-muted-foreground font-naskh mt-1">{section.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.rules.map((rule, rIdx) => (
                    <div 
                      key={rIdx}
                      className="p-6 rounded-[2rem] bg-background/50 border border-border/20 hover:border-accent/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                          <Star size={16} fill="currentColor" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-primary">{rule.name}</h3>
                      </div>
                      <p className="text-muted-foreground font-naskh text-sm leading-relaxed">
                        {rule.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-10 rounded-[3rem] bg-emerald-deep text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 pattern-islamic opacity-[0.05]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center text-gold shrink-0">
              <Info size={48} strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-medium">نصيحة للمتعلم</h3>
              <p className="font-naskh text-lg leading-relaxed">
                التجويد علم يؤخذ بالتلقي والمشافهة من أفواه المتقنين، فاحرص على القراءة على شيخ أو معلم متقن لتصحيح تلاوتك وضبط مخارج حروفك.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Tajweed;
