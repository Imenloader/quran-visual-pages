import React from "react";
import { useTranslation } from "react-i18next";
import { Moon, Star, Sparkles, Heart } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";

const LaylatulQadr = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: "خير من ألف شهر",
      description: "العبادة فيها تعادل عبادة أكثر من 83 سنة.",
      icon: <Star className="w-6 h-6 text-gold" />
    },
    {
      title: "تنزّل الملائكة",
      description: "تتنزل فيها الملائكة والروح جبريل عليه السلام بالرحمة والبركة.",
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "سلام حتى مطلع الفجر",
      description: "هي ليلة سلام وأمان وطمأنينة للمؤمنين.",
      icon: <Heart className="w-6 h-6 text-rose-500" />
    }
  ];

  return (
    <RamadanSectionLayout 
      title={t("ramadan.laylatulQadr")} 
      subtitle={t("ramadan.laylatulQadrDesc")}
      icon={<Moon className="w-10 h-10 text-white" />}
      color="bg-purple-600"
    >
      <div className="space-y-8">
        <ScrollReveal delay={0.2}>
          <div className="bento-card !p-12 text-center space-y-6 border border-border/40 bg-card/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 pattern-islamic opacity-5" />
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary">علامات ليلة القدر</h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              أن تكون ليلة سمحة، طلقة، لا حارة ولا باردة، تصبح الشمس صبيحتها ضعيفة حمراء.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <ScrollReveal key={idx} delay={0.3 + idx * 0.1}>
              <div className="bento-card !p-8 h-full flex flex-col items-center text-center space-y-4 border border-border/40 hover:shadow-lg transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-serif">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </RamadanSectionLayout>
  );
};

export default LaylatulQadr;
