import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, Save, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { juzData, toArabicNumber } from "@/data/quranData";

const JuzImporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [juzText, setJuzText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleSave = async () => {
    if (!juzText.trim()) {
      toast.error("يرجى إدخال نص الجزء أولاً");
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage exactly as entered
      localStorage.setItem(`quran-juz-text-${selectedJuz}`, juzText);
      
      // Also update a timestamp to notify components
      localStorage.setItem("quran-text-updated", Date.now().toString());
      
      toast.success(`تم تحديث نص ${juzData.find(j => j.number === selectedJuz)?.nameAr} بنجاح`);
      setShowExport(true); // Show export option after saving
    } catch (error) {
      console.error("Error saving Juz text:", error);
      toast.error("حدث خطأ أثناء حفظ النص");
    } finally {
      setIsSaving(false);
    }
  };

  const copyCodeForAI = () => {
    const data = {
      juzNumber: selectedJuz,
      text: juzText
    };
    const code = `Please update the Quran data for Juz ${selectedJuz} in src/data/juzTextData.ts with this text:\n\n${JSON.stringify(data, null, 2)}\n\nUpdate the juzTextData object by adding or updating the key ${selectedJuz} with the provided text.`;
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود! أرسله للمساعد الذكي لتحديث الكود المصدري");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary text-gold font-serif font-bold shadow-lg hover:shadow-primary/20 transition-all border border-primary/10"
      >
        <Wand2 size={20} />
        <span>المستورد السحري (Juz Importer)</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl border border-border/40 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-emerald-deep text-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-gold">
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold">تحديث نص الجزء</h2>
                    <p className="text-xs text-white/60 font-serif italic">استيراد يدوي لنص القرآن الكريم</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* Juz Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary/70 uppercase tracking-widest px-1">اختر الجزء</label>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {juzData.map((juz) => (
                      <button
                        key={juz.number}
                        onClick={() => setSelectedJuz(juz.number)}
                        className={`h-12 rounded-xl font-serif text-sm transition-all border ${
                          selectedJuz === juz.number
                            ? "bg-emerald-deep text-gold border-emerald-deep shadow-md"
                            : "bg-primary/5 text-primary border-primary/5 hover:border-accent/30"
                        }`}
                      >
                        {toArabicNumber(juz.number)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-primary/70 uppercase tracking-widest">نص الجزء</label>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      سيتم الحفاظ على التشكيل وعلامات التجويد بنسبة ١٠٠٪
                    </span>
                  </div>
                  <textarea
                    value={juzText}
                    onChange={(e) => setJuzText(e.target.value)}
                    placeholder="قم بلصق نص الجزء هنا..."
                    className="w-full h-80 p-8 rounded-[1.5rem] bg-primary/5 border border-primary/10 focus:border-accent/50 outline-none font-quran text-2xl text-center dir-rtl resize-none transition-all"
                    style={{ 
                      lineHeight: "2.2", 
                      wordSpacing: "-0.05em"
                    }}
                    dir="rtl"
                  />
                </div>

                {/* Warning/Info */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-xs text-amber-700 font-serif leading-relaxed">
                    تنبيه: سيتم استبدال أي نص موجود مسبقاً لهذا الجزء. تأكد من صحة النص المدخل قبل الحفظ.
                  </p>
                </div>

                {showExport && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-emerald-light/10 border-2 border-emerald-light/30 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-emerald-deep">
                      <CheckCircle2 size={24} />
                      <h3 className="font-serif font-bold">تم الحفظ محلياً!</h3>
                    </div>
                    <p className="text-xs text-emerald-deep/80 font-serif leading-relaxed">
                      لجعل هذا التغيير دائماً حتى بعد النشر على Vercel أو Cloudflare، يرجى نسخ الكود أدناه وإرساله للمساعد الذكي (AI) ليقوم بتحديث ملفات المشروع.
                    </p>
                    <button
                      onClick={copyCodeForAI}
                      className="w-full py-4 rounded-2xl bg-emerald-deep text-gold font-serif font-bold flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Save size={20} />
                      <span>نسخ كود التحديث للمساعد الذكي</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/40 bg-muted/30 flex gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-14 rounded-2xl border-2 border-primary/10 text-primary/60 font-serif font-bold hover:bg-primary/5 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !juzText.trim()}
                  className="flex-[2] h-14 rounded-2xl bg-emerald-deep text-gold font-serif font-bold shadow-xl hover:shadow-emerald-deep/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  {isSaving ? (
                    <span className="animate-pulse">جاري الحفظ...</span>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JuzImporter;
