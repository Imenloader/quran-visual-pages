import React, { useEffect, useState } from "react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "sonner";
import { checkNetworkReliability } from "../lib/networkCheck";
import { notificationService } from "../services/notificationService";
import SplashScreen from "./SplashScreen";

export const Bootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // Safe, non-blocking check
        checkNetworkReliability().catch(() => null);

        // Run non-blocking initialization
        const { Capacitor } = await import("@capacitor/core").catch(() => ({ Capacitor: null }));
        if (Capacitor && Capacitor.isNativePlatform()) {
          import("@codetrix-studio/capacitor-google-auth").then(({ GoogleAuth }) => {
            GoogleAuth.initialize({
              clientId: "130128331336-jsf2phje1obt9ln0lj5f5nlfsgl6rssn.apps.googleusercontent.com",
              scopes: ['profile', 'email'],
              grantOfflineAccess: true,
            }).catch(() => null);
          }).catch(() => null);
          notificationService.requestPermission().catch(() => null);
        }

        getRedirectResult(auth).then((result) => {
          if (result?.user) {
            toast.success(`مرحباً بك، ${result.user.displayName}`);
          }
        }).catch((error: any) => {
          if (error.code === "auth/unauthorized-domain") {
            toast.error("هذا النطاق غير مصرح به.");
          }
        });

        // Pre-load voices for TTS
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.getVoices();
        }
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };
    
    // Run initialization in background
    initializeApp();

    // Force app ready after 500ms no matter what
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsReady(true);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};

export default Bootstrapper;
