import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Baby, 
  Heart, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Shield, 
  MapPin, 
  Star, 
  BookOpen, 
  Sun,
  Moon,
  Flag,
  Trophy,
  History
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";

interface SeerahEvent {
  id: number;
  yearGregorian: string;
  yearHijri: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: "early" | "prophethood" | "migration" | "medina" | "final";
  icon: React.ReactNode;
}

const seerahEvents: SeerahEvent[] = [
  {
    id: 1,
    yearGregorian: "570 CE",
    yearHijri: "52 BH",
    titleEn: "Birth of the Prophet (PBUH)",
    titleAr: "مولد النبي صلى الله عليه وسلم",
    descriptionEn: "Born in Mecca in the Year of the Elephant. He was orphaned at a young age and raised by his grandfather Abdul Muttalib and later his uncle Abu Talib.",
    descriptionAr: "وُلد في مكة المكرمة في عام الفيل. نشأ يتيماً وكفله جده عبد المطلب ثم عمه أبو طالب.",
    category: "early",
    icon: <Baby className="w-6 h-6" />
  },
  {
    id: 2,
    yearGregorian: "595 CE",
    yearHijri: "25 BH",
    titleEn: "Marriage to Khadijah (RA)",
    titleAr: "زواجه من خديجة رضي الله عنها",
    descriptionEn: "At the age of 25, he married Khadijah bint Khuwaylid, a noble and successful businesswoman who became his greatest supporter.",
    descriptionAr: "في سن الخامسة والعشرين، تزوج من خديجة بنت خويلد، وهي سيدة نبيلة وناجحة في التجارة، وكانت أكبر داعم له.",
    category: "early",
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 3,
    yearGregorian: "610 CE",
    yearHijri: "13 BH",
    titleEn: "The First Revelation",
    titleAr: "نزول الوحي الأول",
    descriptionEn: "At the age of 40, in the Cave of Hira, the Angel Jibril (Gabriel) brought the first verses of the Quran: 'Read in the name of your Lord...'",
    descriptionAr: "في سن الأربعين، في غار حراء، نزل عليه الملك جبريل بأول آيات القرآن الكريم: 'اقرأ باسم ربك الذي خلق...'",
    category: "prophethood",
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: 4,
    yearGregorian: "613 CE",
    yearHijri: "10 BH",
    titleEn: "Public Preaching Begins",
    titleAr: "بدء الدعوة الجهرية",
    descriptionEn: "After three years of secret preaching, the Prophet (PBUH) was commanded to invite the people of Mecca publicly to Islam at Mount Safa.",
    descriptionAr: "بعد ثلاث سنوات من الدعوة السرية، أُمر النبي صلى الله عليه وسلم بدعوة أهل مكة علانية إلى الإسلام من فوق جبل الصفا.",
    category: "prophethood",
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 5,
    yearGregorian: "615 CE",
    yearHijri: "8 BH",
    titleEn: "Migration to Abyssinia",
    titleAr: "الهجرة إلى الحبشة",
    descriptionEn: "Due to intense persecution, a group of Muslims migrated to Abyssinia (Ethiopia) where the Christian King Negus granted them protection.",
    descriptionAr: "بسبب الاضطهاد الشديد، هاجرت مجموعة من المسلمين إلى الحبشة حيث منحهم الملك النجاشي الحماية.",
    category: "prophethood",
    icon: <ArrowRight className="w-6 h-6" />
  },
  {
    id: 6,
    yearGregorian: "619 CE",
    yearHijri: "3 BH",
    titleEn: "Year of Sorrow",
    titleAr: "عام الحزن",
    descriptionEn: "The Prophet (PBUH) lost his beloved wife Khadijah (RA) and his protective uncle Abu Talib in the same year.",
    descriptionAr: "فقد النبي صلى الله عليه وسلم زوجته الحبيبة خديجة رضي الله عنها وعمه الحامي أبو طالب في نفس العام.",
    category: "prophethood",
    icon: <Moon className="w-6 h-6" />
  },
  {
    id: 7,
    yearGregorian: "621 CE",
    yearHijri: "1 BH",
    titleEn: "Isra and Mi'raj",
    titleAr: "الإسراء والمعراج",
    descriptionEn: "The miraculous night journey from Mecca to Jerusalem and the ascension to the heavens, where the five daily prayers were ordained.",
    descriptionAr: "رحلة ليلية معجزة من مكة إلى القدس ثم العروج إلى السماوات العلا، حيث فُرضت الصلوات الخمس.",
    category: "prophethood",
    icon: <Star className="w-6 h-6" />
  },
  {
    id: 8,
    yearGregorian: "622 CE",
    yearHijri: "1 AH",
    titleEn: "The Hijrah (Migration to Medina)",
    titleAr: "الهجرة النبوية إلى المدينة",
    descriptionEn: "The Prophet (PBUH) and his companions migrated to Yathrib (Medina), marking the beginning of the Islamic calendar (Hijri).",
    descriptionAr: "هاجر النبي صلى الله عليه وسلم وأصحابه إلى يثرب (المدينة المنورة)، مما مثل بداية التقويم الهجري.",
    category: "migration",
    icon: <MapPin className="w-6 h-6" />
  },
  {
    id: 9,
    yearGregorian: "624 CE",
    yearHijri: "2 AH",
    titleEn: "Battle of Badr",
    titleAr: "غزوة بدر",
    descriptionEn: "The first major battle between Muslims and the Quraysh, resulting in a decisive victory for the Muslims despite being outnumbered.",
    descriptionAr: "أول معركة كبرى بين المسلمين وقريش، وانتهت بنصر حاسم للمسلمين رغم قلة عددهم.",
    category: "medina",
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 10,
    yearGregorian: "628 CE",
    yearHijri: "6 AH",
    titleEn: "Treaty of Hudaybiyyah",
    titleAr: "صلح الحديبية",
    descriptionEn: "A ten-year peace treaty between the Muslims and the Quraysh, which paved the way for the spread of Islam across Arabia.",
    descriptionAr: "معاهدة سلام لمدة عشر سنوات بين المسلمين وقريش، مهدت الطريق لانتشار الإسلام في جميع أنحاء الجزيرة العربية.",
    category: "medina",
    icon: <Flag className="w-6 h-6" />
  },
  {
    id: 11,
    yearGregorian: "630 CE",
    yearHijri: "8 AH",
    titleEn: "Conquest of Mecca",
    titleAr: "فتح مكة",
    descriptionEn: "The Prophet (PBUH) entered Mecca peacefully with a large army. He granted a general amnesty to his former enemies and purified the Kaaba.",
    descriptionAr: "دخل النبي صلى الله عليه وسلم مكة بسلام مع جيش كبير، ومنح عفواً عاماً لأعدائه السابقين وطهر الكعبة من الأصنام.",
    category: "medina",
    icon: <Trophy className="w-6 h-6" />
  },
  {
    id: 12,
    yearGregorian: "632 CE",
    yearHijri: "10 AH",
    titleEn: "Farewell Pilgrimage",
    titleAr: "حجة الوداع",
    descriptionEn: "The Prophet (PBUH) performed his final Hajj and delivered the Farewell Sermon, emphasizing equality, justice, and the completion of the religion.",
    descriptionAr: "أدى النبي صلى الله عليه وسلم حجته الأخيرة وألقى خطبة الوداع، مؤكداً على المساواة والعدالة وإتمام الدين.",
    category: "final",
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 13,
    yearGregorian: "632 CE",
    yearHijri: "11 AH",
    titleEn: "Passing of the Prophet (PBUH)",
    titleAr: "وفاة النبي صلى الله عليه وسلم",
    descriptionEn: "The Prophet (PBUH) passed away in Medina at the age of 63, leaving behind a legacy that transformed the world.",
    descriptionAr: "توفي النبي صلى الله عليه وسلم في المدينة المنورة عن عمر يناهز ٦٣ عاماً، تاركاً وراءه إرثاً غير وجه العالم.",
    category: "final",
    icon: <Sun className="w-6 h-6" />
  }
];

