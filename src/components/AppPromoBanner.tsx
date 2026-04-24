import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, Store, X } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

const AppPromoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [links, setLinks] = useState<{ direct?: string; playStore?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLinks({
          direct: data.appDirectDownloadUrl,
          playStore: data.appPlayStoreUrl
        });
      }
      setLoading(false);
    });
    
    // Check if dismissed before
    const dismissed = localStorage.getItem('app-banner-dismissed');
    if (dismissed === 'true') {
      setVisible(false);
    }

    return () => unsub();
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border-b border-white/10"
      >
        <div className="absolute inset-0 pattern-islamic opacity-5" />
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          
          {/* Content */}
          <div className="flex items-center gap-4 text-right sm:text-right">
            <div className="hidden md:flex w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md items-center justify-center text-gold border border-white/20">
              <Smartphone size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-white font-bold font-naskh text-sm sm:text-base leading-tight">
                حمل تطبيق قرآنيات الرسمي للهاتف
              </h3>
              <p className="text-white/70 text-[10px] sm:text-xs font-naskh mt-1 max-w-md">
                استمتع بتجربة إيمانية متكاملة مع التلاوات والتنبيهات، متوفر الآن للتحميل المباشر وعلى متجر Google Play.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {links.direct ? (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={links.direct}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gold text-emerald-900 rounded-xl font-bold text-xs font-naskh shadow-lg shadow-black/20 hover:bg-gold/90 transition-all"
              >
                <Download size={16} />
                تحميل مباشر
              </motion.a>
            ) : (
              <div className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[10px] font-naskh">
                التحميل المباشر يتوفر قريباً
              </div>
            )}

            {links.playStore ? (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={links.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-xs font-naskh hover:bg-white/20 transition-all"
              >
                <Store size={16} />
                Google Play
              </motion.a>
            ) : (
              <div className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[10px] font-naskh">
                قريباً على متجر التطبيقات
              </div>
            )}

            <button 
              onClick={handleDismiss}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppPromoBanner;
