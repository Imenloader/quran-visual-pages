import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { HandHeart, Users, Info, CheckCircle2, Calculator, Coins, RefreshCw } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";
import { toArabicNumber } from "@/data/quranData";

const ZakatAlFitr = () => {
  const { t, i18n } = useTranslation();
  const [familyMembers, setFamilyMembers] = useState(1);
  const [pricePerPerson, setPricePerPerson] = useState(() => {
    const saved = localStorage.getItem("zakat-fitr-price-egypt");
    return saved ? JSON.parse(saved).price : 40; // 40 EGP is the 2025 minimum
  });
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(pricePerPerson);

  const handleSavePrice = () => {
    setPricePerPerson(tempPrice);
    localStorage.setItem("zakat-fitr-price-egypt", JSON.stringify({
      price: tempPrice,
      timestamp: Date.now()
    }));
    setIsEditingPrice(false);
  };

  const details = [
    {
      title: i18n.language === 'ar' ? "الحكمة منها" : "The Wisdom",
      description: i18n.language === 'ar' ? "طهرة للصائم من اللغو والرفث، وطعمة للمساكين." : "Purification for the fasting person from idle talk and obscenity, and to feed the poor.",
      icon: <HandHeart className="w-6 h-6 text-blue-500" />
    },
    {
      title: i18n.language === 'ar' ? "وقت إخراجها" : "Timing",
      description: i18n.language === 'ar' ? "تجب بغروب شمس آخر يوم من رمضان، والأفضل إخراجها قبل صلاة العيد." : "It becomes obligatory at sunset on the last day of Ramadan, and it is best to give it before the Eid prayer.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />
    },
    {
      title: i18n.language === 'ar' ? "مقدارها" : "Amount",
      description: i18n.language === 'ar' ? "صاع من طعام (حوالي 2.5 كجم) من غالب قوت أهل البلد." : "A Sa' of food (about 2.5 kg) from the common staple food of the country.",
      icon: <Info className="w-6 h-6 text-amber-500" />
    }
  ];

  const totalZakat = familyMembers * pricePerPerson;

  return (
    <RamadanSectionLayout 
      title={t("ramadan.zakatAlFitr")} 
      subtitle={t("ramadan.zakatAlFitrDesc")}
      icon={<HandHeart className="w-10 h-10 text-white" />}
      color="bg-blue-600"
    >
      <div className="space-y-12">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {details.map((detail, idx) => (
            <ScrollReveal key={idx} delay={0.2 + idx * 0.1}>
              <div className="bento-card !p-8 h-full flex flex-col items-center text-center space-y-4 border border-border/40 hover:shadow-lg transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  {detail.icon}
                </div>
                <h3 className="text-xl font-bold font-serif">{detail.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {detail.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Calculator Section */}
        <ScrollReveal delay={0.5}>
          <div className="bento-card !p-8 md:!p-12 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Calculator size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 text-center md:text-right flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-bold uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  {i18n.language === 'ar' ? "حاسبة زكاة الفطر" : "Zakat Al-Fitr Calculator"}
                </div>
                <h3 className="text-3xl font-bold font-serif">
                  {i18n.language === 'ar' ? "احسب زكاتك بسهولة" : "Calculate Your Zakat Easily"}
                </h3>
                <p className="text-muted-foreground max-w-lg">
                  {i18n.language === 'ar' 
                    ? `أدخل عدد أفراد الأسرة لحساب القيمة الإجمالية للزكاة بناءً على الحد الأدنى المعلن من دار الإفتاء المصرية (${pricePerPerson} جنيهاً للفرد).`
                    : `Enter the number of family members to calculate the total Zakat value based on the minimum announced by Dar al-Ifta al-Missriyyah (${pricePerPerson} EGP per person).`}
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                  <div className="p-4 glass-card rounded-[2rem] flex items-center gap-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <input 
                      type="number" 
                      min="1"
                      value={familyMembers}
                      onChange={(e) => setFamilyMembers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-transparent border-none focus:ring-0 w-20 text-2xl font-bold text-center"
                    />
                    <span className="text-sm font-bold text-muted-foreground">
                      {i18n.language === 'ar' ? "أفراد" : "Members"}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setTempPrice(pricePerPerson);
                      setIsEditingPrice(true);
                    }}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {i18n.language === 'ar' ? "تعديل سعر الفرد" : "Edit price per person"}
                  </button>
                </div>

                {isEditingPrice && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <p className="text-sm font-bold">{i18n.language === 'ar' ? "تعديل الحد الأدنى للفرد" : "Edit Minimum Price Per Person"}</p>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(parseInt(e.target.value) || 0)}
                        className="bg-card border border-border rounded-lg px-3 py-2 w-24 text-center font-bold"
                      />
                      <button 
                        onClick={handleSavePrice}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold"
                      >
                        {i18n.language === 'ar' ? "حفظ" : "Save"}
                      </button>
                      <button 
                        onClick={() => setIsEditingPrice(false)}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-bold"
                      >
                        {i18n.language === 'ar' ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-blue-500/20 min-w-[280px]">
                <Coins className="w-12 h-12 text-amber-500 mb-4" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {i18n.language === 'ar' ? "إجمالي الزكاة" : "Total Zakat"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-bold text-primary">
                    {i18n.language === 'ar' ? toArabicNumber(totalZakat) : totalZakat}
                  </span>
                  <span className="text-xl font-bold text-muted-foreground">
                    {i18n.language === 'ar' ? "ج.م" : "EGP"}
                  </span>
                </div>
                <div className="mt-6 pt-6 border-t border-border w-full text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground italic">
                    {i18n.language === 'ar' 
                      ? `* الحد الأدنى للفرد: ${pricePerPerson} جنيهاً (قابل للزيادة حسب الاستطاعة)`
                      : `* Minimum per person: ${pricePerPerson} EGP (can be increased according to ability)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </RamadanSectionLayout>
  );
};

export default ZakatAlFitr;
