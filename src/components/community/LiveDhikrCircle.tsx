import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { communityService, LiveDhikrCircle } from '@/services/communityService';
import { useUser } from '@/contexts/UserContext';
import { Zap, Users, ShieldCheck, Loader2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';

import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const LiveDhikrCircle = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile } = useUser();
  const [circles, setCircles] = useState<LiveDhikrCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(1000);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "live_dhikr_circles"), orderBy("createdAt", "desc"), limit(10)), (snap) => {
      setCircles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveDhikrCircle)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!newTitle || newTarget < 10) return;
    try {
      await communityService.createLiveDhikrCircle(newTitle, newTarget);
      setNewTitle("");
      setShowCreate(false);
      toast.success(isAr ? "تم إنشاء حلقة الذكر" : "Dhikr circle created");
    } catch (e) {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleDhikr = async (circleId: string) => {
    if (!profile?.uid) return;
    try {
      await communityService.updateDhikrCount(circleId, profile.uid, 1);
      // Optional: Local sound or haptic
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-gold" />
          {isAr ? "حلقات الذكر الحية" : "Live Dhikr Circles"}
        </h3>
        
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gap-2">
              <Plus size={16} />
              {isAr ? "حلقة جديدة" : "New Circle"}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>{isAr ? "إنشاء حلقة ذكر جماعية" : "Create Group Dhikr Circle"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">{isAr ? "اسم الذكر" : "Dhikr Name"}</label>
                <Input placeholder="مثلاً: الصلاة على النبي" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">{isAr ? "الهدف الجماعي" : "Group Target"}</label>
                <Input type="number" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} />
              </div>
              <Button onClick={handleCreate} className="w-full rounded-xl" disabled={!newTitle}>{isAr ? "إنشاء" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.map((c) => {
          const progress = Math.min(100, (c.currentCount / c.targetCount) * 100);
          return (
            <div key={c.id} className="p-6 bg-card border border-border/40 rounded-[2.5rem] shadow-sm space-y-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-primary">{c.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                    <Users size={12} />
                    {isAr ? toArabicNumber(c.participants?.length || 0) : c.participants?.length || 0} {isAr ? "ذاكر" : "Participants"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-gold/10 text-gold-deep animate-pulse">
                  <Zap size={24} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-primary">{isAr ? toArabicNumber(c.currentCount) : c.currentCount}</span>
                  <span className="text-xs font-medium text-muted-foreground">/ {isAr ? toArabicNumber(c.targetCount) : c.targetCount}</span>
                </div>
                <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-primary transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              <button 
                onClick={() => c.id && handleDhikr(c.id)}
                className="w-full py-4 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white active:scale-95 transition-all shadow-sm border border-emerald-500/20"
              >
                {isAr ? "سبّح الآن" : "Glorify Now"}
              </button>
            </div>
          );
        })}
      </div>

      {circles.length === 0 && (
        <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border border-dashed">
          <ShieldCheck className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
          <p className="text-xs text-muted-foreground">
            {isAr ? "لا توجد حلقات ذكر نشطة حالياً." : "No active dhikr circles at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveDhikrCircle;
