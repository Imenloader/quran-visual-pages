import React from "react";
import { useTranslation } from "react-i18next";
import { Heart, Star, Sparkles, BookOpen } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";

const Virtues = () => {
  const { t } = useTranslation();

  const virtues = [
    {
      title: "شهر نزول القرآن",
      description: "فيه أنزل الله القرآن الكريم هدى للناس وبينات من الهدى والفرقان.",
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "تضاعف الأجور",
      description: "تضاعف فيه الحسنات، وتفتح فيه أبواب الجنة، وتغلق فيه أبواب النار.",
      icon: <Sparkles className="w-6 h-6 text-amber-500" />
    },
    {
      title: "ليلة القدر",
      description: "فيه ليلة القدر التي هي خير من ألف شهر.",
      icon: <Star className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "مغفرة الذنوب",
      description: "من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه.",
      icon: <Heart className="w-6 h-6 text-rose-500" />
    }
  ];

  return (
    <RamadanSectionLayout 
      title={t("ramadan.virtues")} 
      subtitle={t("ramadan.virtuesDesc")}
      icon={<Heart className="w-10 h-10 text-white" />}
      color="bg-rose-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {virtues.map((virtue, idx) => (
          <ScrollReveal key={idx} delay={0.2 + idx * 0.1}>
            <div className="bento-card !p-8 h-full flex flex-col items-center text-center space-y-4 border border-border/40 hover:shadow-lg transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                {virtue.icon}
              </div>
              <h3 className="text-xl font-bold font-serif">{virtue.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {virtue.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </RamadanSectionLayout>
  );
};

export default Virtues;
