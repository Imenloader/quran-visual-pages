import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'status';
  status?: 'heedless' | 'aware' | 'qanet' | 'muqantar';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default',
  status
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'muqantar': return 'text-purple-500';
      case 'qanet': return 'text-emerald-500';
      case 'aware': return 'text-blue-500';
      case 'heedless': return 'text-red-500';
      default: return 'text-foreground';
    }
  };

  if (variant === 'highlight') {
    return (
      <div className="bg-card rounded-[2.5rem] p-8 border border-border flex shadow-soft group hover:border-primary/50 transition-all">
        <div className="flex-1 flex flex-col justify-center gap-1 border-l border-border pl-6">
          <div className="flex items-center gap-2 justify-end mb-1">
            {icon}
            <span className="text-4xl font-bold text-foreground">{value}</span>
          </div>
          <p className="text-muted-foreground text-sm font-bold">{title}</p>
          {subtitle && <p className="text-primary text-[11px] font-bold">{subtitle}</p>}
        </div>
        <div className="flex-1 flex flex-col justify-center items-end pr-6 gap-1">
          <div className="text-4xl font-bold text-foreground mb-1">{subtitle ? subtitle : '-'}</div>
          <p className="text-muted-foreground text-sm font-bold">القيمة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2rem] p-6 border border-border flex flex-col items-center justify-center gap-3 text-center shadow-soft hover:shadow-md transition-all">
      {icon && <div className="mb-1">{icon}</div>}
      <div className={`text-2xl font-bold ${variant === 'status' ? getStatusColor() : 'text-foreground'}`}>
        {value}
      </div>
      <p className="text-muted-foreground text-xs font-bold">{title}</p>
      {subtitle && <p className="text-[10px] text-primary font-bold">{subtitle}</p>}
    </div>
  );
};
