import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Clock, BookOpen, Heart, Users, Zap } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";

const Tips = () => {
  const { t } = useTranslation();

  const tips = [
    {
      title: "تنظيم الوقت",
      description: "خصص وقتاً ثابتاً لقراءة القرآن، ووقتاً للذكر، ووقتاً للراحة.",
      icon: <Clock className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "الإخلاص في العمل",
      description: "اجعل نيتك في صيامك وقيامك خالصة لله تعالى.",
      icon: <Heart className="w-6 h-6 text-rose-500" />
    },
    {
      title: "صلة الرحم",
      description: "استغل الشهر الكريم في التواصل مع الأهل والأقارب.",
      icon: <Users className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "الصدقة اليومية",
      description: "حاول أن تتصدق ولو بمبلغ بسيط كل يوم في رمضان.",
      icon: <Zap className="w-6 h-6 text-amber-500" />
    }
  ];

  return (
    <RamadanSectionLayout 
      title={t("ramadan.tips")} 
      subtitle={t("ramadan.tipsDesc")}
      icon={<Sparkles className="w-10 h-10 text-white" />}
      color="bg-indigo-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, idx) => (
          <ScrollReveal key={idx} delay={0.2 + idx * 0.1}>
            <div className="bento-card !p-8 h-full flex items-start gap-6 border border-border/40 hover:shadow-lg transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                {tip.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif">{tip.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </RamadanSectionLayout>
  );
};

export default Tips;