const SeerahTimeline = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const getCategoryColor = (category: SeerahEvent["category"]) => {
    switch (category) {
      case "early": return "bg-amber-500";
      case "prophethood": return "bg-emerald-500";
      case "migration": return "bg-blue-500";
      case "medina": return "bg-rose-500";
      case "final": return "bg-indigo-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "السيرة النبوية" : "Seerah Timeline"} 
        subtitle={isAr ? "رحلة عبر حياة خير البشر صلى الله عليه وسلم" : "A journey through the life of the best of mankind (PBUH)"}
        variant="compact" 
      />

      <div className="max-w-5xl mx-auto px-4 mt-12 relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/60 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12 md:space-y-24">
          {seerahEvents.map((event, idx) => (
            <ScrollReveal key={event.id} delay={idx * 0.1}>
              <div className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                {/* Year Marker (Oversized Typographic) */}
                <div className={`w-full md:w-1/2 flex ${idx % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                  <div className={`text-center ${idx % 2 === 0 ? "md:text-end" : "md:text-start"}`}>
                    <h2 className="text-6xl md:text-8xl font-serif font-black text-muted-foreground/10 leading-none select-none">
                      {event.yearGregorian.split(" ")[0]}
                    </h2>
                    <p className="text-sm font-bold tracking-widest uppercase text-primary mt-2">
                      {isAr ? event.yearHijri : event.yearHijri}
                    </p>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${getCategoryColor(event.category)} text-white flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-background`}>
                    {event.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-1/2 flex ${idx % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}>
                  <div className="bento-card !p-8 group hover:border-primary/30 transition-all duration-500 w-full max-w-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white ${getCategoryColor(event.category)}`}>
                          {isAr ? (
                            event.category === "early" ? "البدايات" :
                            event.category === "prophethood" ? "النبوة" :
                            event.category === "migration" ? "الهجرة" :
                            event.category === "medina" ? "المدينة" : "الختام"
                          ) : event.category}
                        </span>
                        <History className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-2xl font-bold font-naskh leading-tight group-hover:text-primary transition-colors">
                        {isAr ? event.titleAr : event.titleEn}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-naskh text-sm">
                        {isAr ? event.descriptionAr : event.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-24 p-8 rounded-[2.5rem] bg-muted/30 border border-border/40 flex flex-wrap justify-center gap-6">
          {[
            { label: isAr ? "البدايات" : "Early Life", cat: "early" },
            { label: isAr ? "النبوة" : "Prophethood", cat: "prophethood" },
            { label: isAr ? "الهجرة" : "Migration", cat: "migration" },
            { label: isAr ? "المدينة" : "Medina", cat: "medina" },
            { label: isAr ? "الختام" : "Final Years", cat: "final" },
          ].map((item) => (
            <div key={item.cat} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.cat as SeerahEvent["category"])}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeerahTimeline;
