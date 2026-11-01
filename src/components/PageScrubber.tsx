import { useState, useRef, useCallback, useEffect } from "react";
import { toArabicNumber } from "@/data/quranData";

interface PageScrubberProps {
  pages: number[];
  currentPage: number;
  onScrubTo: (page: number) => void;
  isAr?: boolean;
}

// Edge-swipe scrubber: drag along the screen edge to fly between pages of
// the juz, like PDF readers. Appears on drag from the right edge (RTL).
const PageScrubber = ({ pages, currentPage, onScrubTo, isAr = true }: PageScrubberProps) => {
  const [active, setActive] = useState(false);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const startY = useRef(0);
  const started = useRef(false);

  const pick = useCallback((clientY: number) => {
    const h = window.innerHeight;
    const ratio = Math.min(1, Math.max(0, clientY / h));
    const idx = Math.round(ratio * (pages.length - 1));
    return pages[Math.min(pages.length - 1, Math.max(0, idx))];
  }, [pages]);

  useEffect(() => {
    if (!active) return;
    const move = (e: TouchEvent) => {
      const t = e.touches[0];
      setPreviewPage(pick(t.clientY));
    };
    const end = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const target = previewPage ?? pick(t.clientY);
      onScrubTo(target);
      setActive(false);
      setPreviewPage(null);
      started.current = false;
    };
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    return () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
  }, [active, pick, onScrubTo, previewPage]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (active) return;
    startY.current = e.touches[0].clientY;
    started.current = true;
    setActive(true);
    setPreviewPage(pick(e.touches[0].clientY));
  };

  if (!pages.length) return null;

  const idx = previewPage !== null ? pages.indexOf(previewPage) : pages.indexOf(currentPage);

  return (
    <>
      {/* invisible edge drag zone: right edge, most of the screen height (RTL reading) */}
      <div
        onTouchStart={onTouchStart}
        className="fixed right-0 top-16 bottom-24 w-6 z-[140] touch-auto"
        aria-hidden
      />
      {active && (
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-[150] pointer-events-none flex items-center gap-2">
          <div className="flex flex-col justify-between h-[60vh] w-10">
            {pages.map(p => (
              <div
                key={p}
                className={`h-px my-[calc((60vh-1px)/${pages.length-1} )] bg-white/30 ${p === previewPage ? "!bg-gold !h-0.5" : ""}`}
                style={{ height: p === previewPage ? 3 : 1 }}
              />
            ))}
          </div>
          <div className="bg-black/80 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center gap-1">
            <span className="font-black text-2xl tabular-nums leading-none">
              {isAr ? toArabicNumber((previewPage ?? currentPage).toString()) : (previewPage ?? currentPage)}
            </span>
            <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
              {isAr ? `من ${toArabicNumber(pages.length.toString())}` : `of ${pages.length}`}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default PageScrubber;
