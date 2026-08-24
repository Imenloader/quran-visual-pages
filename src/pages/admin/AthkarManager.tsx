import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  LayoutGrid,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { db } from "@/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import * as Icons from "lucide-react";
import { ATHKAR_DATA, AthkarCategory, Dhikr } from "@/data/athkarData";

const AthkarManager = () => {
  const [categories, setCategories] = useState<AthkarCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AthkarCategory | null>(null);
  
  const [formData, setFormData] = useState<Partial<AthkarCategory>>({
    id: "",
    title: "",
    description: "",
    iconName: "book",
    athkar: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content_athkar"));
      const firestoreData = snap.docs.map(d => d.data() as AthkarCategory);
      setCategories(firestoreData);
    } catch (error) {
      console.error("Fetch Athkar Error:", error);
      toast.error("فشل تحميل الأذكار");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("هل تريد نسخ الأذكار الافتراضية من التطبيق إلى قاعدة البيانات؟")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      ATHKAR_DATA.forEach(cat => {
        const catRef = doc(db, "content_athkar", cat.id);
        batch.set(catRef, {
          ...cat,
          createdAt: Date.now()
        });
      });
      await batch.commit();
      toast.success("تم نسخ الأذكار بنجاح");
      fetchCategories();
    } catch (err) {
      toast.error("فشل النسخ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.title) return;
    try {
      await setDoc(doc(db, "content_athkar", formData.id), formData);
      toast.success("تم حفظ التصنيف بنجاح");
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error("فشل في الحفظ");
    }
  };

  const addDhikrRow = () => {
    const newDhikr: Dhikr = {
      id: Date.now(),
      text: "",
      reference: "",
      count: 1
    };
    setFormData(prev => ({
      ...prev,
      athkar: [...(prev.athkar || []), newDhikr]
    }));
  };

  const removeDhikrRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      athkar: prev.athkar?.filter((_, i) => i !== index)
    }));
  };

  const updateDhikrField = (index: number, field: keyof Dhikr, value: any) => {
    const updated = [...(formData.athkar || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, athkar: updated });
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-bold font-naskh">إدارة الأذكار</h1>
              <p className="text-[10px] text-muted-foreground">تعديل التصنيفات الحالية أو إضافة أذكار جديدة</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ id: "", title: "", description: "", iconName: "book", athkar: [] });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            تصنيف جديد
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-5 glass-card hover:-translate-y-1 rounded-3xl flex items-center justify-between group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-naskh text-foreground">{cat.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{cat.athkar.length} ذكر</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingCategory(cat);
                    setFormData(cat);
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-full text-center py-24 glass-card hover:-translate-y-1 rounded-[2.5rem] space-y-4">
                <p className="text-muted-foreground font-naskh text-sm">لا توجد أذكار في قاعدة البيانات</p>
                <button 
                  onClick={handleSeed}
                  className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl"
                >
                  نسخ الأذكار الافتراضية لقاعدة البيانات
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
          <div className="fixed inset-0 z-[700] bg-background flex flex-col p-4 md:p-8 overflow-hidden">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
              <header className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold font-naskh">{editingCategory ? "تعديل التصنيف" : "تصنيف جديد"}</h2>
                </div>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center gap-2 shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  حفظ في السحابة
                </button>
              </header>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-12">
                {/* Meta Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 glass-card hover:-translate-y-1 rounded-[2.5rem] p-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">المعرف (Unique ID)</label>
                    <input 
                      type="text" 
                      value={formData.id} 
                      disabled={!!editingCategory}
                      onChange={e => setFormData({ ...formData, id: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm disabled:opacity-50"
                      placeholder="e.g. travel"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">العنوان</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">الوصف</label>
                    <input 
                      type="text" 
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Athkar List Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="text-lg font-bold font-naskh">محتوى الأذكار</h3>
                    <button 
                      onClick={addDhikrRow}
                      className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      إضافة ذكر جديد
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.athkar?.map((dhikr, idx) => (
                      <div key={dhikr.id} className="p-6 glass-card hover:-translate-y-1 rounded-[2rem] space-y-4 relative group">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-4">
                            <textarea 
                              value={dhikr.text}
                              onChange={e => updateDhikrField(idx, 'text', e.target.value)}
                              rows={3}
                              className="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 text-lg font-naskh leading-loose focus:border-accent outline-none"
                              dir="rtl"
                              placeholder="نص الذكر..."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input 
                                value={dhikr.reference}
                                onChange={e => updateDhikrField(idx, 'reference', e.target.value)}
                                className="w-full bg-muted/30 border border-border/50 rounded-xl p-3 text-xs font-naskh"
                                placeholder="المصدر (رواه مسلم...)"
                                dir="rtl"
                              />
                              <div className="flex items-center gap-4 px-3 bg-muted/30 border border-border/50 rounded-xl">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">التكرار:</span>
                                <input 
                                  type="number"
                                  value={dhikr.count}
                                  onChange={e => updateDhikrField(idx, 'count', parseInt(e.target.value))}
                                  className="w-12 bg-transparent text-center font-bold text-accent"
                                />
                              </div>
                            </div>
                            <textarea 
                              value={dhikr.virtue}
                              onChange={e => updateDhikrField(idx, 'virtue', e.target.value)}
                              className="w-full bg-muted/20 border border-transparent rounded-xl p-3 text-[10px] font-naskh text-muted-foreground italic"
                              placeholder="الفضل (اختياري)..."
                              dir="rtl"
                            />
                          </div>
                          <button 
                            onClick={() => removeDhikrRow(idx)}
                            className="p-2 h-fit rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AthkarManager;
