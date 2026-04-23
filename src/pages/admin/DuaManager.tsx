import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  LayoutGrid,
  Loader2,
  Check
} from "lucide-react";
import { db } from "@/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { allDuas, duaCategories } from "@/data/duaData";
import * as Icons from "lucide-react";

interface GlobalDua {
  id: string;
  titleAr: string;
  titleEn: string;
  arabic: string;
  translationAr: string;
  translationEn: string;
  transliteration?: string;
  category: string;
  reference: string;
}

const DuaManager = () => {
  const [duas, setDuas] = useState<GlobalDua[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDua, setEditingDua] = useState<GlobalDua | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<Partial<GlobalDua>>({
    titleAr: "",
    titleEn: "",
    arabic: "",
    translationAr: "",
    translationEn: "",
    transliteration: "",
    category: "daily",
    reference: ""
  });

  useEffect(() => {
    fetchDuas();
  }, []);

  const fetchDuas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "content_duas"), orderBy("titleAr"));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as GlobalDua));
      setDuas(docs);
    } catch (error) {
      console.error("Fetch Duas Error:", error);
      toast.error("فشل في تحميل الأدعية");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("هل تريد نسخ الأدعية الافتراضية من التطبيق إلى قاعدة البيانات؟")) return;
    setLoading(true);
    try {
      const batchPromises = allDuas.map(dua => 
        addDoc(collection(db, "content_duas"), {
          ...dua,
          createdAt: Date.now()
        })
      );
      await Promise.all(batchPromises);
      toast.success("تم نسخ الأدعية بنجاح");
      fetchDuas();
    } catch (err: any) {
      console.error("Seed Error Details:", err);
      toast.error(`فشل النسخ: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.arabic || !formData.titleAr) {
      toast.error("يرجى ملء الحقول الأساسية");
      return;
    }

    try {
      if (editingDua) {
        await updateDoc(doc(db, "content_duas", editingDua.id), formData);
        toast.success("تم تحديث الدعاء");
      } else {
        await addDoc(collection(db, "content_duas"), formData);
        toast.success("تم إضافة الدعاء بنجاح");
      }
      setShowAddModal(false);
      setEditingDua(null);
      setFormData({
        titleAr: "",
        titleEn: "",
        arabic: "",
        translationAr: "",
        translationEn: "",
        transliteration: "",
        category: "daily",
        reference: ""
      });
      fetchDuas();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الدعاء؟")) return;
    try {
      await deleteDoc(doc(db, "content_duas", id));
      toast.success("تم الحذف");
      fetchDuas();
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const filteredDuas = duas.filter(d => 
    d.titleAr.includes(searchQuery) || 
    d.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-bold font-naskh">إدارة مكتبة الأدعية</h1>
              <p className="text-[10px] text-muted-foreground">إضافة وتعديل الأدعية العامة لجميع المستخدمين</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة دعاء جديد
          </button>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الأدعية..."
            className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Duas List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredDuas.length > 0 ? (
            filteredDuas.map(dua => (
              <div key={dua.id} className="p-5 bg-card border border-border rounded-3xl flex items-center justify-between group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-naskh text-foreground">{dua.titleAr}</h3>
                    <p className="text-[10px] text-muted-foreground">{dua.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingDua(dua);
                      setFormData(dua);
                      setShowAddModal(true);
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(dua.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-card border border-border rounded-[2.5rem] space-y-4">
              <p className="text-muted-foreground font-naskh text-sm">لا توجد أدعية حالياً</p>
              <button 
                onClick={handleSeed}
                className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl"
              >
                نسخ الأدعية الافتراضية لقاعدة البيانات
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-naskh">{editingDua ? "تعديل دعاء" : "إضافة دعاء جديد"}</h2>
                <button onClick={() => { setShowAddModal(false); setEditingDua(null); }} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">العنوان (عربي) *</label>
                    <input 
                      type="text" 
                      value={formData.titleAr} 
                      onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">العنوان (En) *</label>
                    <input 
                      type="text" 
                      value={formData.titleEn} 
                      onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">التصنيف</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm"
                    >
                      {duaCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.ar}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">المصدر / المرجع</label>
                    <input 
                      type="text" 
                      value={formData.reference} 
                      onChange={e => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                      placeholder="رواه البخاري، حصن المسلم..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">نص الدعاء (عربي) *</label>
                    <textarea 
                      rows={3}
                      value={formData.arabic} 
                      onChange={e => setFormData({ ...formData, arabic: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh leading-loose"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">الترجمة (عربي)</label>
                    <textarea 
                      rows={2}
                      value={formData.translationAr} 
                      onChange={e => setFormData({ ...formData, translationAr: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Translation (En)</label>
                    <textarea 
                      rows={2}
                      value={formData.translationEn} 
                      onChange={e => setFormData({ ...formData, translationEn: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-bold text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                  <Check className="w-5 h-5" />
                  حفظ الدعاء في قاعدة البيانات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DuaManager;
