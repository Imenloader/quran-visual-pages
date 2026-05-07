import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  Video,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Info,
  Youtube,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { communityService, KnowledgeSession } from "@/services/communityService";
import { toArabicNumber } from "@/data/quranData";
import { SCHOLARS_DATA, ZAD_ACADEMY_LEVELS } from "@/data/videoData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KnowledgeSessionsComponentProps {
  standalone?: boolean;
}

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const KnowledgeSessionsComponent = ({ standalone = false }: KnowledgeSessionsComponentProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { profile } = useUser();
  const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    topic: "",
    dateTime: "",
    meetingLink: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.gender) return;
    const gender = profile.gender === 'female' ? 'female' : 'male';
    const unsub = communityService.subscribeToKnowledgeSessions(gender, (data) => {
      setSessions(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [profile?.gender]);

  const handleCreateSession = async () => {
    if (!profile?.uid) {
      toast.error(isAr ? "سجّل الدخول أولاً" : "Please sign in first");
      return;
    }

    if (!newSession.title || !newSession.dateTime || !newSession.topic) {
      toast.error(isAr ? "يرجى إكمال البيانات الأساسية" : "Please fill in basic details");
      return;
    }

    setIsSubmitting(true);
    try {
      await communityService.createKnowledgeSession({
        title: newSession.title,
        description: newSession.description,
        topic: newSession.topic,
        dateTime: new Date(newSession.dateTime) as any,
        createdBy: profile.uid,
        creatorName: profile.name || (isAr ? "فاعل خير" : "Anonymous"),
        meetingLink: newSession.meetingLink,
        gender: profile.gender === 'female' ? 'female' : 'male'
      });
      toast.success(isAr ? "تم إنشاء الجلسة بنجاح" : "Session created successfully");
      setShowCreateDialog(false);
      setNewSession({ title: "", description: "", topic: "", dateTime: "", meetingLink: "" });
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error(isAr ? "تعذر إنشاء الجلسة" : "Could not create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!profile?.uid) return;
    try {
      await communityService.joinKnowledgeSession(sessionId, profile.uid);
      toast.success(isAr ? "انضممت إلى الجلسة" : "Joined the session");
    } catch (error) {
      toast.error(isAr ? "تعذر الانضمام" : "Could not join");
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    if (!profile?.uid) return;
    try {
      await communityService.leaveKnowledgeSession(sessionId, profile.uid);
      toast.success(isAr ? "غادرت الجلسة" : "Left the session");
    } catch (error) {
      toast.error(isAr ? "تعذر المغادرة" : "Could not leave");
    }
  };

  const formatCount = (value: number) => (isAr ? toArabicNumber(value) : value);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{isAr ? "جاري تحميل الجلسات..." : "Loading sessions..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <GraduationCap className="text-emerald-600" />
            {isAr ? "جلسات علمية" : "Knowledge Sessions"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {isAr 
              ? "خطط وشارك في جلسات تعلم جماعية لتشجيع بعضكم البعض." 
              : "Plan and join group learning sessions to encourage one another."}
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2 bg-emerald-deep hover:bg-emerald-deep/90 text-gold shadow-lg h-12 px-6">
              <Plus size={20} />
              {isAr ? "إنشاء جلسة جديدة" : "Create New Session"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">
                {isAr ? "جلسة علمية جديدة" : "New Knowledge Session"}
              </DialogTitle>
              <DialogDescription>
                {isAr 
                  ? "املأ البيانات لتنظيم جلسة تعليمية مع الأعضاء." 
                  : "Fill in the details to organize a learning session with members."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isAr ? "عنوان الجلسة" : "Session Title"}</label>
                <Input 
                  placeholder={isAr ? "مثلاً: تدبر سورة الكهف" : "e.g., Tadabbur Surah Al-Kahf"} 
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isAr ? "الموضوع" : "Topic"}</label>
                <Input 
                  placeholder={isAr ? "تفسير، فقه، تجويد..." : "Tafsir, Fiqh, Tajweed..."} 
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isAr ? "الوقت والتاريخ" : "Date & Time"}</label>
                <Input 
                  type="datetime-local" 
                  value={newSession.dateTime}
                  onChange={(e) => setNewSession({ ...newSession, dateTime: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isAr ? "رابط اللقاء (اختياري)" : "Meeting Link (Optional)"}</label>
                <Input 
                  placeholder="Zoom, Google Meet, etc." 
                  value={newSession.meetingLink}
                  onChange={(e) => setNewSession({ ...newSession, meetingLink: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isAr ? "الوصف" : "Description"}</label>
                <Textarea 
                  placeholder={isAr ? "ماذا سنتعلم في هذه الجلسة؟" : "What will we learn in this session?"}
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateSession} 
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary h-12"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {isAr ? "نشر الجلسة" : "Post Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-card/40 rounded-[2.5rem] border border-dashed border-border/60">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Calendar size={32} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-primary">{isAr ? "لا توجد جلسات مجدولة" : "No scheduled sessions"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{isAr ? "كن أول من يبدأ جلسة تعليمية!" : "Be the first to start a learning session!"}</p>
            </div>
          </div>
        ) : (
          sessions.map((session) => (
            <article key={session.id} className="bg-card border border-border/40 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <BookOpen size={12} />
                      {session.topic}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-primary group-hover:text-emerald-700 transition-colors">{session.title}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    session.status === 'ongoing' ? 'bg-rose-500 text-white animate-pulse' : 'bg-gold/10 text-gold'
                  }`}>
                    {session.status === 'ongoing' ? (isAr ? "مباشر الآن" : "Live Now") : (isAr ? "مخطط لها" : "Planned")}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {session.description}
                </p>

                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" />
                    <span>{session.dateTime instanceof Date ? session.dateTime.toLocaleDateString(i18n.language) : (session.dateTime as any).toDate().toLocaleDateString(i18n.language)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-emerald-500" />
                    <span>{session.dateTime instanceof Date ? session.dateTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) : (session.dateTime as any).toDate().toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-emerald-500" />
                    <span>{formatCount(session.members.length)} {isAr ? "مشارك" : "participants"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                      {session.creatorName[0]}
                    </div>
                    <div className="text-[10px]">
                      <p className="text-muted-foreground font-bold uppercase tracking-tighter">{isAr ? "بواسطة" : "By"}</p>
                      <p className="text-primary font-bold">{session.creatorName}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {session.members.includes(profile?.uid || "") ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl text-[10px] h-8 px-4"
                          onClick={() => handleLeaveSession(session.id!)}
                        >
                          {isAr ? "مغادرة" : "Leave"}
                        </Button>
                        {session.meetingLink && (
                          <Button 
                            size="sm" 
                            className="rounded-xl bg-primary text-[10px] h-8 px-4 gap-2"
                            onClick={() => window.open(ensureAbsoluteUrl(session.meetingLink!), "_blank")}
                          >
                            <Video size={12} />
                            {isAr ? "دخول اللقاء" : "Join Call"}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-emerald-deep text-gold text-[10px] h-8 px-6 gap-2"
                        onClick={() => handleJoinSession(session.id!)}
                      >
                        <Users size={12} />
                        {isAr ? "انضمام" : "Join"}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl text-primary h-8 px-3"
                      onClick={() => navigate('/community?tab=friends')}
                      title={isAr ? "دعوة صديق" : "Invite Friend"}
                    >
                      <UserPlus size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-6 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-primary">{isAr ? "عن الجلسات العلمية" : "About Knowledge Sessions"}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isAr 
              ? "هذه الجلسات هدفها المدارسة والتشجيع. يمكنك تنظيم جلسة لمراجعة حفظ، أو مدارسة تفسير، أو حتى حضور دورة علمية معاً. تذكر أن تلتزم بآداب المجلس الإسلامي." 
              : "These sessions are for study and encouragement. You can organize a session to review memorization, study tafsir, or even attend a course together. Remember to adhere to Islamic assembly etiquette."}
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-sm">
              <Youtube size={20} />
            </div>
            <h3 className="text-xl font-serif font-bold text-primary">{isAr ? "قنوات ومجالس مقترحة" : "Recommended Channels"}</h3>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isAr ? "مصادر موثوقة" : "Trusted Sources"}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...SCHOLARS_DATA, ...ZAD_ACADEMY_LEVELS].map((channel: any) => (
            <a 
              key={channel.id} 
              href={channel.channelUrl || channel.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-card border border-border/40 rounded-[2rem] p-5 flex flex-col items-center text-center group hover:border-rose-500/30 transition-all hover:shadow-lg h-full"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 mb-4 overflow-hidden border-2 border-transparent group-hover:border-rose-500/20 transition-all">
                {channel.thumbnail ? (
                  <img src={channel.thumbnail} alt={channel.name || channel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-500/5 text-rose-600">
                    <Youtube size={24} />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-sm text-primary mb-2 line-clamp-1">{channel.name || channel.title}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed h-8">
                {channel.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[9px] font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                {isAr ? "زيارة القناة" : "Visit Channel"}
                <ExternalLink size={10} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default KnowledgeSessionsComponent;
