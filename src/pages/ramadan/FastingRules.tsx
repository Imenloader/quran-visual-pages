import React from "react";
import { useTranslation } from "react-i18next";
import { Utensils, Info, CheckCircle2, AlertCircle } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";

const FastingRules = () => {
  const { t } = useTranslation();

  const rules = [
    {
      title: "مبطلات الصيام",
      items: [
        "الأكل والشرب عمداً.",
        "الجماع في نهار رمضان.",
        "القيء المتعمد.",
        "الحيض والنفاس للمرأة."
      ],
      icon: <AlertCircle className="w-6 h-6 text-rose-500" />
    },
    {
      title: "مستحبات الصيام",
      items: [
        "تعجيل الفطر.",
        "تأخير السحور.",
        "كثرة قراءة القرآن.",
        "الصدقة والإحسان للناس."
      ],
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <RamadanSectionLayout 
      title={t("ramadan.fastingRules")} 
      subtitle={t("ramadan.fastingRulesDesc")}
      icon={<Utensils className="w-10 h-10 text-white" />}
      color="bg-amber-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rules.map((rule, idx) => (
          <ScrollReveal key={idx} delay={0.2 + idx * 0.1}>
            <div className="bento-card !p-8 h-full space-y-6 border border-border/40 hover:shadow-lg transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  {rule.icon}
                </div>
                <h3 className="text-xl font-bold font-serif">{rule.title}</h3>
              </div>
              <ul className="space-y-4">
                {rule.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </RamadanSectionLayout>
  );
};

export default FastingRules;
