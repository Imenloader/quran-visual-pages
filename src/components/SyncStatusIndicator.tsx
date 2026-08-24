import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface SyncStatusIndicatorProps {
  darkTheme?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ darkTheme = false }) => {
  const { i18n, t } = useTranslation();
  const [lastSync, setLastSync] = useState<string | null>(syncService.getLastSyncTime());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    const handleSyncUpdate = (e: any) => {
      setLastSync(e.detail);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('sync-status-updated', handleSyncUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('sync-status-updated', handleSyncUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeAgo = lastSync 
    ? formatDistanceToNow(new Date(lastSync), { 
        addSuffix: true, 
        locale: isArabic ? ar : enUS 
      })
    : t('sync.notSynced');

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-[10px] md:text-[11px] font-medium shadow-sm transition-all ${
        darkTheme ? "bg-black/20 border-white/10 text-white" : "bg-card/40 border-border/40 text-foreground"
      }`}
      title={t('sync.statusTitle')}
    >
      <div className="relative">
        {isOnline ? (
          <>
            <Cloud size={14} className={darkTheme ? "text-emerald-400" : "text-emerald-500"} />
            <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping ${darkTheme ? "bg-emerald-400" : "bg-emerald-500"}`} />
          </>
        ) : (
          <CloudOff size={14} className={darkTheme ? "text-white/40" : "text-muted-foreground"} />
        )}
      </div>
      
      <div className="flex flex-col leading-tight">
        <span className={isOnline ? (darkTheme ? "text-white" : "text-primary") : (darkTheme ? "text-white/60" : "text-muted-foreground")}>
          {isOnline ? t('sync.connected') : t('sync.offline')}
        </span>
        <span className={`text-[8px] opacity-70 ${darkTheme ? "text-white/70" : "text-muted-foreground"}`}>
          {t('sync.lastSync')} {timeAgo}
        </span>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
