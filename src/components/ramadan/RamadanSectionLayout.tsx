import React from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";

interface RamadanSectionLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: string;
}

const RamadanSectionLayout: React.FC<RamadanSectionLayoutProps> = ({ 
  title, 
  subtitle, 
  icon, 
  children,
  color = "bg-primary" 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={title} 
        subtitle={subtitle} 
        variant="compact" 
      />

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <ScrollReveal>
          <div className={`relative overflow-hidden rounded-[2.5rem] ${color} p-8 md:p-12 text-white shadow-xl`}>
            <div className="absolute inset-0 pattern-islamic opacity-10" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                {icon}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold">{title}</h1>
                <p className="text-white/80 max-w-xl mx-auto leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RamadanSectionLayout;
