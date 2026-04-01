import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ChevronLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QiblaFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
  const isFacingQibla = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-deep/20 via-background to-background" />
        <div className="absolute top-0 left-0 w-full h-full pattern-islamic opacity-[0.03] scale-150" />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[100px]" 
        />
      </div>

      <header className="relative z-10 w-full flex items-center justify-between max-w-md px-6 py-8">
        <button 
          onClick={() => navigate("/hub")}
          className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground shadow-sm hover:bg-card transition-all"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <h1 className="text-2xl font-bold font-naskh text-foreground tracking-tight">{t("hub.qibla")}</h1>
        <button className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground shadow-sm">
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-16 w-full max-w-md px-6">
        <div className="relative w-80 h-80">
          {/* Outer Glow */}
          <AnimatePresence>
            {isFacingQibla && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-emerald-deep/20 rounded-full blur-3xl"
              />
            )}
          </AnimatePresence>

          {/* Compass Ring */}
          <div className="absolute inset-0 rounded-full border-[12px] border-muted/20 shadow-inner" />
          <div className="absolute inset-4 rounded-full border border-border/40" />
          
          {/* Compass Heading */}
          <motion.div
            animate={{ rotate: -heading }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full relative p-8">
              <span className="absolute top-4 left-1/2 -translate-x-1/2 font-serif font-bold text-rose-500 text-xl">N</span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-serif font-bold text-foreground/40 text-xl">S</span>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif font-bold text-foreground/40 text-xl">W</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-serif font-bold text-foreground/40 text-xl">E</span>
              
              {/* Degree Marks */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div className="w-full h-3 bg-border/40" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Qibla Needle */}
          <motion.div
            animate={{ rotate: relativeQibla }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* The Needle */}
              <div className={`w-2 h-40 rounded-full relative transition-colors duration-500 ${isFacingQibla ? "bg-emerald-deep" : "bg-gold/40"}`}>
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isFacingQibla ? "bg-emerald-deep scale-110" : "bg-card border border-border"}`}>
                  <Compass className={`w-7 h-7 transition-colors duration-500 ${isFacingQibla ? "text-white" : "text-gold"}`} />
                </div>
                {/* Arrow head */}
                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] transition-colors duration-500 ${isFacingQibla ? "border-b-emerald-deep" : "border-b-gold/40"}`} />
              </div>
            </div>
          </motion.div>

          {/* Center Point */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-4 border-emerald-deep rounded-full z-20 shadow-md" />
        </div>

        <div className="text-center space-y-4">
          <motion.div
            animate={isFacingQibla ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className={`text-3xl font-bold font-naskh transition-colors duration-500 ${isFacingQibla ? "text-emerald-deep" : "text-foreground"}`}>
              {isFacingQibla ? "أنت تواجه القبلة" : "قم بتدوير الهاتف"}
            </p>
          </motion.div>
          <div className="flex items-center justify-center gap-3 bg-card/50 backdrop-blur-md border border-border/40 px-6 py-2 rounded-full shadow-sm">
            <span className="text-sm text-muted-foreground font-naskh">اتجاه القبلة:</span>
            <span className="text-lg font-bold font-mono text-emerald-deep">{Math.round(qiblaDirection)}°</span>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-destructive/10 border border-destructive/20 text-destructive rounded-[1.5rem] text-sm font-naskh text-center w-full shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </div>

      <footer className="relative z-10 w-full max-w-md mt-auto p-6 pb-12">
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-[2rem] border border-border/40 flex items-start gap-4 shadow-islamic">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-gold" />
          </div>
          <p className="text-xs text-muted-foreground font-naskh leading-relaxed opacity-80">
            للحصول على أدق النتائج، يرجى وضع الهاتف بشكل مسطح والابتعاد عن الأجهزة الإلكترونية أو الأجسام المعدنية الكبيرة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QiblaFinder;
