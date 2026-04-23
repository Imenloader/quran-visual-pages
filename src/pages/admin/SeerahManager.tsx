import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, X, Search, History, Star, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import BackButton from "@/components/BackButton";

interface SeerahEvent {
  docId?: string;
  year: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
}

const SeerahManager = () => {
  const [events, setEvents] = useState<SeerahEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<SeerahEvent>({
    year: "",
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "مكي"
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "content_seerah"), orderBy("year"));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(d => ({ docId: d.id, ...d.data() } as SeerahEvent)));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل أحداث السيرة");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.titleAr || !formData.year) return;
    try {
      const docRef = await addDoc(collection(db, "content_seerah"), formData);
      setEvents([{ docId: docRef.id, ...formData }, ...events]);
      setIsAdding(false);
      resetForm();
      toast.success("تم إضافة الحدث بنجاح");
    } catch (err) {
      toast.error("فشل الإضافة");
    }
  };

  const handleUpdate = async (docId: string) => {
    try {
      await updateDoc(doc(db, "content_seerah", docId), formData as any);
      setEvents(events.map(e => e.docId === docId ? { ...e, ...formData } : e));
      setEditingId(null);
      toast.success("تم التحديث بنجاح");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("هل تريد حذف هذا الحدث؟")) return;
    try {
      await deleteDoc(doc(db, "content_seerah", docId));
      setEvents(events.filter(e => e.docId !== docId));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const resetForm = () => {
    setFormData({ year: "", titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", category: "مكي" });
  };

  const startEdit = (e: SeerahEvent) => {
    setEditingId(e.docId!);
    setFormData({ ...e });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="text-primary" />
              إدارة السيرة النبوية
            </h1>
            <p className="text-muted-foreground mt-1">بناء الخط الزمني للسيرة النبوية الشريفة</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} />
          إضافة حدث تاريخي
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث في أحداث السيرة..." 
          className="pr-10 rounded-xl"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bento-card !p-8 border-2 border-primary/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="السنة (مثلاً: 1 هـ)" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="rounded-xl" />
                <Input placeholder="العنوان بالعربية" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} className="rounded-xl font-bold" />
                <select 
                  className="rounded-xl bg-card border border-border px-4 py-2"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="مكي">مكي</option>
                  <option value="مدني">مدني</option>
                </select>
              </div>
              <Textarea placeholder="وصف الحدث بالتفصيل..." value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="rounded-xl h-24" />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={handleAdd} className="rounded-xl px-8">حفظ الحدث</Button>
              </div>
            </motion.div>
          )}

          {events.map((event) => (
            <motion.div key={event.docId} layout className="bento-card !p-6 flex gap-6 group">
              <div className="w-24 h-24 shrink-0 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                <Calendar size={20} className="mb-1" />
                <span className="font-bold text-lg">{event.year}</span>
              </div>
              <div className="flex-1 space-y-2">
                {editingId === event.docId ? (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="rounded-xl" />
                      <Input value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} className="rounded-xl font-bold" />
                    </div>
                    <Textarea value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="rounded-xl h-24" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">إلغاء</Button>
                      <Button onClick={() => handleUpdate(event.docId!)} className="rounded-xl">تحديث</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold font-naskh">{event.titleAr}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(event)} className="h-8 w-8 rounded-lg text-blue-500"><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event.docId!)} className="h-8 w-8 rounded-lg text-rose-500"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{event.descriptionAr}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${event.category === 'مكي' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {event.category}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeerahManager;
