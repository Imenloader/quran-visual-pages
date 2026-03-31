import { Link, useParams } from "react-router-dom";
import { Home, ExternalLink, Loader2 } from "lucide-react";
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
};

const EmbedView = () => {
  const { siteId } = useParams<{ siteId: string }>();
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
    <div className="flex flex-col bg-background" style={{ height: 'calc(100vh - 68px - env(safe-area-inset-bottom, 0px))' }}>

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
