import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy, limit, where } from "firebase/firestore";
import { Users, Search, Shield, User, Mail, Calendar, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import BackButton from "@/components/BackButton";

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
  points: number;
  joinedDate: any;
  lastActiveDate: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("joinedDate", "desc"), limit(100));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("فشل تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`هل أنت متأكد من تغيير رتبة ${user.name} إلى ${newRole}؟`)) return;
    
    try {
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success("تم تحديث الرتبة");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-emerald-500" />
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground mt-1">مراقبة الأعضاء وتعيين المشرفين</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="بحث عن مستخدم بالاسم أو البريد..." 
          className="pr-10 rounded-xl"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-2xl" />)
        ) : (
          <AnimatePresence>
            {filteredUsers.map((u) => (
              <motion.div 
                key={u.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bento-card !p-5 space-y-4 group border border-border/40 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleRole(u)}
                    className={`rounded-full h-8 px-3 gap-1 text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}
                  >
                    {u.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                    {u.role === 'admin' ? 'مشرف' : 'عضو'}
                  </Button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg truncate">{u.name || "مستخدم مجهول"}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail size={12} /> {u.email || "بدون بريد"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40 text-[10px] font-bold">
                  <div className="flex items-center gap-1 text-gold">
                    <Star size={12} fill="currentColor" />
                    {u.points} نقطة
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} />
                    {u.joinedDate?.toDate ? format(u.joinedDate.toDate(), 'MMM yyyy', { locale: ar }) : "تاريخ غير معروف"}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
