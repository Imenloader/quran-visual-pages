import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, X, Search, Heart as LucideHeart, Info, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NAMES_OF_ALLAH, type NameOfAllah } from "@/data/namesOfAllahData";

const NamesOfAllahManager = () => {
  const [names, setNames] = useState<NameOfAllah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    transliteration: "",
    meaning: { ar: "", en: "" },
    description: { ar: "", en: "" },
    audioUrl: ""
  });

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const q = query(collection(db, "content_names_of_allah"), orderBy("id", "asc"));
      const snap = await getDocs(q);
      const remoteNames = snap.docs.map(d => ({ docId: d.id, ...d.data() } as any));
      setNames(remoteNames);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل الأسماء من السحابة");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("نسخ أسماء الله الحسنى؟")) return;
    setLoading(true);
    try {
      const { NAMES_OF_ALLAH } = await import("@/data/namesOfAllahData");
      const batchPromises = NAMES_OF_ALLAH.map(name => 
        addDoc(collection(db, "content_names_of_allah"), {
          ...name,
          createdAt: Date.now()
        })
      );
      await Promise.all(batchPromises);
      toast.success("تم النسخ بنجاح");
      fetchNames();
    } catch (err) {
      toast.error("فشل النسخ");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.transliteration) return;
    try {
      const newName = {
        ...formData,
        id: Date.now(), // Unique ID for ordering if needed
      };
      const docRef = await addDoc(collection(db, "content_names_of_allah"), newName);
      setNames([{ docId: docRef.id, ...newName }, ...names]);
      setIsAdding(false);
      setFormData({ name: "", transliteration: "", meaning: { ar: "", en: "" }, description: { ar: "", en: "" }, audioUrl: "" });
      toast.success("تم إضافة الاسم بنجاح");
    } catch (err) {
      toast.error("فشل الإضافة");
    }
  };

  const handleUpdate = async (docId: string) => {
    try {
      const nameRef = doc(db, "content_names_of_allah", docId);
      await updateDoc(nameRef, formData);
      setNames(names.map(n => (n as any).docId === docId ? { ...n, ...formData } : n));
      setEditingId(null);
      toast.success("تم التحديث بنجاح");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الاسم؟")) return;
    try {
      await deleteDoc(doc(db, "content_names_of_allah", docId));
      setNames(names.filter(n => (n as any).docId !== docId));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const startEdit = (name: any) => {
    setEditingId(name.docId);
    setFormData({
      name: name.name,
      transliteration: name.transliteration,
      meaning: name.meaning,
      description: name.description,
      audioUrl: name.audioUrl || ""
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <LucideHeart className="text-rose-500" />
              إدارة أسماء الله الحسنى
            </h1>
            <p className="text-muted-foreground mt-1">أضف أو عدل أسماء الله الحسنى في التطبيق</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} />
          إضافة اسم جديد
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث في الأسماء..." 
          className="pr-10 rounded-xl"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bento-card !p-6 border-dashed border-2 border-primary/30 space-y-4"
            >
              <h3 className="font-bold flex items-center gap-2">
                <Plus className="text-primary" size={16} />
                اسم جديد
              </h3>
              <div className="space-y-3">
                <Input placeholder="الاسم (مثلاً: الرحمن)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
                <Input placeholder="الترجمة الصوتية (Transliteration)" value={formData.transliteration} onChange={e => setFormData({...formData, transliteration: e.target.value})} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="المعنى بالعربية" value={formData.meaning.ar} onChange={e => setFormData({...formData, meaning: {...formData.meaning, ar: e.target.value}})} className="rounded-xl" />
                  <Input placeholder="Meaning in English" value={formData.meaning.en} onChange={e => setFormData({...formData, meaning: {...formData.meaning, en: e.target.value}})} className="rounded-xl" />
                </div>
                <Textarea placeholder="وصف الاسم بالعربية" value={formData.description.ar} onChange={e => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} className="rounded-xl" />
                <Textarea placeholder="Description in English" value={formData.description.en} onChange={e => setFormData({...formData, description: {...formData.description, en: e.target.value}})} className="rounded-xl" />
                <div className="flex gap-2">
                  <Button onClick={handleAdd} className="flex-1 rounded-xl">حفظ</Button>
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">إلغاء</Button>
                </div>
              </div>
            </motion.div>
          )}

          {names.map((n: any) => (
            <motion.div key={n.docId} layout className="bento-card !p-6 space-y-4 relative group">
              {editingId === n.docId ? (
                <div className="space-y-3">
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
                  <Input value={formData.transliteration} onChange={e => setFormData({...formData, transliteration: e.target.value})} className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={formData.meaning.ar} onChange={e => setFormData({...formData, meaning: {...formData.meaning, ar: e.target.value}})} className="rounded-xl" />
                    <Input value={formData.meaning.en} onChange={e => setFormData({...formData, meaning: {...formData.meaning, en: e.target.value}})} className="rounded-xl" />
                  </div>
                  <Textarea value={formData.description.ar} onChange={e => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} className="rounded-xl h-24" />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(n.docId)} className="flex-1 rounded-xl">تحديث</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">إلغاء</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold font-naskh">
                      {n.name}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(n)} className="rounded-lg h-8 w-8 text-blue-500">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(n.docId)} className="rounded-lg h-8 w-8 text-rose-500">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{n.transliteration}</h3>
                    <p className="text-primary text-xs font-bold">{n.meaning.ar}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{n.description.ar}</p>
                </>
              )}
            </motion.div>
          ))}

          {names.length === 0 && !loading && (
            <div className="col-span-full text-center py-24 bg-card border border-border rounded-[2.5rem] space-y-4">
              <p className="text-muted-foreground font-naskh text-sm">لا توجد أسماء مخصصة حالياً</p>
              <button 
                onClick={handleSeed}
                className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl"
              >
                نسخ الأسماء الافتراضية لقاعدة البيانات
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Info className="text-primary" size={20} />
          الأسماء الافتراضية ({NAMES_OF_ALLAH.length})
        </h2>
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/40 text-xs text-muted-foreground">
          الأسماء الموجودة في الكود (Hardcoded) تظهر تلقائياً للمستخدمين. يمكنك إضافة أسماء إضافية أو بديلة هنا.
        </div>
      </div>
    </div>
  );
};

export default NamesOfAllahManager;
