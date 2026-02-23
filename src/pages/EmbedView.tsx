import { Link, useParams } from "react-router-dom";
import { Home, ExternalLink, Loader2, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

const SITES: Record<string, { title: string; url: string; description: string }> = {
  quraaniat: {
    title: "ختم القرآن وسماعه",
    url: "https://quraaniat.vercel.app",
    description: "تابع ختمتك واستمع للتلاوات",
  },
  qiyam: {
    title: "١٠٠ آية لقيام الليل",
    url: "https://www.mohammedhesham.site/aya",
    description: "آيات مختارة لصلاة القيام",
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-gold text-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-all font-naskh text-xs font-bold shadow-sm"
        >
          <Home size={14} />
          الرئيسية
        </Link>
        <div className="flex-1 min-w-0 text-right">
          <p className="font-naskh text-sm font-bold text-foreground truncate">{site.title}</p>
        </div>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-naskh transition-colors"
        >
          فتح خارجياً
          <ExternalLink size={12} />
        </a>
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
