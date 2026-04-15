import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

const BackButton = ({ 
  className, 
  variant = "default"
}: BackButtonProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10",
    ghost: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
    outline: "bg-card/50 text-foreground hover:bg-card border border-border/40 backdrop-blur-md shadow-sm"
  };

  return (
    <button
      onClick={() => navigate(-1)}
      className={cn(
        "flex items-center justify-center gap-2 px-4 h-10 md:h-12 rounded-2xl transition-all active:scale-95 group",
        variants[variant],
        className
      )}
    >
      <ChevronLeft 
        size={20} 
        className="rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" 
      />
      <span className="text-sm font-bold font-naskh">
        {isArabic ? "العودة" : "Back"}
      </span>
    </button>
  );
};

export default BackButton;
