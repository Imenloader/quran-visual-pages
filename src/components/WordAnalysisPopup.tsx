import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react'; // تأكد أن هذه هي المكتبة التي تستخدمها
import { X, Book, FileText, Info, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WordAnalysisPopupProps {
  word: string;
  location: string; // مثال: "1:1:3"
  surahNumber: number;
  ayahNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({
  word,
  location,
  surahNumber,
  ayahNumber,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [wordMeaning, setWordMeaning] = useState<string>('');
  const [ayahTafsir, setAyahTafsir] = useState<string>('');
  const [ayahIrab, setAyahIrab] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const formatLocationArabic = (locString: string, surahNum: number) => {
    if (!locString) return '';
    const parts = locString.split(':');
    if (parts.length === 3) {
      return `سورة ${surahNum}، آية ${parts[1]}، الكلمة ${parts[2]}`;
    }
    return locString;
  };

  useEffect(() => {
    if (!isOpen || !location) return;

    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. جلب معنى الكلمة الدقيق باللغة العربية
        const wordRes = fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?words=true&word_translation_language=ar`);
        
        // 2. جلب إعراب الآية كاملاً من مصدر عربي موثوق
        const irabRes = fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.irab`);
        
        // 3. جلب التفسير الميسر للآية
        const tafsirRes = fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`);

        const [wordResponse, irabResponse, tafsirResponse] = await Promise.all([wordRes, irabRes, tafsirRes]);

        const wordData = wordResponse.ok ? await wordResponse.json() : null;
        const irabData = irabResponse.ok ? await irabResponse.json() : null;
        const tafsirData = tafsirResponse.ok ? await tafsirResponse.json() : null;

        // استخراج معنى الكلمة من مصفوفة الكلمات
        if (wordData?.verse?.words) {
          const specificWord = wordData.verse.words.find((w: any) => w.location === location);
          let translation = specificWord?.translation?.text;
          // إذا كانت الترجمة مطابقة للكلمة فهذا يعني غالباً أنها حرف أو ليس لها ترجمة مستقلة
          if (!translation || translation === word) {
            setWordMeaning('أداة / حرف / كلمة ليس لها معنى مستقل');
          } else {
            setWordMeaning(translation);
          }
        }

        // استخراج الإعراب
        if (irabData?.data?.text) {
          setAyahIrab(irabData.data.text);
        } else {
          setAyahIrab('إعراب الآية غير متوفر حالياً.');
        }

        // استخراج التفسير
        if (tafsirData?.data?.text) {
          setAyahTafsir(tafsirData.data.text);
        } else {
          setAyahTafsir('التفسير غير متوفر حالياً.');
        }

      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError('حدث خطأ أثناء جلب البيانات. الرجاء التأكد من اتصالك بالإنترنت.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [isOpen, location, surahNumber, ayahNumber]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()} 
        >
          {/* رأس النافذة */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0" dir="rtl">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-2xl text-primary font-amiri">
                {word}
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                {formatLocationArabic(location, surahNumber)}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* المحتوى القابل للتمرير */}
          <div className="p-5 overflow-y-auto flex-1" dir="rtl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">جاري جلب البيانات من المصادر العربية...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* معنى الكلمة */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                    <Info className="w-5 h-5" />
                    <h4 className="font-bold text-lg">معنى الكلمة</h4>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-amiri leading-relaxed">
                    {wordMeaning}
                  </p>
                </div>

                {/* التفسير الميسر */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-300">
                    <Book className="w-5 h-5" />
                    <h4 className="font-bold text-lg">التفسير الميسر للآية</h4>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-amiri leading-loose">
                    {ayahTafsir}
                  </p>
                </div>

                {/* الإعراب النحوي */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
                    <FileText className="w-5 h-5" />
                    <h4 className="font-bold text-lg">إعراب الآية</h4>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-amiri leading-loose whitespace-pre-wrap">
                    {ayahIrab}
                  </p>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
