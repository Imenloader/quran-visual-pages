import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Search, Utensils, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HalalPlaces = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const places = [
    { name: "مطعم المدينة", type: "مطعم شرقي", distance: "0.8 كم", rating: 4.8 },
    { name: "حلويات الشرق", type: "حلويات", distance: "1.5 كم", rating: 4.5 },
    { name: "جزارة الأمانة", type: "لحوم حلال", distance: "2.3 كم", rating: 4.9 },
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
          <h1 className="text-xl font-bold font-naskh">{t("hub.halalPlaces")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن مطعم أو متجر..."
              className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold font-naskh text-foreground">أماكن حلال قريبة</h2>
            </div>

            <div className="space-y-3">
              {places.map((place, idx) => (
                <motion.div
                  key={place.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-card border border-border rounded-2xl shadow-soft flex items-center justify-between group hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold font-naskh text-foreground">{place.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-naskh">{place.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-500 font-mono">{place.distance}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-foreground">{place.rating}</span>
                      <span className="text-amber-500">★</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalalPlaces;
