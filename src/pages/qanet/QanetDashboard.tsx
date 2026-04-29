import React from 'react';
import { Moon, Calculator, History, Settings, ArrowRight, BookOpen } from 'lucide-react';
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

  // Determine active tab from URL
  const path = location.pathname.split('/').pop();
  const activeTab = path === 'qanet' || path === '' ? 'home' : path;

  const tabs = [
    { id: 'home', icon: <Moon size={18} />, label: isArabic ? 'الرئيسية' : 'Home', path: '/qanet' },
    { id: 'calculator', icon: <Calculator size={18} />, label: isArabic ? 'الحاسبة' : 'Calculator', path: '/qanet/calculator' },
    { id: 'history', icon: <History size={18} />, label: isArabic ? 'السجل' : 'Log', path: '/qanet/history' },
    { id: 'settings', icon: <Settings size={18} />, label: isArabic ? 'الإعدادات' : 'Settings', path: '/qanet/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-naskh relative pb-32" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
        <button 
          onClick={() => navigate('/qiyam')} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold hover:bg-primary/20"
        >
          <BookOpen size={12} />
          {isArabic ? '١٠٠ آية' : '100 Aya'}
        </button>
        <h1 className="text-xl font-bold text-primary font-naskh">{isArabic ? 'من القانتين' : 'Min Al-Qaniteen'}</h1>
        <button onClick={() => navigate('/hub')} className="p-2 bg-muted rounded-full hover:bg-muted/80">
          <ArrowRight size={18} className="text-foreground/70" />
        </button>
      </div>

      {/* Qanet Tab Navigation - Site-synced style */}
      <div className="relative z-10 flex items-center justify-center gap-2 px-4 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-islamic scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <Routes>
          <Route index element={<QanetHome />} />
          <Route path="calculator" element={<QanetCalculator />} />
          <Route path="history" element={<QanetHistory />} />
          <Route path="settings" element={<QanetSettings />} />
          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/qanet" replace />} />
        </Routes>
      </div>
    </div>
  );
}
