import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, MapPin, Search, Navigation, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { searchPlaces, Place } from "@/services/placesService";
import BackButton from "@/components/BackButton";

const MosqueFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mosques, setMosques] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMosques = async (lat?: number, lng?: number, queryOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchPlaces(queryOverride || "مساجد قريبة", lat, lng);
      setMosques(results);
      if (results.length === 0) {
        setError("لم يتم العثور على مساجد قريبة. يرجى التأكد من تفعيل الموقع أو المحاولة لاحقاً.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء البحث عن المساجد. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          fetchMosques(lat, lng);
        },
        (err) => {
          setError("يرجى تفعيل الموقع للبحث عن المساجد القريبة");
          // Fallback fetch without location
          fetchMosques();
        }
      );
    } else {
      fetchMosques();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchMosques(location?.lat, location?.lng, searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh">{t("hub.mosqueFinder")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مسجد محدد..."
              className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold font-naskh text-foreground">المساجد القريبة</h2>
              <button 
                onClick={() => fetchMosques(location?.lat, location?.lng)}
                className="text-xs text-accent font-bold font-naskh flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                تحديث الموقع
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <p className="text-muted-foreground text-sm font-naskh">جاري البحث عن المساجد...</p>
                </div>
              ) : mosques.length > 0 ? (
                mosques.map((mosque, idx) => (
                  <motion.div
                    key={mosque.name + idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 border rounded-2xl shadow-soft flex items-center justify-between group transition-colors ${
                      mosque.type === 'fallback' 
                        ? 'bg-accent/10 border-accent/30' 
                        : 'bg-card border-border hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        mosque.type === 'fallback' ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold font-naskh text-foreground">{mosque.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-naskh">{mosque.address || "العنوان متاح في الخريطة"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {mosque.url && (
                        <a 
                          href={mosque.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-accent font-bold font-naskh flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {mosque.type === 'fallback' ? "فتح الخرائط" : "الخريطة"}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : !error && (
                <p className="text-center text-muted-foreground text-sm font-naskh py-12">لا توجد نتائج حالياً</p>
              )}
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
