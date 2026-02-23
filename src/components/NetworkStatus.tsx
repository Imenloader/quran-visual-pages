import { useState, useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

const NetworkStatus = () => {
  const wasOffline = useRef(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      if (wasOffline.current) {
        toast.success("تم استعادة الاتصال بالإنترنت ✅", {
          duration: 3000,
          position: "top-center",
        });
      }
      wasOffline.current = false;
      setIsOffline(false);
    };

    const goOffline = () => {
      wasOffline.current = true;
      setIsOffline(true);
      toast("لا يوجد اتصال بالإنترنت — الوضع أوفلاين", {
        icon: <WifiOff size={16} />,
        duration: 5000,
        position: "top-center",
      });
    };

    if (!navigator.onLine) {
      wasOffline.current = true;
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground text-center py-2 px-4 font-naskh text-sm flex items-center justify-center gap-2 shadow-md animate-fade-in">
      <WifiOff size={14} />
      <span>لا يوجد اتصال بالإنترنت — الوضع أوفلاين</span>
    </div>
  );
};

export default NetworkStatus;
