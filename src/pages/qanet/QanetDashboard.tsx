import React from 'react';
import { Moon, Calculator, History, Settings, ArrowRight, BookOpen, Home, Activity } from 'lucide-react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import QanetHome from './QanetHome';
import QanetCalculator from './QanetCalculator';
import QanetHistory from './QanetHistory';
import QanetSettings from './QanetSettings';
import { useQanet } from './QanetContext';

export default function QanetDashboard() {
  const { language } = useQanet();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname.split('/').pop();
  const activeTab = path === 'qanet' || path === '' ? 'home' : path;

  const tabs = [
    { id: 'home', icon: <Home size={20} />, label: isArabic ? 'الرئيسية' : 'Home', path: '/qanet' },
    { id: 'calculator', icon: <Calculator size={20} />, label: isArabic ? 'الحاسبة' : 'Calculator', path: '/qanet/calculator' },
    { id: 'history', icon: <History size={20} />, label: isArabic ? 'السجل' : 'Log', path: '/qanet/history' },
    { id: 'settings', icon: <Settings size={20} />, label: isArabic ? 'الإعدادات' : 'Settings', path: '/qanet/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-naskh relative pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/qiyam')} 
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-xl text-primary text-[10px] font-bold hover:bg-primary/10 transition-colors"
        >
          <Activity size={14} />
          {isArabic ? '١٠٠ آية' : '100 Aya'}
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground font-naskh">{isArabic ? 'من القانتين' : 'Min Al-Qaniteen'}</h1>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Qiyam Tracker</span>
          </div>
        </div>

        <button onClick={() => navigate('/hub')} className="p-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-border/50">
          <ArrowRight size={18} className={`text-foreground/70 ${isArabic ? 'rotate-180' : ''}`} />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <Routes>
          <Route index element={<QanetHome />} />
          <Route path="calculator" element={<QanetCalculator />} />
          <Route path="history" element={<QanetHistory />} />
          <Route path="settings" element={<QanetSettings />} />
          <Route path="*" element={<Navigate to="/qanet" replace />} />
        </Routes>
      </main>

      {/* Floating Glassmorphic Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-md">
        <nav className="bg-card/90 backdrop-blur-xl border border-white/10 shadow-islamic rounded-[2rem] p-2 flex items-center justify-around gap-1 ring-1 ring-black/5">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-in fade-in zoom-in duration-300" />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {tab.icon}
                </div>
                <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 absolute'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
