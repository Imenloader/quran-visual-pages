import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { communityService, DuaWallRequest } from '@/services/communityService';
import { useUser } from '@/contexts/UserContext';
import { Heart, Send, MessageSquare, Loader2, Star, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';

const DuaWall = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile } = useUser();
  const [duas, setDuas] = useState<DuaWallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDua, setNewDua] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = communityService.subscribeToDuaWall((data) => {
      setDuas(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!profile?.uid) return;
    if (newDua.trim().length < 10) {
      toast.error(isAr ? "الدعاء قصير جداً" : "Dua is too short");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await communityService.submitDuaWallRequest(profile.uid, profile.name, newDua.trim());
      setNewDua("");
      toast.success(isAr ? "تم نشر طلب الدعاء" : "Dua request posted");
    } catch (e) {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePray = async (duaId: string) => {
    if (!profile?.uid) return;
    try {
      await communityService.prayForDua(duaId, profile.uid);
      toast.success(isAr ? "آمين، تقبل الله منك" : "Ameen, may Allah accept from you");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Post Section */}
      <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
        <h3 className="font-serif font-bold text-primary flex items-center gap-2">
          <MessageSquare size={18} />
          {isAr ? "اطلب دعاءً من إخوانك" : "Request a Dua from your siblings"}
        </h3>
        <Textarea 
          placeholder={isAr ? "اكتب هنا ما تحتاجه من دعاء..." : "Write your Dua request here..."}
          className="rounded-3xl border-border/40 bg-card resize-none min-h-[100px]"
          value={newDua}
          onChange={(e) => setNewDua(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            disabled={isSubmitting || newDua.length < 10}
            onClick={handleSubmit}
            className="rounded-2xl px-8 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
            {isAr ? "نشر" : "Post"}
          </Button>
        </div>
      </div>

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {duas.map((dua) => {
          const hasPrayed = dua.prayedBy?.includes(profile?.uid || "");
          return (
            <div key={dua.id} className="p-6 bg-card border border-border/40 rounded-[2.5rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {dua.userName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-primary/80">{dua.userName}</span>
                  </div>
                  <Star className="text-gold/20 group-hover:text-gold/40 transition-colors" size={14} />
                </div>
                <p className="text-sm leading-relaxed font-medium italic text-foreground/80">"{dua.text}"</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {isAr ? toArabicNumber(dua.prayedBy?.length || 0) : dua.prayedBy?.length || 0} {isAr ? "شخص دعا لك" : "people prayed for you"}
                  </span>
                </div>
                <button 
                  onClick={() => !hasPrayed && dua.id && handlePray(dua.id)}
                  disabled={hasPrayed}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                    hasPrayed 
                      ? "bg-emerald-500/10 text-emerald-600 cursor-default" 
                      : "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart size={14} fill={hasPrayed ? "currentColor" : "none"} />
                  {hasPrayed ? (isAr ? "تم الدعاء" : "Prayed") : (isAr ? "سأدعو لك" : "I'll pray for you")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {duas.length === 0 && (
        <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border border-dashed">
          <p className="text-xs text-muted-foreground">{isAr ? "كن أول من يطلب دعاءً!" : "Be the first to request a Dua!"}</p>
        </div>
      )}
    </div>
  );
};

export default DuaWall;
