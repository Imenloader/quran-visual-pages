import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  LayoutGrid,
  Loader2,
  Check,
  Brain,
  Star
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
  orderBy,
  writeBatch
} from "firebase/firestore";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

interface Question {
  id: string | number;
  category: "quran" | "fiqh" | "sahaba";
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
}

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<Partial<Question>>({
    category: "quran",
    questionAr: "",
    questionEn: "",
    optionsAr: ["", "", "", ""],
    optionsEn: ["", "", "", ""],
    correctIndex: 0,
    explanationAr: "",
    explanationEn: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content_quiz"));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      setQuestions(docs);
    } catch (error) {
      toast.error("فشل في تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("نسخ الأسئلة الافتراضية؟")) return;
    setLoading(true);
    try {
      const { QUIZ_QUESTIONS } = await import("@/data/quizData");
      const batch = writeBatch(db);
      QUIZ_QUESTIONS.forEach(q => {
        const qRef = doc(collection(db, "content_quiz"));
        batch.set(qRef, {
          ...q,
          createdAt: Date.now()
        });
      });
      await batch.commit();
      toast.success("تم النسخ بنجاح");
      fetchQuestions();
    } catch (err) {
      toast.error("فشل النسخ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.questionAr || !formData.questionEn) return;
    try {
      if (editingQuestion) {
        await updateDoc(doc(db, "content_quiz", editingQuestion.id.toString()), formData);
        toast.success("تم التحديث");
      } else {
        await addDoc(collection(db, "content_quiz"), { ...formData, createdAt: Date.now() });
        toast.success("تمت الإضافة");
      }
      setShowModal(false);
      fetchQuestions();
    } catch (error) {
      toast.error("فشل في الحفظ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف السؤال؟")) return;
    try {
      await deleteDoc(doc(db, "content_quiz", id));
      fetchQuestions();
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const filtered = questions.filter(q => q.questionAr.includes(searchQuery) || q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-bold font-naskh">إدارة المسابقات</h1>
              <p className="text-[10px] text-muted-foreground font-naskh">إضافة أسئلة جديدة للمسابقة الإسلامية</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingQuestion(null); setFormData({ category: "quran", questionAr: "", questionEn: "", optionsAr: ["", "", "", ""], optionsEn: ["", "", "", ""], correctIndex: 0, explanationAr: "", explanationEn: "" }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            سؤال جديد
          </button>
        </header>

        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الأسئلة..."
            className="w-full glass-card rounded-[2rem] py-4 pr-12 text-sm font-naskh"
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" /></div>
          ) : filtered.length > 0 ? (
            filtered.map(q => (
              <div key={q.id} className="p-5 glass-card hover:-translate-y-1 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center"><Brain size={20} /></div>
                  <div>
                    <h3 className="font-bold font-naskh text-sm truncate max-w-[200px]">{q.questionAr}</h3>
                    <p className="text-[10px] text-muted-foreground">{q.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingQuestion(q); setFormData(q); setShowModal(true); }} className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(q.id.toString())} className="p-2 rounded-lg bg-red-500/10 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 glass-card hover:-translate-y-1 rounded-[2.5rem] space-y-4">
              <p className="text-muted-foreground font-naskh text-sm">لا توجد أسئلة حالياً</p>
              <button 
                onClick={handleSeed}
                className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl"
              >
                إضافة الأسئلة الافتراضية
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="w-full max-w-2xl glass-card hover:-translate-y-1 rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-naskh">تحرير سؤال</h2>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">التصنيف</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full p-3 bg-muted/50 border rounded-xl text-sm">
                      <option value="quran">قرآن</option>
                      <option value="fiqh">فقه</option>
                      <option value="sahaba">صحابة</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">الإجابة الصحيحة (0-3)</label>
                    <input type="number" min="0" max="3" value={formData.correctIndex} onChange={e => setFormData({ ...formData, correctIndex: parseInt(e.target.value) })} className="w-full p-3 bg-muted/50 border rounded-xl text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  <input value={formData.questionAr} onChange={e => setFormData({ ...formData, questionAr: e.target.value })} className="w-full p-3 bg-muted/50 border rounded-xl text-sm font-naskh" dir="rtl" placeholder="السؤال بالعربي" />
                  <input value={formData.questionEn} onChange={e => setFormData({ ...formData, questionEn: e.target.value })} className="w-full p-3 bg-muted/50 border rounded-xl text-sm" placeholder="Question in English" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground">الخيارات بالعربي</p>
                    {formData.optionsAr?.map((opt, i) => (
                      <input key={i} value={opt} onChange={e => { const n = [...(formData.optionsAr || [])]; n[i] = e.target.value; setFormData({ ...formData, optionsAr: n }); }} className="w-full p-2 bg-muted/30 border rounded-lg text-xs font-naskh" dir="rtl" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground">Options in English</p>
                    {formData.optionsEn?.map((opt, i) => (
                      <input key={i} value={opt} onChange={e => { const n = [...(formData.optionsEn || [])]; n[i] = e.target.value; setFormData({ ...formData, optionsEn: n }); }} className="w-full p-2 bg-muted/30 border rounded-lg text-xs" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea value={formData.explanationAr} onChange={e => setFormData({ ...formData, explanationAr: e.target.value })} className="w-full p-3 bg-muted/50 border rounded-xl text-xs font-naskh" dir="rtl" placeholder="التفسير بالعربي" />
                  <textarea value={formData.explanationEn} onChange={e => setFormData({ ...formData, explanationEn: e.target.value })} className="w-full p-3 bg-muted/50 border rounded-xl text-xs" placeholder="Explanation in English" />
                </div>

                <button onClick={handleSave} className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={18} /> حفظ السؤال</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default QuizManager;
