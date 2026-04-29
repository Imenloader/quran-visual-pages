import React, { useState } from 'react';
import { useQanet } from './QanetContext';
import { useUser } from '@/contexts/UserContext';
import { Shield, Trash2, Bell, Moon, Share2, MessageSquare, Star, User, BookOpen, ChevronLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatHijriDate } from './hijriUtils';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export default function QanetSettings() {
  const { settings, updateSettings, language, updateState, notificationsEnabled, reminderTime, resetData } = useQanet();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const currentHijriDate = formatHijriDate(new Date(), settings.hijriOffset);

  const handleShare = async () => {
    const isAr = language === 'ar';
    const shareUrl = window.location.origin;
    const shareText = isAr 
      ? `تطبيق "من القانتين" - رفيقك في قيام الليل. ساعدنا في نشر الخير!\n\nقال النبي ﷺ: "من قام بعشر آيات لم يُكتب من الغافلين، ومن قام بمائة آية كُتب من القانتين، ومن قام بألف آية كُتب من المقنطرين"\n\nحمل التطبيق من هنا: ${shareUrl}`
      : `Qaniteen App - Your companion for Night Prayer. Help us spread the word!\n\nThe Prophet (PBUH) said: "Whoever stands (in prayer) reciting ten verses will not be recorded as one of the heedless..."\n\nDownload here: ${shareUrl}`;

    try {
      if (Capacitor.isNativePlatform()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: isAr ? 'من القانتين' : 'Qaniteen',
          text: shareText,
          url: shareUrl,
          dialogTitle: isAr ? 'مشاركة التطبيق' : 'Share App',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: isAr ? 'من القانتين' : 'Qaniteen',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success(isAr ? 'تم نسخ نص المشاركة' : 'Share text copied');
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    
    if (newValue) {
      // Request permission
      if (Capacitor.isNativePlatform()) {
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          const status = await LocalNotifications.checkPermissions();
          if (status.display !== 'granted') {
            const req = await LocalNotifications.requestPermissions();
            if (req.display !== 'granted') {
              toast.error('يرجى السماح بالإشعارات من إعدادات الجهاز');
              return;
            }
          }
        } catch (e) {
          console.warn('LocalNotifications not available:', e);
        }
      } else {
        if ('Notification' in window && Notification.permission !== 'granted') {
          const result = await Notification.requestPermission();
          if (result !== 'granted') {
            toast.error('يرجى السماح بالإشعارات من إعدادات المتصفح');
            return;
          }
        }
      }
    }
    
    updateState({ notificationsEnabled: newValue });
    toast.success(newValue ? 'تم تفعيل الإشعارات' : 'تم إيقاف الإشعارات');
  };

  const handleReminderTimeChange = (time: string) => {
    updateState({ reminderTime: time });
    setShowTimePicker(false);
    toast.success(`تم ضبط وقت التذكير: ${time}`);
  };

  const handleFeedback = () => {
    const isAr = language === 'ar';
    const subject = encodeURIComponent(isAr ? 'ملاحظات على تطبيق من القانتين' : 'Feedback on Qaniteen App');
    const body = encodeURIComponent(isAr ? '\n\n--- معلومات الجهاز ---\nالمنصة: ' + Capacitor.getPlatform() : '\n\n--- Device Info ---\nPlatform: ' + Capacitor.getPlatform());
    window.location.href = `mailto:3wdkyarb@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.')) {
      resetData();
      toast.success('تم مسح جميع بيانات');
    }
  };

  return (
    <div className="p-6 pt-4 pb-24 max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-primary font-naskh">الإعدادات</h1>
        <p className="text-muted-foreground text-sm font-medium">خصص تجربتك في التطبيق</p>
      </div>

      {/* Profile Card */}
      <button
        onClick={() => navigate('/profile')}
        className="w-full bg-card border border-border rounded-[2rem] p-6 flex items-center justify-between hover:bg-muted/50 transition-all shadow-soft group"
      >
        <ChevronLeft size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h3 className="font-bold text-foreground mb-1">{profile.name}</h3>
            <p className="text-muted-foreground text-[10px] font-bold">عرض الملف الشخصي</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Hadith Card */}
      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <BookOpen size={48} className="text-primary" />
        </div>
        <p className="text-primary text-[10px] font-bold mb-4 tracking-widest uppercase">الحديث الشريف</p>
        <p className="text-sm leading-relaxed text-foreground font-medium">
          قال النبي ﷺ: "من قام بعشر آيات لم يُكتب من الغافلين، ومن قام بمائة آية كُتب من القانتين، ومن قام بألف آية كُتب من المقنطرين"
        </p>
      </div>

      {/* Read Quran Link */}
      <button
        onClick={() => navigate('/juz/1')}
        className="w-full bg-accent/10 border border-accent/20 rounded-2xl p-5 flex items-center justify-between hover:bg-accent/20 transition-all shadow-soft group"
      >
        <ChevronLeft size={18} className="text-accent/30 group-hover:text-accent" />
        <div className="flex items-center gap-3">
          <span className="font-bold text-accent">اقرأ القرآن</span>
          <BookOpen size={20} className="text-accent" />
        </div>
      </button>

      {/* Appearance */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-[10px] font-bold pr-4 text-right uppercase tracking-wider">المظهر</p>
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden divide-y divide-border shadow-soft">
          <SettingItem
            title="الألوان التفاعلية"
            icon={<Moon size={18} />}
            toggle={settings.interactiveColors}
            onToggle={() => updateSettings({ interactiveColors: !settings.interactiveColors })}
          />
          <SettingItem
            title="التقويم الهجري"
            icon={<Moon size={18} />}
            toggle={settings.hijriCalendar}
            onToggle={() => updateSettings({ hijriCalendar: !settings.hijriCalendar })}
          />
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateSettings({ hijriOffset: settings.hijriOffset + 1 })} 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm font-bold"
              >
                +
              </button>
              <span className="w-8 text-center font-bold text-lg text-foreground">{settings.hijriOffset}</span>
              <button 
                onClick={() => updateSettings({ hijriOffset: Math.max(0, settings.hijriOffset - 1) })} 
                disabled={settings.hijriOffset <= 0}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm text-foreground mb-1">تعديل التاريخ الهجري</div>
              <p className="text-[10px] text-muted-foreground font-bold">{currentHijriDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-[10px] font-bold pr-4 text-right uppercase tracking-wider">الإشعارات</p>
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden divide-y divide-border shadow-soft">
          <SettingItem
            title="التذكير اليومي"
            icon={<Bell size={18} />}
            toggle={notificationsEnabled}
            onToggle={handleNotificationToggle}
          />
          <div className="p-5 flex items-center justify-between">
            {showTimePicker ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  defaultValue={reminderTime}
                  onChange={e => handleReminderTimeChange(e.target.value)}
                  className="bg-muted border-2 border-border focus:border-primary outline-none rounded-xl p-3 text-foreground text-center font-bold"
                />
              </div>
            ) : (
              <button onClick={() => setShowTimePicker(true)} className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                <Clock size={16} />
                {reminderTime}
              </button>
            )}
            <div className="text-right">
              <div className="font-bold text-sm text-foreground">وقت التذكير</div>
            </div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-[10px] font-bold pr-4 text-right uppercase tracking-wider">اللغة</p>
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden divide-y divide-border shadow-soft">
          <button
            onClick={() => updateState({ language: 'ar' })}
            className={`w-full p-5 flex justify-between items-center transition-colors ${language === 'ar' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            {language === 'ar' && <span className="font-bold">✓</span>}
            <span className="mr-auto font-bold font-naskh">العربية</span>
          </button>
          <button
            onClick={() => updateState({ language: 'en' })}
            className={`w-full p-5 flex justify-between items-center transition-colors ${language === 'en' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            {language === 'en' && <span className="font-bold">✓</span>}
            <span className="ml-auto font-bold">English</span>
          </button>
        </div>
      </div>

      {/* General */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-[10px] font-bold pr-4 text-right uppercase tracking-wider">عام</p>
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden divide-y divide-border shadow-soft">
          <ActionItem title="شارك من القانتين" subtitle="اكسب الثواب" icon={<Share2 size={18} />} onClick={handleShare} />
          <ActionItem title="إرسال ملاحظات" icon={<MessageSquare size={18} />} onClick={handleFeedback} />
          <ActionItem title="قيّم التطبيق" icon={<Star size={18} />} onClick={() => toast.info('شكراً لدعمك!')} />
        </div>
      </div>

      {/* About */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-[10px] font-bold pr-4 text-right uppercase tracking-wider">حول</p>
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft">
          <ActionItem title="سياسة الخصوصية" icon={<Shield size={18} />} onClick={() => navigate('/privacy')} />
        </div>
      </div>

      {/* Delete Data */}
      <button
        onClick={handleResetData}
        className="w-full bg-destructive/5 border border-destructive/20 rounded-[2rem] p-5 flex items-center justify-between text-destructive hover:bg-destructive/10 transition-all shadow-soft group"
      >
        <Trash2 size={18} className="text-destructive/50 group-hover:text-destructive" />
        <span className="font-bold">حذف جميع بياناتي</span>
      </button>
    </div>
  );
}

const SettingItem = ({ title, icon, toggle, onToggle }: { title: string, icon: React.ReactNode, toggle: boolean, onToggle: () => void }) => (
  <div className="p-5 flex justify-between items-center transition-colors hover:bg-muted/30">
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 border border-border shadow-inner ${
        toggle 
          ? 'bg-emerald-500 border-emerald-600' 
          : 'bg-muted/80 border-muted-foreground/20'
      }`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-300 transform ${
        toggle 
          ? 'translate-x-[-1.5rem]' 
          : 'translate-x-[-0.125rem]'
      }`} style={{ right: '0.125rem' }} />
    </button>
    <div className="flex items-center gap-3">
      <span className="font-bold text-sm text-foreground">{title}</span>
      <div className="text-primary">{icon}</div>
    </div>
  </div>
);

const ActionItem = ({ title, subtitle, icon, onClick }: { title: string, subtitle?: string, icon: React.ReactNode, onClick?: () => void }) => (
  <button onClick={onClick} className="w-full p-5 flex justify-between items-center transition-colors hover:bg-muted/30 group text-right">
    <ChevronLeft size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
    <div className="flex items-center gap-3">
      {subtitle && <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{subtitle}</span>}
      <span className="font-bold text-sm text-foreground">{title}</span>
      <div className="text-primary">{icon}</div>
    </div>
  </button>
);
