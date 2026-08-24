import { memo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import {
  Bookmark, Share2, BookOpen, List, Sun, Moon, Type, FileImage,
  ArrowDown, ArrowRightLeft, Server, Wand2, DownloadCloud,
  EyeOff, GraduationCap, ZoomIn, ZoomOut, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";
import HifzQuizView from "./HifzQuizView";
import PageNavigator from "./PageNavigator";
import JuzIndex from "./JuzIndex";
import SourceSelector from "./SourceSelector";

interface ReaderToolsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveBookmark: () => void;
  bookmarked: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  hifzMode: boolean;
  onToggleHifzMode: () => void;
  onDownloadAudio?: () => void;
  isDownloadingAudio?: boolean;
  onPrepareOffline: () => void;
  isPreparingOffline: boolean;
  currentPage: number;
  juzNumber: number;
  pages: number[];
  onGoToPage: (page: number) => void;
}

const ReaderToolsDrawer = ({
  open,
  onOpenChange,
  onSaveBookmark,
  bookmarked,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  hifzMode,
  onToggleHifzMode,
  onDownloadAudio,
  isDownloadingAudio,
  onPrepareOffline,
  isPreparingOffline,
  currentPage,
  juzNumber,
  pages,
  onGoToPage,
}: ReaderToolsDrawerProps) => {
  const {
    theme, setTheme,
    readingMode, setReadingMode,
    scrollDirection, setScrollDirection,
    tajweedMode, setTajweedMode,
    atmosphericBackground, setAtmosphericBackground
  } = useTheme();

  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === "light") setTheme("sepia");
    else if (theme === "sepia") setTheme("dark");
    else setTheme("light");
  };

  const toggleReadingMode = () => {
    const nextMode = readingMode === "image" ? "text" : "image";
    setReadingMode(nextMode);
    if (nextMode === "text") setTajweedMode(true);
    else setTajweedMode(false);
  };

  const toggleScrollDirection = () => {
    setScrollDirection(scrollDirection === "vertical" ? "horizontal" : "vertical");
  };

  const themeLabel = theme === "light" ? "فاتح" : theme === "sepia" ? "بني" : "داكن";
  const themeIcon = theme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />;

  const [activeView, setActiveView] = useState<"tools" | "pageNav" | "juzIndex" | "source">("tools");

  const tools = [
    // Row 1: Core actions
    [
      {
        icon: <Bookmark className="size-5" fill={bookmarked ? "currentColor" : "none"} />,
        label: "علامة مرجعية",
        onClick: () => { onSaveBookmark(); onOpenChange(false); },
        active: bookmarked,
      },
      {
        icon: <Share2 className="size-5" />,
        label: "مشاركة",
        onClick: () => {},
        isShare: true,
      },
      {
        icon: <BookOpen className="size-5" />,
        label: "انتقال لصفحة",
        onClick: () => setActiveView("pageNav"),
      },
      {
        icon: <List className="size-5" />,
        label: "الفهرس",
        onClick: () => setActiveView("juzIndex"),
      },
    ],
    // Row 2: View & appearance
    [
      {
        icon: themeIcon,
        label: `المظهر: ${themeLabel}`,
        onClick: toggleTheme,
      },
      {
        icon: readingMode === "image" ? <Type className="size-5" /> : <FileImage className="size-5" />,
        label: readingMode === "image" ? "وضع النص" : "وضع الصورة",
        onClick: toggleReadingMode,
      },
      {
        icon: scrollDirection === "vertical" ? <ArrowDown className="size-5" /> : <ArrowRightLeft className="size-5" />,
        label: scrollDirection === "vertical" ? "تمرير عمودي" : "تمرير أفقي",
        onClick: toggleScrollDirection,
      },
      {
        icon: <Wand2 className="size-5" />,
        label: "خلفية جوية",
        onClick: () => setAtmosphericBackground(!atmosphericBackground),
        active: atmosphericBackground,
      },
    ],
    // Row 3: Reading tools
    [
      {
        icon: <EyeOff className="size-5" />,
        label: "وضع الحفظ",
        onClick: () => { onToggleHifzMode(); onOpenChange(false); },
        active: hifzMode,
      },
      {
        icon: <GraduationCap className="size-5" />,
        label: "اختبار الحفظ",
        onClick: () => setIsQuizOpen(true),
      },
      {
        icon: <Server className="size-5" />,
        label: "مصدر الصور",
        onClick: () => setActiveView("source"),
      },
      {
        icon: <DownloadCloud className={cn("size-5", isDownloadingAudio && "animate-pulse")} />,
        label: "تحميل الصوت",
        onClick: () => { onDownloadAudio?.(); onOpenChange(false); },
        disabled: isDownloadingAudio,
      },
    ],
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-[2rem] border-t border-border/30 bg-card/98 backdrop-blur-xl max-h-[80vh] pb-safe"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-right font-serif text-lg">أدوات القراءة</SheetTitle>
            <SheetDescription className="text-right text-xs">
              صفحة {toArabicNumber(currentPage.toString())} · الجزء {toArabicNumber(juzNumber.toString())}
            </SheetDescription>
          </SheetHeader>

          {/* Tools Grid */}
          {activeView === "tools" && (
            <div className="flex flex-col gap-4 pb-4" dir="rtl">
              {tools.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-4 gap-2">
                  {row.map((tool, toolIdx) => {
                    // Special handling for share button
                    if ('isShare' in tool && tool.isShare) {
                      return (
                        <div
                          key={toolIdx}
                          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-background border border-border/40 shadow-sm hover:bg-muted/60 transition-all active:scale-95 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
                          <span className="text-[10px] font-medium text-muted-foreground">مشاركة</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={toolIdx}
                        onClick={tool.onClick}
                        disabled={'disabled' in tool ? tool.disabled : false}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 border",
                          'active' in tool && tool.active
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-background border-border/40 shadow-sm hover:bg-muted/60 text-primary/80",
                          'disabled' in tool && tool.disabled && "opacity-50 pointer-events-none"
                        )}
                      >
                        {tool.icon}
                        <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Zoom Controls — special row */}
              <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-background border border-border/40 shadow-sm">
                <button
                  onClick={onZoomOut}
                  className="p-2 rounded-xl hover:bg-muted/60 text-primary/70 transition-all active:scale-90"
                >
                  <ZoomOut className="size-5" />
                </button>
                <button
                  onClick={onResetZoom}
                  className="px-3 py-1 text-sm font-bold text-primary hover:text-accent transition-colors tabular-nums min-w-[48px] text-center rounded-lg hover:bg-muted/40"
                >
                  {Math.round(zoom)}%
                </button>
                <button
                  onClick={onZoomIn}
                  className="p-2 rounded-xl hover:bg-muted/60 text-primary/70 transition-all active:scale-90"
                >
                  <ZoomIn className="size-5" />
                </button>
                <span className="text-[10px] text-muted-foreground mr-2">تكبير / تصغير</span>
              </div>

              {/* Prepare Offline — bottom action */}
              <button
                onClick={() => { onPrepareOffline(); onOpenChange(false); }}
                disabled={isPreparingOffline}
                className="w-full py-3 rounded-2xl border border-border/40 bg-muted/20 text-sm font-serif text-primary hover:bg-muted/40 transition-all disabled:opacity-50"
              >
                {isPreparingOffline ? "جارٍ التحميل..." : "تجهيز هذا الجزء للقراءة بدون إنترنت"}
              </button>
            </div>
          )}

          {activeView !== "tools" && (
            <div className="flex flex-col pb-4 h-[60vh] max-h-[500px]" dir="rtl">
              <div className="flex items-center mb-4 sticky top-0 bg-card/98 z-10 py-2">
                <button 
                  onClick={() => setActiveView("tools")}
                  className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition-colors mr-auto"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-border/30">
                {activeView === "pageNav" && (
                  <PageNavigator 
                    pages={pages} 
                    currentPage={currentPage} 
                    onGoToPage={(p) => { onGoToPage(p); onOpenChange(false); }}
                    onClose={() => setActiveView("tools")}
                    variant="sheet"
                  />
                )}
                {activeView === "juzIndex" && (
                  <JuzIndex 
                    currentJuz={juzNumber}
                    onClose={() => { setActiveView("tools"); onOpenChange(false); }}
                    variant="sheet"
                  />
                )}
                {activeView === "source" && (
                  <SourceSelector 
                    onClose={() => setActiveView("tools")}
                    variant="sheet"
                  />
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Hifz Quiz Sheet */}
      <Sheet open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <SheetHeader>
            <SheetTitle className="text-right font-serif">اختبار الحفظ</SheetTitle>
            <SheetDescription className="text-right">اختبر حفظك للصفحة الحالية عبر أسئلة ذكية</SheetDescription>
          </SheetHeader>
          <HifzQuizView
            pageNumber={currentPage}
            onClose={() => setIsQuizOpen(false)}
            onComplete={() => {}}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default memo(ReaderToolsDrawer);
