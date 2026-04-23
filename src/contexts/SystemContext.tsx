import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useUser } from "./UserContext";

interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessageAr: string;
  maintenanceMessageEn: string;
  minVersion: string;
  registrationEnabled: boolean;
}

interface SystemContextType {
  settings: SystemSettings;
  loading: boolean;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    maintenanceMessageAr: "المنصة في وضع الصيانة حالياً. سنعود قريباً إن شاء الله.",
    maintenanceMessageEn: "The platform is currently in maintenance mode. We will be back soon, insha'Allah.",
    minVersion: "1.0.0",
    registrationEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUser();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    }, (error) => {
      console.error("System settings error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <SystemContext.Provider value={{ settings, loading }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) throw new Error("useSystem must be used within a SystemProvider");
  return context;
};
