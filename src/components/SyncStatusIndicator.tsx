import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const SyncStatusIndicator: React.FC = () => {
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-md border border-border/40 text-[10px] md:text-[11px] font-medium shadow-sm transition-all"
      title={t('sync.statusTitle')}
    >
      <div className="relative">
        {isOnline ? (
          <>
            <Cloud size={14} className="text-emerald-500" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </>
        ) : (
          <CloudOff size={14} className="text-muted-foreground" />
        )}
      </div>
      
      <div className="flex flex-col leading-tight">
        <span className={isOnline ? "text-primary" : "text-muted-foreground"}>
          {isOnline ? t('sync.connected') : t('sync.offline')}
        </span>
        <span className="text-[8px] text-muted-foreground opacity-70">
          {t('sync.lastSync')} {timeAgo}
        </span>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
