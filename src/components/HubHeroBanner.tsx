import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Store, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useTranslation } from 'react-i18next';

const HubHeroBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [links, setLinks] = useState<{ direct?: string; playStore?: string }>({});
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLinks({
          direct: data.appDirectDownloadUrl,
          playStore: data.appPlayStoreUrl
        });
      }
    });
    
    // Check if dismissed session-wise
    const dismissed = sessionStorage.getItem('hub-hero-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }

    return () => unsub();
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-7xl mx-auto px-4 mb-12"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border border-white/10 shadow-2xl">
        {/* Background Patterns */}
        <div className="absolute inset-0 pattern-islamic opacity-[0.03] scale-150" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 p-8 md:p-12">
          
          {/* Mockup - Floating Effect */}
          <motion.div
            initial={{ x: isAr ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`flex justify-center ${isAr ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-64 md:w-72 lg:w-80"
            >
              <div className="absolute inset-0 bg-gold/20 blur-[60px] rounded-full scale-75" />
              <img 
                src="/assets/images/quran_app_mockup.png" 
                alt="Quraaniat Mobile App" 
                className="relative z-10 w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </motion.div>

          {/* Content Area */}
          <div className={`text-center ${isAr ? 'lg:text-right lg:order-2' : 'lg:text-left lg:order-1'} space-y-6`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold tracking-widest uppercase mb-2">
              <Sparkles size={12} />
              {isAr ? "متوفر الآن للهواتف" : "Now available for Mobile"}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.15]">
              {isAr ? (
                <>
                  تجربة قرآنية متكاملة..<br />
                  <span className="text-gold">في تطبيق واحد</span>
                </>
              ) : (
                <>
                  Complete Quranic Experience..<br />
                  <span className="text-gold">In One App</span>
                </>
              )}
            </h1>

            <p className="text-white/70 text-sm md:text-base font-serif max-w-xl leading-relaxed">
              {isAr 
                ? "استمتع بمميزات حصرية، تلاوات خاشعة بدون إنترنت، وتنبيهات الأذكار المخصصة مع تطبيق قرآنيات الرسمي. حمل النسخة الأحدث الآن."
                : "Enjoy exclusive features, offline recitations, and custom Athkar reminders with the official Quraaniat app. Download the latest version now."}
            </p>

            <div className={`flex flex-wrap items-center justify-center ${isAr ? 'lg:justify-start' : 'lg:justify-end'} gap-4 pt-4`}>
              {/* The "Nano" Buttons */}
              {links.direct ? (
                <motion.a
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={links.direct}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3 bg-gold text-emerald-950 rounded-2xl font-bold text-sm font-serif shadow-xl shadow-gold/20 hover:bg-gold/90 transition-all border-b-4 border-gold-dark"
                >
                  <Download size={18} />
                  {isAr ? "تحميل مباشر (APK)" : "Direct Download (APK)"}
                </motion.a>
              ) : (
                <div className="flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-bold text-[10px] font-serif">
                  <Download size={14} />
                  {isAr ? "التحميل المباشر يتوفر قريباً" : "Direct APK Coming Soon"}
                </div>
              )}

              {links.playStore ? (
                <motion.a
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={links.playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm font-serif hover:bg-white/10 transition-all"
                >
                  <Store size={18} />
                  Google Play
                </motion.a>
              ) : (
                <div className="flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-bold text-[10px] font-serif">
                  <Store size={14} />
                  {isAr ? "قريباً على Google Play" : "Play Store Coming Soon"}
                </div>
              )}
            </div>

            <div className={`flex items-center justify-center ${isAr ? 'lg:justify-start' : 'lg:justify-end'} gap-6 opacity-40`}>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Offline</span>
                <div className="w-8 h-1 bg-white/20 rounded-full mt-1" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Fast</span>
                <div className="w-8 h-1 bg-white/20 rounded-full mt-1" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Ad-Free</span>
                <div className="w-8 h-1 bg-white/20 rounded-full mt-1" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default HubHeroBanner;
