import { Link, useParams, useNavigate } from "react-router-dom";
import { Home, ExternalLink, Loader2, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

const SITES: Record<string, { title: string; url: string; description: string }> = {
  qiyam: {
    title: "قيام الليل",
    url: "https://www.mohammedhesham.site/aya",
    description: "آيات مختارة لصلاة القيام",
  },
  khatma: {
    title: "ختمة القرآن الكريم",
    url: "https://quraaniat.vercel.app/",
    description: "جدول ختمة القرآن الكريم",
  },
  makkah: {
    title: "المسجد الحرام - مكة المكرمة",
    url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714.851662491568!2d39.82354511540411!3d21.42248697855364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c204b74d3017f3%3A0x7aa2d8a662d54d0!2sKaaba!5e0!3m2!1sen!2ssa!4v1679412345678!5m2!1sen!2ssa",
    description: "جولة في المسجد الحرام",
  },
  madinah: {
    title: "المسجد النبوي - المدينة المنورة",
    url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.424683401568!2d39.60894511540411!3d24.46721097855364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15bdbe368a00e55d%3A0x17c364b630739079!2sAl%20Masjid%20an%20Nabawi!5e0!3m2!1sen!2ssa!4v1679412345678!5m2!1sen!2ssa",
    description: "جولة في المسجد النبوي",
  },
  holysites: {
    title: "المشاعر المقدسة",
    url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59448.8968112!2d39.9570535!3d21.3678915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c203934d3017f3%3A0x7aa2d8a662d54d0!2sMount%20Arafat!5e0!3m2!1sen!2ssa!4v1679412345678!5m2!1sen!2ssa",
    description: "جولة في المشاعر المقدسة",
  },
};

const EmbedView = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const site = siteId ? SITES[siteId] : null;

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Pre-cache the site URL
  useEffect(() => {
    if (site) {
      fetch(site.url, { mode: "no-cors", cache: "force-cache" }).catch(() => {});
    }
  }, [site]);

  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-naskh text-lg text-foreground mb-4">الصفحة غير موجودة</p>
          <Link to="/" className="text-gold font-naskh hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background h-screen">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-sm truncate max-w-[200px]">{site.title}</h1>
          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{site.description}</p>
        </div>
        <button 
          onClick={() => window.open(site.url, "_blank")}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
        <iframe
          src={site.url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          title={site.title}
          allow="autoplay; fullscreen"
        />
      </div>
    </div>
  );
};

export default EmbedView;
