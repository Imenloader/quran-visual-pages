import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Headphones, Shield, Settings, Home, ChevronUp, ChevronDown, Heart } from "lucide-react";

const NAV_ITEMS = [
  { path: "/settings", label: "الإعدادات", icon: Settings },
  { path: "/athkar", label: "الأذكار", icon: Shield },
  { path: "/", label: "الرئيسية", icon: Home, isCenter: true },
  { path: "/favorites", label: "المفضلة", icon: Heart },
  { path: "/recitations", label: "التلاوات", icon: Headphones },
];

const BottomNav = () => {
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);

  // Hide on embed pages only
  if (location.pathname.startsWith("/embed/")) {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsHidden(!isHidden)}
        className={`fixed z-[51] left-1/2 -translate-x-1/2 w-10 h-5 rounded-t-xl bg-card/90 backdrop-blur-sm border border-b-0 border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 ${
          isHidden ? "bottom-0" : "bottom-[68px]"
        }`}
        aria-label={isHidden ? "إظهار القائمة" : "إخفاء القائمة"}
      >
        {isHidden ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Nav bar */}
      <nav
        className={`fixed left-0 right-0 z-50 glass border-t border-border transition-transform duration-300 ease-out ${
          isHidden ? "translate-y-full" : "translate-y-0"
        }`}
        style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-end justify-around max-w-lg mx-auto px-2">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center -mt-4 relative"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? "gradient-islamic shadow-islamic scale-110"
                      : "gradient-islamic opacity-85 hover:opacity-100"
                  }`}>
                    <Icon size={22} className="text-primary-foreground" />
                  </div>
                  <span className={`font-naskh text-[10px] mt-1 font-bold transition-colors ${
                    isActive ? "text-accent" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center py-2 px-1 min-w-[56px] group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`font-naskh text-[10px] mt-0.5 transition-colors ${
                  isActive ? "text-accent font-bold" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
