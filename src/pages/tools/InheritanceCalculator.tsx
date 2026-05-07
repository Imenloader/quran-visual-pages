import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Info, User, Users, Heart, AlertCircle, ArrowRight } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Result {
  heir: string;
  heirAr: string;
  share: string;
  shareAr: string;
  amount: number;
  percentage: number;
}

const InheritanceCalculator = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [totalEstate, setTotalEstate] = useState<string>("");
  const [deceasedGender, setDeceasedGender] = useState<"male" | "female">("male");
  const [hasSpouse, setHasSpouse] = useState<boolean>(false);
  const [numSons, setNumSons] = useState<number>(0);
  const [numDaughters, setNumDaughters] = useState<number>(0);
  const [numSiblings, setNumSiblings] = useState<number>(0);
  const [hasFather, setHasFather] = useState<boolean>(false);
  const [hasMother, setHasMother] = useState<boolean>(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const calculateInheritance = () => {
    const estate = parseFloat(totalEstate);
    if (isNaN(estate) || estate <= 0) return;

    const heirs: Result[] = [];
    let remainingEstate = estate;
    const hasChildren = numSons > 0 || numDaughters > 0;
    const hasMaleChildren = numSons > 0;

    // 1. Spouse Share (Fixed)
    if (hasSpouse) {
      let spouseShare = 0;
      if (deceasedGender === "male") {
        spouseShare = hasChildren ? 1/8 : 1/4;
        const amount = estate * spouseShare;
        heirs.push({
          heir: "Wife",
          heirAr: "الزوجة",
          share: hasChildren ? "1/8" : "1/4",
          shareAr: hasChildren ? "١/٨" : "١/٤",
          amount,
          percentage: spouseShare * 100
        });
        remainingEstate -= amount;
      } else {
        spouseShare = hasChildren ? 1/4 : 1/2;
        const amount = estate * spouseShare;
        heirs.push({
          heir: "Husband",
          heirAr: "الزوج",
          share: hasChildren ? "1/4" : "1/2",
          shareAr: hasChildren ? "١/٤" : "١/٢",
          amount,
          percentage: spouseShare * 100
        });
        remainingEstate -= amount;
      }
    }

    // 2. Mother's Share (Fixed)
    if (hasMother) {
      let motherShare = 0;
      // 1/6 if children exist OR 2+ siblings exist
      if (hasChildren || numSiblings >= 2) {
        motherShare = 1/6;
      } else {
        motherShare = 1/3;
      }
      const amount = estate * motherShare;
      heirs.push({
        heir: "Mother",
        heirAr: "الأم",
        share: motherShare === 1/6 ? "1/6" : "1/3",
        shareAr: motherShare === 1/6 ? "١/٦" : "١/٣",
        amount,
        percentage: motherShare * 100
      });
      remainingEstate -= amount;
    }

    // 3. Father's Share (Fixed + Asabah)
    if (hasFather) {
      let fatherFixedShare = 0;
      let isAsabah = false;
      
      if (hasMaleChildren) {
        fatherFixedShare = 1/6; // Fixed 1/6 only if sons exist
      } else if (numDaughters > 0) {
        fatherFixedShare = 1/6; // 1/6 + Asabah (remainder) if only daughters
        isAsabah = true;
      } else {
        isAsabah = true; // Full Asabah (remainder) if no children
      }

      if (fatherFixedShare > 0) {
        const amount = estate * fatherFixedShare;
        heirs.push({
          heir: "Father (Fixed)",
          heirAr: "الأب (فرضاً)",
          share: "1/6",
          shareAr: "١/٦",
          amount,
          percentage: (1/6) * 100
        });
        remainingEstate -= amount;
      }

      // If Father is Asabah and there are no sons, he takes the remainder after daughters
      if (isAsabah && !hasMaleChildren) {
         // We will calculate his Asabah share after daughters in step 4
      }
    }

    // 4. Daughters Share (if no sons)
    if (numDaughters > 0 && !hasMaleChildren) {
      let daughterShare = numDaughters === 1 ? 1/2 : 2/3;
      const amount = estate * daughterShare;
      heirs.push({
        heir: `Daughters (${numDaughters})`,
        heirAr: `البنات (${numDaughters})`,
        share: numDaughters === 1 ? "1/2" : "2/3",
        shareAr: numDaughters === 1 ? "١/٢" : "٢/٣",
        amount,
        percentage: daughterShare * 100
      });
      remainingEstate -= amount;
    }

    // 5. Remainder (Asabah)
    if (remainingEstate > 0) {
      if (hasMaleChildren) {
        // Sons and Daughters (2:1)
        const totalParts = (numSons * 2) + numDaughters;
        const partValue = remainingEstate / totalParts;
        
        if (numSons > 0) {
          const sonTotal = partValue * 2 * numSons;
          heirs.push({
            heir: `Sons (${numSons})`,
            heirAr: `الأبناء (${numSons})`,
            share: "Asabah (2:1)",
            shareAr: "بالتعصيب (للذكر مثل حظ الأنثيين)",
            amount: sonTotal,
            percentage: (sonTotal / estate) * 100
          });
        }
        if (numDaughters > 0) {
          const daughterTotal = partValue * numDaughters;
          heirs.push({
            heir: `Daughters (${numDaughters})`,
            heirAr: `البنات (${numDaughters})`,
            share: "Asabah (1:2)",
            shareAr: "بالتعصيب (للذكر مثل حظ الأنثيين)",
            amount: daughterTotal,
            percentage: (daughterTotal / estate) * 100
          });
        }
      } else if (hasFather) {
        // Father takes everything else as Asabah
        heirs.push({
          heir: "Father (Asabah)",
          heirAr: "الأب (تعصيباً)",
          share: "Remainder",
          shareAr: "الباقي تعصيباً",
          amount: remainingEstate,
          percentage: (remainingEstate / estate) * 100
        });
      } else if (numSiblings > 0) {
        // Simplified: Siblings take the rest
        heirs.push({
          heir: `Siblings (${numSiblings})`,
          heirAr: `الإخوة (${numSiblings})`,
          share: "Remainder",
          shareAr: "الباقي تعصيباً",
          amount: remainingEstate,
          percentage: (remainingEstate / estate) * 100
        });
      }
    }

    setResults(heirs);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "حاسبة المواريث" : "Inheritance Calculator"} 
        subtitle={isAr ? "توزيع التركة وفقاً للشريعة الإسلامية" : "Calculate estate distribution according to Sharia"}
        variant="compact"
      />

      <div className="max-w-4xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bento-card !p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-bold">{isAr ? "إجمالي التركة" : "Total Estate Value"}</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="h-14 pl-12 text-lg font-bold rounded-2xl"
                  value={totalEstate}
                  onChange={(e) => setTotalEstate(e.target.value)}
                />
                <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-bold">{isAr ? "جنس المتوفى" : "Gender of Deceased"}</Label>
              <RadioGroup value={deceasedGender} onValueChange={(v: "male" | "female") => setDeceasedGender(v)} className="flex gap-4">
                <div className="flex items-center space-x-2 bg-muted/50 px-6 py-3 rounded-xl border border-border/40 cursor-pointer">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">{isAr ? "ذكر" : "Male"}</Label>
                </div>
                <div className="flex items-center space-x-2 bg-muted/50 px-6 py-3 rounded-xl border border-border/40 cursor-pointer">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">{isAr ? "أنثى" : "Female"}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold">{isAr ? "هل يوجد زوج/زوجة؟" : "Is there a Spouse?"}</Label>
                <Button 
                  variant={hasSpouse ? "default" : "outline"} 
                  className="w-full h-12 rounded-xl active:scale-95"
                  onClick={() => setHasSpouse(!hasSpouse)}
                >
                  {hasSpouse ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")}
                </Button>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold">{isAr ? "عدد الأبناء" : "Number of Sons"}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  className="h-12 rounded-xl"
                  value={numSons}
                  onChange={(e) => setNumSons(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold">{isAr ? "عدد البنات" : "Number of Daughters"}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  className="h-12 rounded-xl"
                  value={numDaughters}
                  onChange={(e) => setNumDaughters(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold">{isAr ? "عدد الإخوة" : "Number of Siblings"}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  className="h-12 rounded-xl"
                  value={numSiblings}
                  onChange={(e) => setNumSiblings(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-3 flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button 
                    variant={hasFather ? "default" : "outline"} 
                    className="flex-1 h-12 rounded-xl text-xs active:scale-95"
                    onClick={() => setHasFather(!hasFather)}
                  >
                    {isAr ? "الأب" : "Father"}
                  </Button>
                  <Button 
                    variant={hasMother ? "default" : "outline"} 
                    className="flex-1 h-12 rounded-xl text-xs active:scale-95"
                    onClick={() => setHasMother(!hasMother)}
                  >
                    {isAr ? "الأم" : "Mother"}
                  </Button>
                </div>
              </div>
            </div>

            <Button className="w-full h-14 rounded-2xl text-lg gap-2 active:scale-95" onClick={calculateInheritance}>
              <Calculator className="w-5 h-5" />
              {isAr ? "احسب التوزيع" : "Calculate Distribution"}
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
            <Info className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-naskh">
              {isAr 
                ? "هذه الحاسبة تقدم نتائج تقريبية للحالات الشائعة فقط. يرجى استشارة عالم متخصص أو جهة شرعية معتمدة للحصول على فتوى دقيقة وشاملة لتوزيع التركة."
                : "This calculator provides approximate results for common cases only. Please consult a specialized scholar or an authorized religious authority for an accurate and comprehensive fatwa on estate distribution."}
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <div 
              className="space-y-6"
            >
              <h3 className="text-xl font-bold font-naskh px-2">{isAr ? "نتائج التوزيع" : "Distribution Results"}</h3>
              <div className="space-y-4">
                {results.map((res, idx) => (
                  <div key={idx} className="bento-card !p-6 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold font-naskh">{isAr ? res.heirAr : res.heir}</h4>
                        <p className="text-xs text-muted-foreground">{isAr ? "النصيب الشرعي: " : "Legal Share: "} {isAr ? res.shareAr : res.share}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-primary">{res.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">USD</span></p>
                      <p className="text-xs font-bold text-emerald-500">{res.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bento-card !p-8 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold">{isAr ? "إجمالي التركة" : "Total Estate"}</span>
                  <span className="font-bold text-xl">{parseFloat(totalEstate).toLocaleString()} USD</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  {results.map((res, idx) => (
                    <div 
                      key={idx}
                      style={{ width: `${res.percentage}%` }}
                      className={`h-full ${idx % 2 === 0 ? "bg-primary" : "bg-emerald-500"} transition-all duration-700`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
              <Calculator className="w-20 h-20 text-muted-foreground" />
              <p className="text-lg font-medium">{isAr ? "أدخل البيانات لعرض النتائج" : "Enter data to view results"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InheritanceCalculator;
