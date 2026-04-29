import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { Trash2, Search, Book, User, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import BackButton from "@/components/BackButton";

interface Khatma {
  id: string;
  title: string;
  createdBy: string;
  createdAt: any;
  participants: string[];
  status: string;
}

const KhatmaModeration = () => {
  const [khatmas, setKhatmas] = useState<Khatma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchKhatmas();
  }, []);

  const fetchKhatmas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "khatmas"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setKhatmas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Khatma)));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل الختمات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الختمة؟")) return;
    try {
      await deleteDoc(doc(db, "khatmas", id));
      setKhatmas(khatmas.filter(k => k.id !== id));
      toast.success("تم الحذف");
    } catch (err) {
      toast.error("فشل الحذف");
    }
  };

  const filteredKhatmas = khatmas.filter(k => 
    k.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="text-right">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Book className="text-emerald-500" />
              إدارة الختمات الجماعية
            </h1>
            <p className="text-muted-foreground mt-1 text-right">مراقبة وحذف الختمات العامة في التطبيق</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchKhatmas} disabled={loading} className="rounded-xl gap-2">
          <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
          تحديث
        </Button>
      </div>

      <div className="relative max-w-md ml-auto">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث عن ختمة أو مستخدم..." 
          className="pr-10 rounded-xl text-right"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKhatmas.map((k) => (
            <div 
              key={k.id}
              className="bento-card !p-5 flex justify-between items-center group border border-border/40 hover:shadow-md transition-all active:scale-98"
            >
              <div className="space-y-2 text-right">
                <h3 className="font-bold text-lg">{k.title || "بدون عنوان"}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium justify-end">
                  <span className="flex items-center gap-1"><User size={12} /> {k.createdBy?.slice(0, 8)}...</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {k.createdAt?.toDate ? format(k.createdAt.toDate(), 'dd MMM yyyy', { locale: ar }) : "تاريخ غير متوفر"}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${k.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {k.status === 'completed' ? 'مكتملة' : 'جارية'}
                  </span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">
                    {k.participants?.length || 0} مشارك
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(k.id)}
                className="rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}

          {filteredKhatmas.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground space-y-4">
              <AlertCircle className="mx-auto w-12 h-12 opacity-20" />
              <p>لا توجد ختمات مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KhatmaModeration;
