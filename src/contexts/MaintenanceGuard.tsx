import React from "react";
import { useSystem } from "./SystemContext";
import { useUser } from "./UserContext";
import MaintenancePage from "@/pages/MaintenancePage";

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { settings, loading: systemLoading } = useSystem();
  const { isAdmin, isAuthReady } = useUser();

  // If we are still loading system settings or auth is not ready, we wait.
  // This prevents flickering the maintenance page while the role is being fetched.
  if (systemLoading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If maintenance mode is ON and user is NOT an admin, show MaintenancePage
  if (settings.maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
