import { useState } from "react";
import { Heart, FileText, Home, Sparkles, ChevronRight, BookOpen, Quote, Info } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { MARRIAGE_CATEGORIES, MARRIAGE_ADVICE, MarriageAdvice } from "@/data/marriageData";
import ExerciseModal from "@/components/ExerciseModal"; // Reuse for now, maybe rename later

const MarriageGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState(MARRIAGE_CATEGORIES[0].id);
  const [activeAdvice, setActiveAdvice] = useState<MarriageAdvice | null>(null);

  const filteredAdvice = MARRIAGE_ADVICE.filter(a => a.categoryId === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <QuranHeader 
        title="دليل الزواج الإسلامي" 
        subtitle="وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا" 
        variant="compact" 
      />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="h-10 w-[1px] bg-amber-200/40" />
          <p className="text-sm text-amber-800/60 font-naskh font-medium">بناء الأسرة المسلمة على الكتاب والسنة</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero/Introduction */}
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-800 to-emerald-950 p-10 text-white shadow-2xl shadow-emerald-900/20">
                <div className="absolute -bottom-10 -right-10 opacity-10">
                  <Heart className="w-64 h-64 fill-white" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/10">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100">ميثاق غليظ</span>
                  </div>
                  <h2 className="text-4xl font-bold font-naskh leading-tight">الزواج آية من آيات الله</h2>
                  <p className="text-emerald-50/80 max-w-xl text-lg leading-relaxed font-naskh italic">
                    "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Category Navigation */}
            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {MARRIAGE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all border ${
                       selectedCategory === cat.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20 scale-105"
                        : "bg-white text-emerald-900 border-emerald-100 hover:border-emerald-300 shadow-sm"
                    }`}
                  >
                    <div className={`${selectedCategory === cat.id ? 'text-white' : 'text-emerald-600'}`}>
                      {getIcon(cat.icon)}
                    </div>
                    <span className="text-sm font-bold font-naskh text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAdvice.map((advice, idx) => (
                <ScrollReveal key={advice.id} delay={idx * 100}>
                  <div className="bg-white border border-emerald-100/60 rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-emerald-100/50 transition-colors" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="font-bold font-naskh text-xl text-emerald-900 mb-2 group-hover:text-emerald-700 transition-colors">
                          {advice.title}
                        </h3>
                        <p className="text-sm text-emerald-800/60 font-naskh leading-relaxed line-clamp-2">
                          {advice.content}
                        </p>
                      </div>

                      {advice.evidence && (
                        <div className="mt-auto mb-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-900 italic text-xs font-naskh leading-relaxed">
                          <Quote className="w-4 h-4 text-amber-300 mb-2" />
                          {advice.evidence}
                        </div>
                      )}

                      <button 
                        onClick={() => setActiveAdvice(advice)}
                        className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm font-naskh flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        التفاصيل والأحكام
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Sidebar / Extra Tips */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <div className="bg-white border border-amber-200/50 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-amber-600">
                  <Info className="w-6 h-6" />
                  <h3 className="font-bold text-lg font-naskh">نصيحة عامة</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <p className="text-sm font-naskh text-amber-900 leading-relaxed">
                      الزواج رحلة من الصبر والمجاهدة، فاستعن بالله واجعل المودة والرحمة شعارك في كل موقف.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <p className="text-sm font-naskh text-emerald-900 leading-relaxed">
                      تعلم فن التغافل عن الهفوات البسيطة، وركز على نقاط القوة في شريك حياتك.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-amber-600 p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Heart className="w-24 h-24" />
                </div>
                <h4 className="font-bold text-xl font-naskh mb-4">حديث نبوي</h4>
                <p className="text-amber-50 font-naskh leading-relaxed italic">
                  "خيركم خيركم لأهله، وأنا خيركم لأهلي"
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">رواه الترمذي</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Details Modal (Reusing ExerciseModal for consistency) */}
      {activeAdvice && (
        <ExerciseModal
          item={{
            id: activeAdvice.id,
            name: activeAdvice.title,
            content: activeAdvice.content,
            steps: activeAdvice.points,
            // Mocking needed fields for Exercise interface
            target: activeAdvice.evidence || '',
            image: '', 
            difficulty: '',
            description: activeAdvice.content
          }}
          onClose={() => setActiveAdvice(null)}
        />
      )}
    </div>
  );
};

export default MarriageGuide;
