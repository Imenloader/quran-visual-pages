import { useState, useEffect } from "react";
import { ChevronLeft, Calculator, Info, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";

const ZakatCalculator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savings, setSavings] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [other, setOther] = useState(0);
  const [goldPrice, setGoldPrice] = useState(2500); // Placeholder price per gram
  const [silverPrice, setSilverPrice] = useState(30); // Placeholder price per gram
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPrices = async () => {
    try {
      const [goldRes, silverRes, rateRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU"),
        fetch("https://api.gold-api.com/price/XAG"),
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
      ]);

      const goldData = await goldRes.json();
      const silverData = await silverRes.json();
      const rateData = await rateRes.json();

      const egpRate = rateData.rates.EGP || 50; // Fallback to 50
      
      // Prices come in USD, convert to EGP
      setGoldPrice(Math.round(goldData.price * egpRate));
      setSilverPrice(Math.round(silverData.price * egpRate));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to update prices:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 3600000);
    return () => clearInterval(interval);
  }, []);

  const totalWealth = savings + (gold * (goldPrice / 31.1035)) + (silver * (silverPrice / 31.1035)) + other;
  // Gold Nisab: 85g of 24k gold. Silver Nisab: 595g of silver.
  const nisabGold = 85 * (goldPrice / 31.1035);
  const nisabSilver = 595 * (silverPrice / 31.1035);
  
  // Sharia: Use the lower of the two nisabs to be more cautious (usually silver)
  const effectiveNisab = Math.min(nisabGold, nisabSilver);
  const zakatAmount = totalWealth >= effectiveNisab ? totalWealth * 0.025 : 0;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh">{t("hub.zakat")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl text-center space-y-2">
            <p className="text-sm text-muted-foreground font-naskh">مقدار الزكاة المستحق</p>
            <p className="text-4xl font-bold font-mono text-primary">{zakatAmount.toLocaleString()} <span className="text-sm font-naskh">ج.م</span></p>
            {totalWealth < nisabGold && (
              <p className="text-xs text-rose-500 font-naskh mt-2">إجمالي الثروة أقل من النصاب ({nisabGold.toLocaleString()})</p>
            )}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-naskh opacity-70">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span>تحديث تلقائي كل ساعة • آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 glass-card rounded-[2rem] space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-accent" />
                <h2 className="font-bold font-naskh text-foreground">المدخرات والذهب</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-naskh mb-1 block">المدخرات النقدية</label>
                  <input
                    type="number"
                    value={savings || ""}
                    onChange={(e) => setSavings(Number(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-naskh mb-1 block">الذهب (جرام)</label>
                  <input
                    type="number"
                    value={gold || ""}
                    onChange={(e) => setGold(Number(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-naskh mb-1 block">الفضة (جرام)</label>
                  <input
                    type="number"
                    value={silver || ""}
                    onChange={(e) => setSilver(Number(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
                يتم حساب الزكاة بنسبة 2.5% من إجمالي الثروة إذا بلغت النصاب (ما يعادل 85 جرام من الذهب) وحال عليها الحول.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculator;
