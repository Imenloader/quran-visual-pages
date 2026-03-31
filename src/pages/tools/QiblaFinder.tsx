import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Compass, ChevronLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QiblaFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  const calculateQibla = (lat: number, lng: number) => {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    
    const φ1 = lat * (Math.PI / 180);
    const φ2 = kaabaLat * (Math.PI / 180);
    const Δλ = (kaabaLng - lng) * (Math.PI / 180);
    
    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;
    return qibla;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("الموقع غير مدعوم في هذا المتصفح");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const qibla = calculateQibla(pos.coords.latitude, pos.coords.longitude);
        setQiblaDirection(qibla);
      },
      (err) => {
        setError("يرجى تفعيل الموقع لتحديد اتجاه القبلة");
      }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (webkitHeading !== undefined) {
        setHeading(webkitHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      
      if (typeof DeviceOrientationEventWithPermission.requestPermission === "function") {
        DeviceOrientationEventWithPermission.requestPermission()
          .then((state: string) => {
            if (state === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            } else {
              setError("يرجى منح إذن الوصول للمستشعرات");
            }
          });
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    } else {
      setError("المستشعرات غير مدعومة في هذا الجهاز");
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const relativeQibla = (qiblaDirection - heading + 360) % 360;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <header className="w-full flex items-center justify-between max-w-md mb-12">
        <button 
          onClick={() => navigate("/hub")}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold font-naskh">{t("hub.qibla")}</h1>
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-md">
        <div className="relative w-72 h-72">
          {/* Compass Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
          
          {/* Compass Heading */}
          <motion.div
            animate={{ rotate: -heading }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full relative">
              <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-rose-500">N</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-foreground">S</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-foreground">W</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-foreground">E</span>
            </div>
          </motion.div>

          {/* Qibla Needle */}
          <motion.div
            animate={{ rotate: relativeQibla }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-1.5 h-32 bg-emerald-deep rounded-full relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-deep rounded-full flex items-center justify-center shadow-islamic">
                  <Compass className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-2xl font-bold font-naskh text-foreground">
            {Math.abs(relativeQibla) < 5 ? "أنت تواجه القبلة" : "قم بتدوير الهاتف"}
          </p>
          <p className="text-sm text-muted-foreground font-naskh">
            اتجاه القبلة: {Math.round(qiblaDirection)}°
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm font-naskh text-center w-full">
            {error}
          </div>
        )}
      </div>

      <footer className="w-full max-w-md mt-auto pt-8">
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
            للحصول على أدق النتائج، يرجى وضع الهاتف بشكل مسطح والابتعاد عن الأجهزة الإلكترونية أو الأجسام المعدنية الكبيرة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QiblaFinder;
