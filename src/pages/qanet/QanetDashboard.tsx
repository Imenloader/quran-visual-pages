import React from 'react';
import { Moon, Calculator, History, Settings, ArrowRight, BookOpen, Home, Activity, Plus } from 'lucide-react';
import { useNavigate, useLocation, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import QanetHome from './QanetHome';
import QanetCalculator from './QanetCalculator';
import QanetHistory from './QanetHistory';
import QanetSettings from './QanetSettings';
import QanetLogModal from './QanetLogModal';
import { useQanet } from './QanetContext';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';

export default function QanetDashboard() {
  const { settings, language } = useQanet();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();

  
  // Activate dynamic theme logic if enabled in settings
  useDynamicTheme(settings.interactiveColors);

  const path = location.pathname.split('/').pop();
  const activeTab = path === 'qanet' || path === '' ? 'home' : path;

  const tabs = [
    { id: 'home', icon: <Home size={18} />, label: isArabic ? 'الرئيسية' : 'Home', path: '/qanet' },
    { id: 'calculator', icon: <Calculator size={18} />, label: isArabic ? 'الحاسبة' : 'Calculator', path: '/qanet/calculator' },
    { id: 'history', icon: <History size={18} />, label: isArabic ? 'السجل' : 'Log', path: '/qanet/history' },
    { id: 'settings', icon: <Settings size={18} />, label: isArabic ? 'الإعدادات' : 'Settings', path: '/qanet/settings' },
  ];

  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col font-naskh relative ${settings.interactiveColors ? 'dynamic-bg' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Premium Header & Top Nav */}
      <header className="sticky top-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/qiyam')} 
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-xl text-primary text-[10px] font-bold hover:bg-primary/10 transition-all active:scale-95"
          >
            <Activity size={14} />
            {isArabic ? 'ورد مئة آية' : '100 Ayah Word'}
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-black text-primary leading-tight font-naskh">{isArabic ? 'مركز القانت' : 'Qanet Center'}</h1>
            <div className="flex items-center justify-center gap-1.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Worship Dashboard</span>
            </div>
          </div>

          <button onClick={() => navigate('/hub')} className="p-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-border/50 active:scale-95">
            <ArrowRight size={18} className={`text-foreground/70 ${isArabic ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Integrated Top Navigation */}
        <nav className="max-w-md mx-auto w-full flex items-center justify-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/30 shadow-inner">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-card text-primary shadow-islamic scale-[1.02]' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-bold whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-32">
        <Routes>
          <Route index element={<QanetHome />} />
          <Route path="calculator" element={<QanetCalculator />} />
          <Route path="history" element={<QanetHistory />} />
          <Route path="settings" element={<QanetSettings />} />
          <Route path="*" element={<Navigate to="/qanet" replace />} />
        </Routes>
      </main>

      </main>
    </div>
  );
}
