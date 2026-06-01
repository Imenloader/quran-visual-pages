import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface Category {
  id: string;
  title: string;
  tools: Tool[];
}

interface DashboardCustomizerProps {
  categories: Category[];
  pinnedTools: string[];
  onPinChange: (toolId: string) => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ categories, pinnedTools, onPinChange }) => {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-accent border border-border/40 hover:border-accent/20 rounded-full h-8 px-3 transition-all font-serif">
          <Settings size={14} />
          {t("hub.customize")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/60">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border/20">
          <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-xl bg-accent/10">
              <Settings className="text-accent size-5" />
            </div>
            {t("hub.customize")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-serif pt-2">
            {t("hub.selectTools")} <span className="font-bold text-accent">({pinnedTools.length}/6)</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8" dir="auto">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <h3 className="font-naskh text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-50" />
                {cat.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cat.tools.map((tool) => {
                  const isPinned = pinnedTools.includes(tool.id);
                  const disabled = !isPinned && pinnedTools.length >= 6;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => !disabled || isPinned ? onPinChange(tool.id) : null}
                      className={`relative flex flex-col items-center gap-3 p-4 rounded-[1.5rem] border transition-all duration-300 text-center group overflow-hidden ${
                        isPinned 
                          ? "border-accent bg-accent/5 shadow-sm shadow-accent/10" 
                          : disabled 
                            ? "border-border/20 opacity-50 cursor-not-allowed" 
                            : "border-border/40 hover:border-accent/30 bg-background/50 hover:bg-background"
                      }`}
                    >
                      {isPinned && (
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                          <Pin size={12} className="text-accent fill-accent" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isPinned 
                          ? "bg-accent/20 text-accent" 
                          : "bg-muted text-muted-foreground group-hover:text-accent group-hover:bg-accent/10"
                      }`}>
                        {tool.icon}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-naskh font-medium leading-tight ${
                        isPinned ? "text-accent font-bold" : "text-foreground/80 group-hover:text-foreground"
                      }`}>
                        {tool.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCustomizer;
