import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, writeBatch } from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, X, Search, BookOpen, Scroll, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import BackButton from "@/components/BackButton";
import { prophetStories } from "@/data/prophetStoriesData";

interface ProphetStory {
  docId?: string;
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  videoUrl?: string;
  era?: string;
}

const ProphetStoriesManager = () => {
  const [stories, setStories] = useState<ProphetStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<ProphetStory, 'docId'>>({
    id: "",
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    videoUrl: "",
    era: ""
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const q = query(collection(db, "content_prophet_stories"), orderBy("nameAr"));
      const snap = await getDocs(q);
      setStories(snap.docs.map(d => ({ docId: d.id, ...d.data() } as ProphetStory)));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل القصص");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("نسخ قصص الأنبياء الافتراضية؟")) return;
    setLoading(true);
    try {
      console.log("Starting seed process...");
      const data = prophetStories;
      
      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        throw new Error("Invalid data format");
      }

      const batch = writeBatch(db);
      
      data.forEach(story => {
        const newDocRef = doc(collection(db, "content_prophet_stories"));
        batch.set(newDocRef, {
          id: story.id,
          nameAr: story.name,
          nameEn: story.nameEn,
          descriptionAr: story.summary,
          descriptionEn: story.summaryEn,
          era: story.period,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      console.log("Batch committed successfully");
      toast.success("تم النسخ بنجاح");
      fetchStories();
    } catch (err) {
      console.error("Seed error details:", err);
      toast.error(`فشل النسخ: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.nameAr || !formData.descriptionAr) return;
    try {
      const docRef = await addDoc(collection(db, "content_prophet_stories"), {
        ...formData,
        id: Date.now().toString()
      });
      setStories([{ docId: docRef.id, ...formData, id: Date.now().toString() }, ...stories]);
      setIsAdding(false);
      resetForm();
      toast.success("تم إضافة القصة بنجاح");
    } catch (err) {
      toast.error("فشل الإضافة");
    }
  };

  const handleUpdate = async (docId: string) => {
    try {
      await updateDoc(doc(db, "content_prophet_stories", docId), formData as any);
      setStories(stories.map(s => s.docId === docId ? { ...s, ...formData } : s));
      setEditingId(null);
      toast.success("تم التحديث");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await deleteDoc(doc(db, "content_prophet_stories", docId));
      setStories(stories.filter(s => s.docId !== docId));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const resetForm = () => {
    setFormData({ id: "", nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", videoUrl: "", era: "" });
  };

  const startEdit = (story: ProphetStory) => {
    setEditingId(story.docId!);
    setFormData({
      id: story.id,
      nameAr: story.nameAr,
      nameEn: story.nameEn,
      descriptionAr: story.descriptionAr,
      descriptionEn: story.descriptionEn,
      videoUrl: story.videoUrl || "",
      era: story.era || ""
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-naskh">
              <Scroll className="text-amber-500" />
              إدارة قصص الأنبياء
            </h1>
            <p className="text-muted-foreground mt-1">أضف أو عدل قصص الأنبياء في المكتبة</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} />
          إضافة قصة جديدة
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث في القصص..." 
          className="pr-10 rounded-xl"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bento-card !p-8 border-dashed border-2 border-primary/30 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input placeholder="اسم النبي بالعربية" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="rounded-xl h-12 text-lg font-bold" />
                  <Input placeholder="Prophet's Name in English" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl" />
                  <Input placeholder="العصر / الفترة (مثلاً: قبل الطوفان)" value={formData.era} onChange={e => setFormData({...formData, era: e.target.value})} className="rounded-xl" />
                  <Input placeholder="رابط فيديو (YouTube)" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Textarea placeholder="القصة بالعربية..." value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="rounded-xl h-32" />
                  <Textarea placeholder="Story in English..." value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="rounded-xl h-24" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl px-8">إلغاء</Button>
                <Button onClick={handleAdd} className="rounded-xl px-8">حفظ القصة</Button>
              </div>
            </motion.div>
          )}

          {stories.map((story) => (
            <motion.div key={story.docId} layout className="bento-card !p-6 relative group">
              {editingId === story.docId ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="rounded-xl font-bold" />
                    <Input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl" />
                  </div>
                  <Textarea value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} className="rounded-xl h-48" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">إلغاء</Button>
                    <Button onClick={() => handleUpdate(story.docId!)} className="rounded-xl">تحديث</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Scroll size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-naskh">{story.nameAr}</h3>
                          <p className="text-xs text-muted-foreground">{story.era}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(story)} className="h-8 w-8 rounded-lg text-blue-500"><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(story.docId!)} className="h-8 w-8 rounded-lg text-rose-500"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-naskh">{story.descriptionAr}</p>
                    <div className="flex gap-3">
                      {story.videoUrl && <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full"><Video size={10} /> فيديو متوفر</div>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {stories.length === 0 && !loading && (
            <div className="col-span-full text-center py-24 bg-card border border-border rounded-[2.5rem] space-y-4">
              <p className="text-muted-foreground font-naskh text-sm">لا توجد قصص مخصصة حالياً</p>
              <button 
                onClick={handleSeed}
                className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl"
              >
                نسخ القصص الافتراضية لقاعدة البيانات
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProphetStoriesManager;
