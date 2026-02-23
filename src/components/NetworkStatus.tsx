import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const goOnline = () => { setIsOnline(true); setShowBanner(true); setTimeout(() => setShowBanner(false), 3000); };
    const goOffline = () => { setIsOnline(false); setShowBanner(true); };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2.5 font-naskh text-sm font-bold transition-all duration-300 ${
        isOnline
          ? "bg-primary text-primary-foreground"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      {isOnline ? "تم استعادة الاتصال بالإنترنت" : "لا يوجد اتصال بالإنترنت - الوضع أوفلاين"}
    </div>
  );
};

export default NetworkStatus;
