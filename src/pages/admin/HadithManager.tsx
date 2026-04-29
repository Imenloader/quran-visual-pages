import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, X, Search, Quote, Scroll, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import BackButton from "@/components/BackButton";

interface Hadith {
  docId?: string;
  text: string;
  source: string;
  grade: string;
  category: string;
  narrator: string;
}

const HadithManager = () => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Hadith>({
    text: "",
    source: "",
    grade: "صحيح",
    category: "عام",
    narrator: ""
  });

  useEffect(() => {
    fetchHadiths();
  }, []);

  const fetchHadiths = async () => {
    try {
      const q = query(collection(db, "content_hadiths"), limit(100));
      const snap = await getDocs(q);
      setHadiths(snap.docs.map(d => ({ docId: d.id, ...d.data() } as Hadith)));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل الأحاديث");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.text) return;
    try {
      const docRef = await addDoc(collection(db, "content_hadiths"), formData);
      setHadiths([{ docId: docRef.id, ...formData }, ...hadiths]);
      setIsAdding(false);
      setFormData({ text: "", source: "", grade: "صحيح", category: "عام", narrator: "" });
      toast.success("تم إضافة الحديث بنجاح");
    } catch (err) {
      toast.error("فشل الإضافة");
    }
  };

  const handleUpdate = async (docId: string) => {
    try {
      await updateDoc(doc(db, "content_hadiths", docId), formData as any);
      setHadiths(hadiths.map(h => h.docId === docId ? { ...h, ...formData } : h));
      setEditingId(null);
      toast.success("تم التحديث بنجاح");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("هل تريد حذف هذا الحديث؟")) return;
    try {
      await deleteDoc(doc(db, "content_hadiths", docId));
      setHadiths(hadiths.filter(h => h.docId !== docId));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const startEdit = (h: Hadith) => {
    setEditingId(h.docId!);
    setFormData({ ...h });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Scroll className="text-amber-500" />
              إدارة الأحاديث النبوية
            </h1>
            <p className="text-muted-foreground mt-1">إضافة وتوثيق الأحاديث النبوية في المكتبة</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} />
          إضافة حديث جديد
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث في الأحاديث..." 
          className="pr-10 rounded-xl"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isAdding && (
          <div className="bento-card !p-8 border-2 border-primary/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="الراوي (مثلاً: أبو هريرة)" value={formData.narrator} onChange={e => setFormData({...formData, narrator: e.target.value})} className="rounded-xl" />
                <Input placeholder="المصدر (مثلاً: صحيح البخاري)" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="rounded-xl" />
                <Input placeholder="درجة الصحة (مثلاً: صحيح)" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="rounded-xl" />
              </div>
              <Textarea placeholder="نص الحديث الشريف..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="rounded-xl h-32 text-lg font-naskh" />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={handleAdd} className="rounded-xl px-8">حفظ الحديث</Button>
              </div>
            </div>
          )}

          {hadiths.map((h) => (
            <div key={h.docId} className="bento-card !p-6 space-y-4 group">
              {editingId === h.docId ? (
                <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input value={formData.narrator} onChange={e => setFormData({...formData, narrator: e.target.value})} className="rounded-xl" />
                    <Input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="rounded-xl" />
                    <Input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="rounded-xl" />
                  </div>
                  <Textarea value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="rounded-xl h-32 text-lg font-naskh" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">إلغاء</Button>
                    <Button onClick={() => handleUpdate(h.docId!)} className="rounded-xl">تحديث</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-emerald-500" size={16} />
                      <span className="text-xs font-bold text-muted-foreground uppercase">{h.grade}</span>
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/5">{h.source}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(h)} className="h-8 w-8 rounded-lg text-blue-500"><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(h.docId!)} className="h-8 w-8 rounded-lg text-rose-500"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                  <p className="text-xl font-naskh leading-loose text-foreground">{h.text}</p>
                  <p className="text-xs text-muted-foreground italic">الراوي: {h.narrator}</p>
                </div>
              )}
            </div>
          ))}

      </div>
    </div>
  );
};

export default HadithManager;
