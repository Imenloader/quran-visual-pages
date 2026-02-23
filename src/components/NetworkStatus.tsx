import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

const NetworkStatus = () => {
  const wasOffline = useRef(false);

  useEffect(() => {
    const goOnline = () => {
      if (wasOffline.current) {
        toast.success("تم استعادة الاتصال بالإنترنت ✅", {
          duration: 3000,
          position: "top-center",
        });
      }
      wasOffline.current = false;
    };

    const goOffline = () => {
      wasOffline.current = true;
      toast("لا يوجد اتصال بالإنترنت — الوضع أوفلاين", {
        icon: <WifiOff size={16} />,
        duration: 5000,
        position: "top-center",
      });
    };

    // If already offline on mount
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

  return null;
};

export default NetworkStatus;
