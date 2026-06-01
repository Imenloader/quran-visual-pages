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
    let fallbackTimer: NodeJS.Timeout;

    const initializeApp = async () => {
      try {
        // 1. Check Network Reliability
        const reliability = await checkNetworkReliability().catch(() => ({ ok: false, reason: "timeout", details: "" }));
        if (!reliability.ok && reliability.reason === "certificate_or_network") {
          console.warn("SSL/Network reliability issue detected:", reliability.details);
        }

        // 2. Init Google Auth and Notifications for Native
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          try {
            const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
            GoogleAuth.initialize({
              clientId: "130128331336-jsf2phje1obt9ln0lj5f5nlfsgl6rssn.apps.googleusercontent.com",
              scopes: ['profile', 'email'],
              grantOfflineAccess: true,
            });
            notificationService.requestPermission();
          } catch (e) {
            console.warn("Google Auth initialization skipped or failed:", e);
          }
        }

        // 3. Handle Firebase Auth Redirects
        try {
          const result = await getRedirectResult(auth).catch(() => null);
          if (result?.user) {
            toast.success(`مرحباً بك، ${result.user.displayName}`);
          }
        } catch (error: any) {
          console.error("Redirect login error:", error);
          if (error.code === "auth/unauthorized-domain") {
            toast.error("هذا النطاق غير مصرح به. يرجى إضافة localhost و النطاق الحالي إلى Firebase.");
          }
        }

        // 4. Pre-load voices for TTS
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          try {
            window.speechSynthesis.getVoices();
          } catch (error) {
            console.warn("Failed to pre-load TTS voices:", error);
          }
        }
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        if (isMounted) {
          clearTimeout(fallbackTimer);
          setTimeout(() => setIsReady(true), 500);
        }
      }
    };

    // Safety fallback: if initialization takes longer than 4 seconds, force ready
    fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn("Bootstrapper timed out. Forcing app to load.");
        setIsReady(true);
      }
    }, 4000);

    initializeApp();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};

export default Bootstrapper;
