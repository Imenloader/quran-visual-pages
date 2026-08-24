import { useState, useEffect } from "react";
import { Compass, Camera, CameraOff, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";

const QiblaFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [arMode, setArMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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

  const toggleAR = async () => {
    if (!arMode) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(s);
        setArMode(true);
      } catch (err) {
        setError("تعذر الوصول للكاميرا");
      }
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setArMode(false);
    }
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

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

    const handleOrientation = (e: any) => {
      let newHeading = 0;
      if (e.webkitCompassHeading !== undefined) {
        newHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        newHeading = 360 - e.alpha;
      }
      setHeading(newHeading);
    };

    if (window.DeviceOrientationEvent) {
      const DeviceOrientationEventWithPermission = DeviceOrientationEvent as any;
      if (typeof DeviceOrientationEventWithPermission.requestPermission === "function") {
        DeviceOrientationEventWithPermission.requestPermission()
          .then((state: string) => {
            if (state === "granted") {
              (window as any).addEventListener("deviceorientation", handleOrientation);
            } else {
              setError("يرجى منح إذن الوصول للمستشعرات");
            }
          });
      } else {
        if ('ondeviceorientationabsolute' in window) {
          (window as any).addEventListener("deviceorientationabsolute", handleOrientation);
        } else {
          (window as any).addEventListener("deviceorientation", handleOrientation);
        }
      }
    } else {
      setError("المستشعرات غير مدعومة في هذا الجهاز");
    }

    return () => {
      (window as any).removeEventListener("deviceorientation", handleOrientation);
      if ('ondeviceorientationabsolute' in window) {
        (window as any).removeEventListener("deviceorientationabsolute", handleOrientation);
      }
    };
  }, []);

  const relativeQibla = (qiblaDirection - heading + 360) % 360;
  const isFacingQibla = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5;

  return (
    <div className={`relative min-h-screen flex flex-col items-center overflow-hidden transition-colors duration-1000 ${arMode ? "bg-black" : "bg-background"}`}>
      {/* AR Camera Feed */}
      {arMode && stream && (
        <video 
          autoPlay 
          playsInline 
          ref={el => { if (el) el.srcObject = stream; }}
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
        />
      )}

      {/* Immersive Background (Only in normal mode) */}
      {!arMode && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
          <div className="absolute top-0 left-0 w-full h-full pattern-islamic opacity-[0.03] scale-150" />
          <div 
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[100px] animate-pulse" 
          />
        </div>
      )}

      <header className="relative z-10 w-full flex items-center justify-between max-w-md px-6 py-8">
        <BackButton variant={arMode ? "ghost" : "outline"} className={arMode ? "text-white" : ""} />
        <h1 className={`text-2xl font-bold font-naskh tracking-tight ${arMode ? "text-white" : "text-foreground"}`}>{t("hub.qibla")}</h1>
        <div className="flex gap-2">
          <button 
            onClick={toggleAR}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${arMode ? "bg-primary text-white" : "bg-card/50 backdrop-blur-md border border-border/40 text-foreground"} active:scale-95`}
          >
            {arMode ? <CameraOff size={20} /> : <Camera size={20} />}
          </button>
          <button 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${arMode ? "bg-white/10 text-white" : "bg-card/50 backdrop-blur-md border border-border/40 text-foreground"} active:scale-95`}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 sm:gap-12 w-full max-w-md px-4 sm:px-6 py-4">
        <div className="relative w-[80vw] max-w-[300px] aspect-square">
          {isFacingQibla && (
            <div
              className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-500 opacity-100 scale-110 ${arMode ? "bg-primary/40" : "bg-primary/20"}`}
            />
          )}

          <div className={`absolute inset-0 rounded-full border-[12px] shadow-inner ${arMode ? "border-white/10" : "border-muted/20"}`} />
          <div className={`absolute inset-4 rounded-full border ${arMode ? "border-white/20" : "border-border/40"}`} />
          
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="w-full h-full relative p-8">
              <span className="absolute top-4 left-1/2 -translate-x-1/2 font-serif font-bold text-rose-500 text-xl">N</span>
              <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 font-serif font-bold text-xl ${arMode ? "text-white/40" : "text-foreground/40"}`}>S</span>
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-serif font-bold text-xl ${arMode ? "text-white/40" : "text-foreground/40"}`}>W</span>
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-serif font-bold text-xl ${arMode ? "text-white/40" : "text-foreground/40"}`}>E</span>
            </div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${relativeQibla}deg)` }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className={`w-1.5 sm:w-2 h-[50%] rounded-full relative transition-colors duration-500 ${isFacingQibla ? "bg-primary" : arMode ? "bg-white/40" : "bg-gold/40"}`}>
                <div className={`absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isFacingQibla ? "bg-primary scale-110" : "glass-card hover:-translate-y-1"}`}>
                  <Compass className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-500 ${isFacingQibla ? "text-white" : "text-gold"}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-4 border-primary rounded-full z-20 shadow-md" />
        </div>

        <div className="text-center space-y-4">
          <p className={`text-2xl sm:text-3xl font-bold font-naskh transition-colors duration-500 ${isFacingQibla ? "text-primary" : arMode ? "text-white" : "text-foreground"}`}>
            {isFacingQibla ? "أنت تواجه القبلة" : "قم بتدوير الهاتف"}
          </p>
          <div className={`flex items-center justify-center gap-3 backdrop-blur-md border px-6 py-2 rounded-full shadow-sm ${arMode ? "bg-black/40 border-white/10" : "bg-card/50 border-border/40"}`}>
            <span className={`text-sm font-naskh ${arMode ? "text-white/60" : "text-muted-foreground"}`}>اتجاه القبلة:</span>
            <span className="text-lg font-bold font-mono text-primary">{Math.round(qiblaDirection)}°</span>
          </div>
        </div>

        {error && (
          <div className="p-5 bg-destructive/10 border border-destructive/20 text-destructive rounded-[1.5rem] text-sm font-naskh text-center w-full shadow-sm">
            {error}
          </div>
        )}
      </div>

      <footer className="relative z-10 w-full max-w-md mt-auto p-6 pb-12">
        <div className={`p-6 backdrop-blur-md rounded-[2rem] border flex items-start gap-4 shadow-islamic ${arMode ? "bg-black/40 border-white/10" : "bg-card/50 border-border/40"}`}>
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-gold" />
          </div>
          <p className={`text-xs font-naskh leading-relaxed opacity-80 ${arMode ? "text-white/60" : "text-muted-foreground"}`}>
            {arMode ? "وضع الواقع المعزز مفعل. ابحث عن الكعبة في الأفق." : "للحصول على أدق النتائج، يرجى وضع الهاتف بشكل مسطح والابتعاد عن الأجسام المعدنية."}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QiblaFinder;
