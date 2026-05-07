import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  getDocs,
  limit,
  orderBy,
  getDoc
} from 'firebase/firestore';
import QuranHeader from '@/components/QuranHeader';
import { 
  Users, 
  Search, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  ArrowRight,
  ShieldAlert,
  Ghost
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';
import { useUser } from '@/contexts/UserContext';

interface FriendsManagerProps {
  standalone?: boolean;
}

const FriendsManager: React.FC<FriendsManagerProps> = ({ standalone = true }) => {
  const { t, i18n } = useTranslation();
  const { profile: currentUserProfile } = useUser();
  const isArabic = i18n.language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Load friendships
    const q = query(
      collection(db, 'friendships'),
      where('users', 'array-contains', auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const allFriendships = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const accepted = allFriendships.filter((f: any) => f.status === 'accepted');
      const pending = allFriendships.filter((f: any) => f.status === 'pending');

      // Fetch friend profile data
      const friendProfiles = await Promise.all(
        accepted.map(async (f: any) => {
          const friendId = f.users.find((id: string) => id !== auth.currentUser?.uid);
          const p = await getDoc(doc(db, 'profiles', friendId));
          return { id: friendId, ...p.data(), friendshipId: f.id };
        })
      );

      const pendingProfiles = await Promise.all(
        pending.map(async (f: any) => {
          const otherId = f.users.find((id: string) => id !== auth.currentUser?.uid);
          const p = await getDoc(doc(db, 'profiles', otherId));
          return { 
            id: otherId, 
            ...p.data(), 
            friendshipId: f.id, 
            isRequester: f.requester === auth.currentUser?.uid 
          };
        })
      );

      setFriends(friendProfiles);
      setRequests(pendingProfiles);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    setLoading(true);
    setSearchResults([]);
    try {
      const queryLower = trimmedQuery.toLowerCase();
      const queryCapitalized = trimmedQuery.charAt(0).toUpperCase() + trimmedQuery.slice(1);
      const queryUpper = trimmedQuery.toUpperCase();
      
      let results: any[] = [];
      try {
        // Run multiple queries in parallel to cover new 'searchName' field
        // as well as multiple permutations of the old 'name' field
        const queries = [
          // New dedicated searchName field
          query(collection(db, 'profiles'), where('searchName', '>=', queryLower), where('searchName', '<=', queryLower + '\uf8ff'), limit(20)),
          // Legacy exact trimmed search
          query(collection(db, 'profiles'), where('name', '>=', trimmedQuery), where('name', '<=', trimmedQuery + '\uf8ff'), limit(20)),
          // Legacy lowercase
          query(collection(db, 'profiles'), where('name', '>=', queryLower), where('name', '<=', queryLower + '\uf8ff'), limit(20)),
          // Legacy capitalized
          query(collection(db, 'profiles'), where('name', '>=', queryCapitalized), where('name', '<=', queryCapitalized + '\uf8ff'), limit(20)),
          // Legacy uppercase
          query(collection(db, 'profiles'), where('name', '>=', queryUpper), where('name', '<=', queryUpper + '\uf8ff'), limit(20)),
        ];

        // Deduplicate requests safely catching errors for each query
        const snaps = await Promise.allSettled(queries.map(q => getDocs(q)));

        const uniqueIds = new Set<string>();

        snaps.forEach(result => {
          if (result.status === 'fulfilled') {
            result.value.docs.forEach(d => {
              if (d.id !== auth.currentUser?.uid && !uniqueIds.has(d.id)) {
                uniqueIds.add(d.id);
                results.push({ id: d.id, ...d.data() });
              }
            });
          }
        });

      } catch (queryError: any) {
        console.warn("Firestore Range Query failed, falling back to client-side filtering", queryError);
        const fallbackQ = query(collection(db, 'profiles'), limit(100));
        const fallbackSnap = await getDocs(fallbackQ);
        results = fallbackSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((u: any) =>
            u.id !== auth.currentUser?.uid &&
            u.name &&
            u.name.toLowerCase().includes(queryLower)
          );
      }
        
      setSearchResults(results);
      if (results.length === 0) {
        console.log("No users found matching:", trimmedQuery);
      }
    } catch (e) {
      console.error("Search Error:", e);
      toast.error(isArabic ? 'فشل البحث: تأكد من الاتصال بالانترنت' : 'Search failed: Check your connection');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetUser: any) => {
    if (!auth.currentUser) return;
    
    if (currentUserProfile.gender !== 'unspecified' && targetUser.gender !== 'unspecified' && currentUserProfile.gender !== targetUser.gender) {
      toast.error(t('common.genderMismatch'));
      return;
    }

    try {
      const shipId = [auth.currentUser.uid, targetUser.id].sort().join('_');
      await setDoc(doc(db, 'friendships', shipId), {
        users: [auth.currentUser.uid, targetUser.id],
        status: 'pending',
        requester: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      toast.success(isArabic ? 'تم إرسال طلب الصداقة' : 'Friend request sent');
    } catch (e) {
      toast.error(isArabic ? 'فشل إرسال الطلب' : 'Failed to send request');
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      await setDoc(doc(db, 'friendships', friendshipId), {
        status: 'accepted'
      }, { merge: true });
      toast.success(isArabic ? 'تم قبول الصداقة' : 'Request accepted');
    } catch (e) {
      toast.error(isArabic ? 'فشل قبول الطلب' : 'Failed to accept');
    }
  };

  const cancelRequest = async (friendshipId: string) => {
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
      toast.success(isArabic ? 'تم إلغاء الطلب' : 'Request cancelled');
    } catch (e) {
      toast.error(isArabic ? 'فشل العملية' : 'Operation failed');
    }
  };

  const content = (
    <Tabs defaultValue="friends" className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <TabsList className="grid grid-cols-3 bg-muted/40 p-1.5 rounded-[2rem] h-16 shadow-inner border border-border/20">
        <TabsTrigger value="friends" className="rounded-[1.5rem] data-[state=active]:bg-card data-[state=active]:shadow-lg font-serif">
          {isArabic ? 'أصدقائي' : 'My Friends'}
          {friends.length > 0 && (
             <Badge className="mr-2 bg-primary/10 text-primary border-none">
                {isArabic ? toArabicNumber(friends.length) : friends.length}
             </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="requests" className="rounded-[1.5rem] data-[state=active]:bg-card data-[state=active]:shadow-lg font-serif">
          {isArabic ? 'الطلبات' : 'Requests'}
          {requests.filter(r => !r.isRequester).length > 0 && (
             <Badge className="mr-2 bg-gold text-white border-none animate-pulse">
                {isArabic ? toArabicNumber(requests.filter(r => !r.isRequester).length) : requests.filter(r => !r.isRequester).length}
             </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="search" className="rounded-[1.5rem] data-[state=active]:bg-card data-[state=active]:shadow-lg font-serif">
          {isArabic ? 'البحث' : 'Search'}
        </TabsTrigger>
      </TabsList>

      {/* My Friends Tab */}
      <TabsContent value="friends" className="space-y-4">
         {friends.length === 0 ? (
           <EmptyState 
             icon={<Users size={48} />} 
             title={isArabic ? 'لا يوجد أصدقاء بعد' : 'No friends yet'}
             desc={isArabic ? 'ابدأ بالبحث عن أصدقائك وإضافتهم' : 'Start by searching and adding your friends'}
           />
         ) : (
           <div className="grid grid-cols-1 gap-4">
              {friends.map(friend => (
                <UserCard key={friend.id} user={friend} isArabic={isArabic}>
                   <Link to={`/profile/${friend.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary">
                         <ArrowRight size={20} className={isArabic ? 'rotate-180' : ''} />
                      </Button>
                   </Link>
                </UserCard>
              ))}
           </div>
         )}
      </TabsContent>

      {/* Requests Tab */}
      <TabsContent value="requests" className="space-y-6">
         {requests.length === 0 ? (
            <EmptyState 
              icon={<Clock size={48} />} 
              title={isArabic ? 'لا توجد طلبات معلقة' : 'No pending requests'}
              desc={isArabic ? 'طلبات الصداقة الجديدة ستظهر هنا' : 'New friend requests will appear here'}
            />
         ) : (
            <div className="space-y-4">
               {requests.map(req => (
                 <UserCard key={req.id} user={req} isArabic={isArabic}>
                    {req.isRequester ? (
                       <Button 
                         variant="outline" 
                         onClick={() => cancelRequest(req.friendshipId)}
                         className="rounded-xl border-border/40 text-muted-foreground hover:text-red-500"
                       >
                          {isArabic ? 'إلغاء الطلب' : 'Cancel Request'}
                       </Button>
                    ) : (
                       <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRequest(req.friendshipId)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                          >
                             <Check size={18} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cancelRequest(req.friendshipId)}
                            className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl"
                          >
                             <X size={18} />
                          </Button>
                       </div>
                    )}
                 </UserCard>
               ))}
            </div>
         )}
      </TabsContent>

      {/* Search Tab */}
      <TabsContent value="search" className="space-y-8">
         <div className="flex gap-3">
            <div className="relative flex-1">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
               <Input 
                 placeholder={isArabic ? 'ابحث بالاسم...' : 'Search by name...'} 
                 className="pr-12 h-14 rounded-2xl bg-card border-border/40 shadow-soft focus-visible:ring-gold/30"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
            </div>
            <Button 
              onClick={handleSearch}
              className="h-14 px-8 rounded-2xl bg-gold hover:bg-gold/90 text-white font-bold"
            >
               {isArabic ? 'بحث' : 'Search'}
            </Button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {searchResults.map(user => (
               <UserCard key={user.id} user={user} isArabic={isArabic}>
                  <Button 
                    onClick={() => sendRequest(user)}
                    disabled={friends.some(f => f.id === user.id) || requests.some(r => r.id === user.id)}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl border-none font-bold"
                  >
                     <UserPlus size={18} className="ml-2" />
                     {friends.some(f => f.id === user.id) ? (isArabic ? 'صديق' : 'Friend') : 
                      requests.some(r => r.id === user.id) ? (isArabic ? 'معلق' : 'Pending') : 
                      (isArabic ? 'إضافة' : 'Add')}
                  </Button>
               </UserCard>
            ))}
            {searchResults.length === 0 && searchQuery && !loading && (
               <div className="text-center py-20 opacity-50">
                  <Ghost size={48} className="mx-auto mb-4" />
                  <p>{isArabic ? 'لم نجد أحداً بهذا الاسم' : 'No users found with this name'}</p>
               </div>
            )}
         </div>
      </TabsContent>
    </Tabs>
  );

  if (!standalone) {
    return <div className="p-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={isArabic ? 'مجتمع الأصدقاء' : 'Friends Community'} 
        subtitle={isArabic ? 'تواصل مع إخوتك في الله' : 'Connect with your brothers in faith'}
        variant="compact"
        showBack
      />

      <main className="container max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        {content}
      </main>
    </div>
  );
};

const UserCard = ({ user, isArabic, children }: { user: any, isArabic: boolean, children: React.ReactNode }) => (
  <div className="p-4 rounded-[2rem] bg-card border border-border/40 shadow-sm flex items-center justify-between group hover:border-gold/20 transition-all">
     <div className="flex items-center gap-4">
        <Link to={`/profile/${user.id}`} className="block">
           <img 
             src={user.avatar || '/avatar-man-1.svg'} 
             alt="" 
             className="w-12 h-12 rounded-2xl object-cover bg-muted border border-border/20"
           />
        </Link>
        <div className="text-right">
           <Link to={`/profile/${user.id}`} className="block hover:text-gold transition-colors">
              <h4 className="font-serif font-bold text-primary">{user.name}</h4>
           </Link>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {isArabic ? toArabicNumber(user.points || 0) : (user.points || 0)} {isArabic ? 'نقطة' : 'points'}
           </p>
        </div>
     </div>
     {children}
  </div>
);

const EmptyState = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="py-20 text-center bg-card/40 border-2 border-dashed border-border/40 rounded-[3rem] space-y-4">
     <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground/30 mx-auto">
        {icon}
     </div>
     <div>
        <h3 className="text-lg font-serif font-bold text-primary">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">{desc}</p>
     </div>
  </div>
);

export default FriendsManager;
