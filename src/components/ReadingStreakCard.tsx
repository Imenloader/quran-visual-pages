import { useMemo } from "react";
import { Flame, BookOpen, ChevronLeft } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Compact streak + today's-pages card for the home hero area.
// Reads profile.dailyReadingHistory (already tracked by addPageRead) and
// currentStreak (derived in UserContext).
const ReadingStreakCard = () => {
  const { profile } = useUser();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  const { streak, pagesToday } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = (profile.dailyReadingHistory || []).find(h => h.date === today);
    return {
      streak: profile.currentStreak || 0,
      pagesToday: todayEntry?.pages || 0,
    };
  }, [profile.dailyReadingHistory, profile.currentStreak]);

  if (streak === 0 && pagesToday === 0) return null;

  return (
    <button
      onClick={() => navigate("/profile")}
      className="mt-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 hover:bg-white/15 transition-all active:scale-95 shadow-lg"
    >
      <div className="flex items-center gap-1.5 text-orange-400">
        <Flame size={18} className="fill-orange-400/20" />
        <span className="font-black text-sm tabular-nums">
          {isAr ? toArabicNumber(streak.toString()) : streak}
        </span>
        <span className="text-[10px] font-bold text-white/60">{isAr ? "يوم" : "day"}</span>
      </div>
      <span className="w-px h-4 bg-white/20" />
      <div className="flex items-center gap-1.5 text-white/90">
        <BookOpen size={16} />
        <span className="text-xs font-bold font-naskh">
          {isAr
            ? `${toArabicNumber(pagesToday.toString())} صفحة اليوم`
            : `${pagesToday} page${pagesToday === 1 ? "" : "s"} today`}
        </span>
      </div>
      <ChevronLeft size={14} className={isAr ? "rotate-0" : "rotate-180"} />
    </button>
  );
};

export default ReadingStreakCard;
