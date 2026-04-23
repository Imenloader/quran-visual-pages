import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Library, Plus, Trash2, Edit2, ExternalLink, Search, Tag, Info, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LibraryItem {
  docId?: string;
  titleAr: string;
  titleEn: string;
  url: string;
  category: string;
  type: 'pdf' | 'web' | 'video';
}

const LibraryManager = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<LibraryItem>({
    titleAr: "",
    titleEn: "",
    url: "",
    category: "كتب",
    type: "web"
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const snap = await getDocs(collection(db, "content_library"));
      setItems(snap.docs.map(d => ({ docId: d.id, ...d.data() } as LibraryItem)));
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل المكتبة");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.titleAr || !formData.url) return;
    try {
      const docRef = await addDoc(collection(db, "content_library"), formData);
      setItems([{ docId: docRef.id, ...formData }, ...items]);
      setIsAdding(false);
      resetForm();
      toast.success("تم إضافة المورد بنجاح");
    } catch (err) {
      toast.error("فشل الإضافة");
    }
  };

  const handleUpdate = async (docId: string) => {
    try {
      await updateDoc(doc(db, "content_library", docId), formData as any);
      setItems(items.map(i => i.docId === docId ? { ...i, ...formData } : i));
      setEditingId(null);
      toast.success("تم التحديث");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("هل تريد حذف هذا المورد؟")) return;
    try {
      await deleteDoc(doc(db, "content_library", docId));
      setItems(items.filter(i => i.docId !== docId));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const resetForm = () => {
    setFormData({ titleAr: "", titleEn: "", url: "", category: "كتب", type: "web" });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Library className="text-emerald-500" />
            إدارة المكتبة الإسلامية
          </h1>
          <p className="text-muted-foreground mt-1">تنظيم المصادر والكتب والروابط الخارجية</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} />
          إضافة مورد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bento-card !p-8 border-2 border-primary/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="العنوان بالعربية" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} className="rounded-xl" />
                <Input placeholder="Title in English" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="rounded-xl" />
                <Input placeholder="الرابط (URL)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="rounded-xl" />
                <div className="flex gap-2">
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="rounded-xl bg-muted/50 border-none px-4 h-10 flex-1">
                    <option value="كتب">كتب</option>
                    <option value="مقالات">مقالات</option>
                    <option value="فيديو">فيديو</option>
                  </select>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="rounded-xl bg-muted/50 border-none px-4 h-10 flex-1">
                    <option value="web">رابط ويب</option>
                    <option value="pdf">ملف PDF</option>
                    <option value="video">فيديو</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={handleAdd} className="rounded-xl px-8">حفظ المورد</Button>
              </div>
            </motion.div>
          )}

          {items.map((item) => (
            <motion.div key={item.docId} layout className="bento-card !p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{item.titleAr}</h3>
                  <div className="flex gap-2 items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                    <Tag size={10} /> {item.category}
                    <span className="opacity-30">|</span>
                    <ExternalLink size={10} /> {item.type}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => window.open(item.url, '_blank')} className="h-8 w-8 text-primary"><ExternalLink size={14} /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.docId!)} className="h-8 w-8 text-rose-500"><Trash2 size={14} /></Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LibraryManager;
