import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Layout
} from "lucide-react";
import { db } from "@/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  onSnapshot
} from "firebase/firestore";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

interface HubTool {
  id: string;
  name: string;
  path: string;
  visible: boolean;
  order: number;
}

interface HubSection {
  id: string;
  title: string;
  tools: HubTool[];
}

const HubManager = () => {
  const [sections, setSections] = useState<HubSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "hub"), (snap) => {
      if (snap.exists()) {
        setSections(snap.data().sections as HubSection[]);
      } else {
        // We'll initialize from the default structure if not found
        // For now, let's just use empty
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "hub"), { sections });
      toast.success("تم حفظ إعدادات المركز بنجاح");
    } catch (error) {
      toast.error("فشل في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleToolVisibility = (sIdx: number, tIdx: number) => {
    const updated = [...sections];
    updated[sIdx].tools[tIdx].visible = !updated[sIdx].tools[tIdx].visible;
    setSections(updated);
  };

  const updateToolName = (sIdx: number, tIdx: number, newName: string) => {
    const updated = [...sections];
    updated[sIdx].tools[tIdx].name = newName;
    setSections(updated);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-bold font-naskh text-foreground">إدارة المركز (Hub)</h1>
              <p className="text-[10px] text-muted-foreground font-naskh">التحكم في ظهور وترتيب الأدوات</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </header>

        <div className="space-y-8">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-4">
              <h2 className="text-sm font-bold font-naskh text-accent px-2 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.tools.map((tool, tIdx) => (
                  <div key={tool.id} className={`p-4 bg-card border border-border rounded-2xl flex items-center justify-between transition-all ${!tool.visible && "opacity-50 grayscale"}`}>
                    <div className="flex-1 mr-4">
                      <input 
                        type="text" 
                        value={tool.name}
                        onChange={(e) => updateToolName(sIdx, tIdx, e.target.value)}
                        className="bg-transparent font-bold font-naskh text-sm w-full outline-none focus:text-accent"
                      />
                      <p className="text-[8px] text-muted-foreground">{tool.path}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleToolVisibility(sIdx, tIdx)}
                        className={`p-2 rounded-xl transition-colors ${tool.visible ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                      >
                        {tool.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-24 bg-card border border-border rounded-[2.5rem] space-y-4">
              <p className="text-muted-foreground font-naskh text-sm">لم يتم تهيئة إعدادات المركز بعد</p>
              <button 
                onClick={() => {
                   // Initial seed logic would go here
                   toast.info("يرجى تفعيل التهيئة من الكود أولاً");
                }}
                className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold"
              >
                بدء التهيئة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HubManager;
