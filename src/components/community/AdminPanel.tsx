import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { PrivateChat, privateChatService } from '@/services/privateChatService';
import { ShieldCheck, MessageSquare, Search, ChevronLeft, ChevronRight, User, AlertTriangle, Trash2, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { reportService, ContentReport } from '@/services/reportService';
import { toast } from 'sonner';

const AdminPrivateChatViewer = ({ chatId, onBack }: { chatId: string, onBack: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "private_chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar h-[400px]">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">No messages yet.</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="bg-muted/20 p-3 rounded-2xl max-w-[80%] mx-auto border border-border/40">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-primary">{msg.senderId}</span>
              <span className="text-[10px] text-muted-foreground">{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : ''}</span>
            </div>
            <p className="text-sm font-naskh leading-relaxed">{msg.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile, isAdmin } = useUser();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCache, setUserCache] = useState<Record<string, { name: string, avatar: string, gender: string }>>({});
  
  const [activeAdminTab, setActiveAdminTab] = useState<'chats' | 'reports'>('chats');
  const [reports, setReports] = useState<ContentReport[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubChats = privateChatService.adminSubscribeToAllChats(setChats);
    const unsubReports = reportService.subscribeToReports(setReports);
    return () => {
      unsubChats();
      unsubReports();
    };
  }, [isAdmin]);

  // Fetch basic user details for participants
  useEffect(() => {
    const missingUserIds = new Set<string>();
    chats.forEach(chat => {
      chat.participants.forEach(uid => {
        if (!userCache[uid]) missingUserIds.add(uid);
      });
    });

    if (missingUserIds.size > 0) {
      missingUserIds.forEach(async (uid) => {
        try {
          const snap = await getDoc(doc(db, 'profiles', uid));
          if (snap.exists()) {
            setUserCache(prev => ({
              ...prev,
              [uid]: {
                name: snap.data().name || 'User',
                avatar: snap.data().avatar || '/avatar-man-1.svg',
                gender: snap.data().gender || 'unspecified'
              }
            }));
          }
        } catch (e) {
          console.error("Failed to fetch user", uid);
        }
      });
    }
  }, [chats]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-primary mb-2">
          {isAr ? 'وصول مرفوض' : 'Access Denied'}
        </h3>
        <p className="text-muted-foreground">
          {isAr ? 'هذه الصفحة مخصصة للمشرفين فقط.' : 'This page is restricted to administrators only.'}
        </p>
      </div>
    );
  }

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const p1 = userCache[chat.participants[0]]?.name?.toLowerCase() || '';
    const p2 = userCache[chat.participants[1]]?.name?.toLowerCase() || '';
    return p1.includes(term) || p2.includes(term) || chat.id.includes(term);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-140px)] bg-card border border-border/40 rounded-[2.5rem] shadow-xl overflow-hidden relative">
      {selectedChat ? (
        <div className="absolute inset-0 z-10 bg-card flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-muted/30">
            <button 
              onClick={() => setSelectedChat(null)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              {isAr ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-sm">
                {isAr ? 'مراقبة المحادثة' : 'Monitoring Chat'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {selectedChat.id}
              </span>
            </div>
            <div className="ms-auto flex gap-2">
              {selectedChat.participants.map(uid => (
                <Link key={uid} to={`/profile/${uid}`} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                  <User size={12} />
                  {userCache[uid]?.name?.split(' ')[0] || 'User'}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            <AdminPrivateChatViewer
              chatId={selectedChat.id}
              onBack={() => setSelectedChat(null)}
            />
            {/* Overlay to prevent admin from typing accidentally, though rules block it too */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-card/80 backdrop-blur-sm z-20 flex items-center justify-center border-t border-border/40">
              <p className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <ShieldCheck size={18} />
                {isAr ? 'وضع المراقبة - لا يمكنك إرسال رسائل هنا' : 'Oversight Mode - You cannot send messages here'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-primary">
                {isAr ? 'لوحة تحكم المشرف' : 'Admin Control Panel'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'مراقبة وإدارة المحتوى والتقارير' : 'Monitor and manage content and reports'}
              </p>
            </div>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-2xl mb-6">
            <button 
              onClick={() => setActiveAdminTab('chats')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeAdminTab === 'chats' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-primary'}`}
            >
              {isAr ? 'المحادثات الخاصة' : 'Private Chats'}
            </button>
            <button 
              onClick={() => setActiveAdminTab('reports')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeAdminTab === 'reports' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-primary'}`}
            >
              {isAr ? 'البلاغات' : 'Reports'}
              {reports.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {reports.length}
                </span>
              )}
            </button>
          </div>

          {activeAdminTab === 'chats' ? (
            <>
              <div className="relative mb-6">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground`} size={18} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? "ابحث باسم المستخدم..." : "Search by username..."}
              className={`bg-muted/50 border-none h-12 rounded-2xl ${isAr ? 'pr-12' : 'pl-12'}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredChats.map(chat => {
              const u1 = userCache[chat.participants[0]];
              const u2 = userCache[chat.participants[1]];
              
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/40 p-4 rounded-2xl flex items-center gap-4 transition-all group text-start"
                >
                  <div className="flex -space-x-4 space-x-reverse relative">
                    <img src={u1?.avatar || '/avatar-man-1.svg'} alt="" className="w-10 h-10 rounded-full border-2 border-background z-10" />
                    <img src={u2?.avatar || '/avatar-man-1.svg'} alt="" className="w-10 h-10 rounded-full border-2 border-background z-0 relative top-2 right-2" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm truncate">
                        {u1?.name} <span className="text-muted-foreground font-normal mx-1">&</span> {u2?.name}
                      </p>
                      {chat.updatedAt && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(chat.updatedAt.toMillis()).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <MessageSquare size={12} />
                      {chat.lastMessage || (isAr ? 'محادثة جديدة' : 'New chat')}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {isAr ? 'لا توجد محادثات متطابقة' : 'No matching chats found'}
              </div>
            )}
            </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                  <ShieldCheck size={48} className="opacity-20 mb-4" />
                  <p>{isAr ? 'لا توجد بلاغات' : 'No reports found'}</p>
                </div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className={`p-4 rounded-2xl border ${report.isAutoReport ? 'bg-rose-500/5 border-rose-500/20' : 'bg-card border-border/40'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {report.isAutoReport ? (
                          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <AlertTriangle size={10} />
                            {isAr ? 'نظام الحماية' : 'Auto Filter'}
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <User size={10} />
                            {isAr ? 'بلاغ مستخدم' : 'User Report'}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {report.contentType === 'post' ? (isAr ? 'منشور' : 'Post') : report.contentType === 'comment' ? (isAr ? 'تعليق' : 'Comment') : (isAr ? 'رسالة' : 'Message')}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(report.createdAt?.toMillis()).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm mb-3">
                      <p><span className="text-muted-foreground">{isAr ? 'المبلغ عنه:' : 'Reported User:'}</span> <Link to={`/profile/${report.reportedUserId}`} className="font-bold text-primary hover:underline">{report.reportedUserName}</Link></p>
                      <p><span className="text-muted-foreground">{isAr ? 'السبب:' : 'Reason:'}</span> {report.reason}</p>
                      <div className="mt-2 p-3 bg-muted/50 rounded-xl italic font-naskh">
                        "{report.contentSnippet}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                      <button
                        onClick={async () => {
                          if (window.confirm(isAr ? 'حظر هذا المستخدم؟' : 'Ban this user?')) {
                            try {
                              await updateDoc(doc(db, 'users', report.reportedUserId), { isBanned: true });
                              await updateDoc(doc(db, 'profiles', report.reportedUserId), { isBanned: true });
                              toast.success(isAr ? 'تم حظر المستخدم' : 'User banned');
                            } catch (e) { toast.error("Error banning user"); }
                          }
                        }}
                        className="flex-1 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Ban size={14} />
                        {isAr ? 'حظر المستخدم' : 'Ban User'}
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(isAr ? 'حذف المحتوى؟' : 'Delete content?')) {
                            try {
                              if (report.contentType === 'post') await deleteDoc(doc(db, 'community_posts', report.contentId));
                              else if (report.contentType === 'message') await deleteDoc(doc(db, 'community_messages', report.contentId)); 
                              await updateDoc(doc(db, 'community_reports', report.id), { status: 'resolved' });
                              toast.success(isAr ? 'تم حذف المحتوى' : 'Content deleted');
                            } catch (e) { toast.error("Error deleting content"); }
                          }
                        }}
                        className="flex-1 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        {isAr ? 'حذف المحتوى' : 'Delete Content'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
