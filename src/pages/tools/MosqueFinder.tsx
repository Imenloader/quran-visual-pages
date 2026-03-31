import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Search, Navigation, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MosqueFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError("يرجى تفعيل الموقع للبحث عن المساجد القريبة")
      );
    }
  }, []);

  const mosques = [
    { name: "المسجد الكبير", distance: "0.5 كم", address: "شارع التحرير، القاهرة" },
    { name: "مسجد النور", distance: "1.2 كم", address: "حي المعادي، القاهرة" },
    { name: "مسجد الفتح", distance: "2.1 كم", address: "رمسيس، القاهرة" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-naskh">{t("hub.mosqueFinder")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن مسجد محدد..."
              className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold font-naskh text-foreground">المساجد القريبة</h2>
              <button className="text-xs text-accent font-bold font-naskh flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                تحديث الموقع
              </button>
            </div>

            <div className="space-y-3">
              {mosques.map((mosque, idx) => (
                <motion.div
                  key={mosque.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-card border border-border rounded-2xl shadow-soft flex items-center justify-between group hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-deep/10 text-emerald-deep flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold font-naskh text-foreground">{mosque.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-naskh">{mosque.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-deep font-mono">{mosque.distance}</p>
                    <button className="text-[10px] text-accent font-bold font-naskh mt-1 underline">الاتجاهات</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm font-naskh text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MosqueFinder;
