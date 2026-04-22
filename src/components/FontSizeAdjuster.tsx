import React from "react";
import { Minus, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface FontSizeAdjusterProps {
  context: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const FontSizeAdjuster: React.FC<FontSizeAdjusterProps> = ({ 
  context, 
  min = 12, 
  max = 60, 
  step = 2,
  className 
}) => {
  const { fontSizes, setFontSize } = useTheme();
  const currentSize = fontSizes[context] || fontSizes.default || 18;

  const handleIncrease = () => {
    if (currentSize < max) {
      setFontSize(context, currentSize + step);
    }
  };

  const handleDecrease = () => {
    if (currentSize > min) {
      setFontSize(context, currentSize - step);
    }
  };

  return (
    <div className={`flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/40 ${className}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-8 h-8 rounded-xl hover:bg-background shadow-sm"
        onClick={handleDecrease}
        disabled={currentSize <= min}
      >
        <Minus size={14} />
      </Button>
      
      <div className="flex items-center gap-1.5 px-2 min-w-[3rem] justify-center">
        <Type size={14} className="text-muted-foreground" />
        <span className="text-xs font-bold font-mono">{currentSize}</span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="w-8 h-8 rounded-xl hover:bg-background shadow-sm"
        onClick={handleIncrease}
        disabled={currentSize >= max}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export default FontSizeAdjuster;
