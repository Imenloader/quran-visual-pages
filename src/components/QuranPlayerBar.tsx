import React from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Loader2, Sparkles, ChevronUp, Search, ChevronDown, Maximize2, Settings, Volume2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { cn } from "@/lib/utils";
import { toArabicNumber } from "@/data/quranData";
import { SURAHS } from "@/data/audioData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuranPlayerBarProps {
  onPlayFirst?: () => void;
  className?: string;
  isScrollingDown?: boolean;
  isFullscreen?: boolean;
}

const QuranPlayerBar: React.FC<QuranPlayerBarProps> = ({ onPlayFirst, className, isScrollingDown, isFullscreen }) => {
  const { 
    isPlaying, togglePlay, skipNextAyah, skipPrevAyah,
    selectedEdition, setSelectedEdition, editions,
    audioLoading, currentAyahs, currentAyahIndex, currentSurah,
    syncMode, setSyncMode, reciters, playSurah, playAyah
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isFullView, setIsFullView] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Auto-collapse when scrolling down
  React.useEffect(() => {
    if (isScrollingDown && isExpanded) {
      setIsExpanded(false);
    }
  }, [isScrollingDown, isExpanded]);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSurah && onPlayFirst) {
      onPlayFirst();
    } else {
      togglePlay();
    }
  };

  const progress = currentAyahs.length > 0 ? ((currentAyahIndex + 1) / currentAyahs.length) * 100 : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <motion.div 
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "flex flex-col items-center transition-all duration-500 group",
          className
        )}
      >
        <motion.div 
          layout
          className={cn(
            "relative flex items-center gap-0.5 sm:gap-2 p-1.5 rounded-full bg-primary/40 backdrop-blur-2xl border border-primary/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[0.16, 1, 0.3, 1] max-w-[98vw] sm:max-w-none overflow-hidden",
            isExpanded ? "px-2 sm:px-5 py-2.5 rounded-[3rem]" : "p-1.5"
          )}
        >
          {/* Progress Ring (Collapsed Mode) */}
          {!isExpanded && isPlaying && (
            <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/5"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ strokeDasharray: circumference, strokeDashoffset }}
                className="text-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                transition={{ duration: 0.5 }}
              />
            </svg>
          )}

          {/* Top Progress Line (Expanded Mode) */}
          {isExpanded && isPlaying && (
            <div className="absolute top-0 left-6 right-6 h-[1.5px] overflow-hidden rounded-full">
              <motion.div 
                layout
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gold/80 shadow-[0_0_12px_rgba(212,175,55,1)]"
              />
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="flex items-center gap-1"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10 text-white/80"
                  onClick={() => setIsFullView(true)}
                >
                  <Maximize2 size={16} className="sm:size-[18px]" />
                </Button>

                <div className="hidden sm:block h-6 w-px bg-primary/10 mx-1" />

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10 text-white/80"
                  onClick={(e) => { e.stopPropagation(); skipPrevAyah(); }}
                >
                  <SkipBack size={16} className="sm:size-[18px]" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="default" 
            size="icon" 
            className={cn(
              "relative z-10 rounded-full transition-all duration-700 ease-[0.16, 1, 0.3, 1] shadow-2xl",
              isExpanded ? "w-11 h-11 sm:w-14 sm:h-14 bg-gold text-primary hover:scale-105 shadow-gold/20" : "w-12 h-12 bg-primary/10 text-white hover:bg-primary/20"
            )}
            onClick={handlePlayToggle}
          >
            {audioLoading ? (
              <Loader2 size={20} className="animate-spin sm:size-[24px]" />
            ) : isPlaying ? (
              <Pause size={22} fill="currentColor" className="sm:size-[26px]" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-1 sm:size-[26px]" />
            )}
          </Button>

          <AnimatePresence mode="popLayout">
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                className="flex items-center gap-1"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10 text-white/80"
                  onClick={(e) => { e.stopPropagation(); skipNextAyah(); }}
                >
                  <SkipForward size={16} className="sm:size-[18px]" />
                </Button>

                <div className="hidden sm:block h-6 w-px bg-primary/10 mx-1" />

                <Button 
                  variant={syncMode ? "default" : "ghost"} 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all",
                    syncMode ? "bg-gold text-primary" : "hover:bg-primary/10 text-white/80"
                  )}
                  onClick={(e) => { e.stopPropagation(); setSyncMode(!syncMode); }}
                >
                  <Sparkles size={16} className="sm:size-[18px]" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10 transition-all duration-500",
              isExpanded ? "text-white/40 ml-0.5 sm:ml-1" : "absolute -top-1 -right-1 bg-primary/90 backdrop-blur-md border border-primary/20 text-gold scale-75 shadow-xl"
            )}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
            >
              <ChevronUp size={12} className="sm:size-[14px]" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Progress Info (Integrated when expanded) */}
        <AnimatePresence>
          {isExpanded && isPlaying && currentAyahs.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 px-4 py-1 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/5 flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gold/40 uppercase tracking-widest">الآية</span>
                <span className="text-sm font-serif text-gold font-medium">{toArabicNumber(currentAyahIndex + 1)}</span>
              </div>
              <div className="h-3 w-px bg-primary/5" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">من</span>
                <span className="text-sm font-serif text-white/60">{toArabicNumber(currentAyahs.length)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Full Player Overlay via raw Radix Portal to bypass UI kit constraints */}
      <DialogPrimitive.Root open={isFullView} onOpenChange={setIsFullView}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[500] bg-background/60 backdrop-blur-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content 
            className="fixed inset-0 z-[501] flex items-center justify-center p-0 sm:p-4 md:p-8 focus:outline-none"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="w-full h-full max-h-[100dvh] sm:max-w-4xl sm:h-[85vh] sm:rounded-[3.5rem] bg-gradient-to-br from-emerald-deep via-primary to-primary-foreground/10 flex flex-col relative overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/5"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none pattern-islamic scale-150 rotate-12" />
              
              {/* Header */}
              <div className="relative z-10 px-6 pt-12 pb-8 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80"
                  onClick={() => setIsFullView(false)}
                >
                  <ChevronDown size={28} />
                </Button>
                <div className="text-center">
                  <h2 className="text-gold font-serif text-[10px] font-bold tracking-[0.4em] uppercase mb-1 opacity-60">الآن يتلى</h2>
                  <div className="flex flex-col items-center">
                    <p className="text-2xl font-serif font-bold text-white tracking-tight">
                      {currentSurah ? currentSurah.name : "لم يتم اختيار سورة"}
                    </p>
                    <div className="h-0.5 w-8 bg-gold/30 rounded-full mt-1" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 text-white/60">
                  <Settings size={22} />
                </Button>
              </div>

              {/* Main Content Area */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-around px-8 text-center py-4 min-h-0 overflow-y-auto custom-scrollbar">
                {/* Centerpiece - Shamsa (Islamic Star) */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex-shrink-0 flex items-center justify-center my-4">
                  {/* Outer Rings */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-gold/10 rounded-full" 
                  />
                  <div className="absolute inset-[-10%] bg-gold/5 rounded-full animate-pulse-slow blur-2xl" />
                  
                  {/* The Star (Shamsa) */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gold/10 backdrop-blur-xl border-2 border-gold/30 shamsa shadow-[0_0_50px_rgba(212,175,55,0.15)]" />
                    <div className="absolute inset-4 bg-primary/20 shamsa border border-gold/20" />
                    <div className="absolute inset-12 bg-gold/5 shamsa flex items-center justify-center">
                       <div className="w-full h-full flex flex-col items-center justify-center p-4">
                         {audioLoading ? (
                           <Loader2 size={64} className="text-gold animate-spin opacity-40" />
                         ) : (
                           <motion.div
                             animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                             transition={{ duration: 2, repeat: Infinity }}
                           >
                             <Music size={80} strokeWidth={1} className="text-gold/80" />
                           </motion.div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Info & Metadata */}
                <div className="w-full max-w-md space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <motion.h1 
                      layout
                      className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-2xl"
                    >
                      {currentSurah?.name || "اختر سورة للبدء"}
                    </motion.h1>
                    <p className="text-xl md:text-2xl text-gold/80 font-naskh font-medium">
                      {selectedEdition?.name || "القارئ التلقائي"}
                    </p>
                  </div>

                  {/* Progress & Time */}
                  <div className="space-y-4">
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 right-0 bg-gold shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">من</span>
                        <span className="text-xs font-serif text-white/50">{toArabicNumber(currentAyahs.length)}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                        <span className="text-xs font-bold text-gold">الآية {toArabicNumber(currentAyahIndex + 1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">المتبقي</span>
                        <span className="text-xs font-serif text-white/50">{toArabicNumber(currentAyahs.length - (currentAyahIndex + 1))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-6 sm:gap-10 md:gap-16 my-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/5 hover:bg-white/10 text-white active:scale-90 transition-all"
                    onClick={skipPrevAyah}
                  >
                    <SkipBack size={28} className="sm:size-[32px]" />
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full bg-gold text-primary shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:scale-105 hover:shadow-gold/40 active:scale-95 transition-all"
                    onClick={handlePlayToggle}
                  >
                    {audioLoading ? (
                      <Loader2 size={32} className="animate-spin sm:size-[40px]" />
                    ) : isPlaying ? (
                      <Pause size={36} fill="currentColor" className="sm:size-[48px]" />
                    ) : (
                      <Play size={36} fill="currentColor" className="ml-1 sm:size-[48px] sm:ml-2" />
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/5 hover:bg-white/10 text-white active:scale-90 transition-all"
                    onClick={skipNextAyah}
                  >
                    <SkipForward size={28} className="sm:size-[32px]" />
                  </Button>
                </div>
              </div>

              {/* Bottom Quick-Switch Area */}
              <div className="relative z-10 bg-primary/20 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/10 px-6 pt-10 pb-8 h-[35vh]">
                <Tabs defaultValue={syncMode ? "editions" : "reciters"} dir="rtl" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1.5 rounded-[2.5rem] border border-white/10 mb-6 shadow-inner">
                    <TabsTrigger value="surahs" className="rounded-[2rem] py-3.5 data-[state=active]:bg-gold data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all duration-500 font-bold text-sm tracking-wide">السور</TabsTrigger>
                    <TabsTrigger value="editions" className="rounded-[2rem] py-3.5 data-[state=active]:bg-gold data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all duration-500 font-bold text-sm tracking-wide">آية بآية</TabsTrigger>
                    <TabsTrigger value="reciters" className="rounded-[2rem] py-3.5 data-[state=active]:bg-gold data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all duration-500 font-bold text-sm tracking-wide">تلاوة كاملة</TabsTrigger>
                  </TabsList>

                  <div className="relative mb-5 group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                    <input 
                      type="text"
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-4 pr-14 pl-6 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full" dir="rtl">
                      <TabsContent value="surahs" className="mt-0 focus-visible:ring-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SURAHS.filter(s => s.name.includes(searchQuery)).map((surah) => (
                            <button
                              key={surah.id}
                              onClick={() => {
                                if (syncMode) playAyah(surah.id, 1);
                                else if (reciters.length > 0) {
                                  const reciter = reciters[0];
                                  const moshaf = reciter.moshaf[0];
                                  playSurah(surah, { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                }
                              }}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border transition-all text-right",
                                currentSurah?.id === surah.id 
                                  ? "bg-gold border-gold text-primary font-bold shadow-lg" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                              )}
                            >
                              <span className="text-xs opacity-40">{toArabicNumber(surah.id)}</span>
                              <span className="font-serif text-sm">{surah.name}</span>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="editions" className="mt-0 focus-visible:ring-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editions.filter(e => e.name.includes(searchQuery)).map((edition) => (
                            <button
                              key={edition.identifier}
                              onClick={() => {
                                setSyncMode(true);
                                setSelectedEdition(edition);
                              }}
                              className={cn(
                                "flex flex-col p-4 rounded-2xl border transition-all text-right",
                                selectedEdition?.identifier === edition.identifier 
                                  ? "bg-gold border-gold text-primary font-bold shadow-lg" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                              )}
                            >
                              <span className="text-base font-serif">{edition.name}</span>
                              <span className={cn("text-[10px] uppercase tracking-widest", selectedEdition?.identifier === edition.identifier ? "text-primary/60" : "text-white/30")}>
                                {edition.englishName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="reciters" className="mt-0 focus-visible:ring-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {reciters.filter(r => r.name.includes(searchQuery)).slice(0, 50).map((reciter) => (
                            <button
                              key={reciter.id}
                              onClick={() => {
                                setSyncMode(false);
                                const moshaf = reciter.moshaf[0];
                                if (currentSurah) {
                                  playSurah(currentSurah, { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                } else {
                                  playSurah(SURAHS[0], { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                }
                              }}
                              className={cn(
                                "flex flex-col p-4 rounded-2xl border transition-all text-right",
                                !syncMode && currentSurah && reciter.name.includes(currentSurah.name) // Approximate
                                  ? "bg-gold border-gold text-primary font-bold shadow-lg" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                              )}
                            >
                              <span className="text-base font-serif">{reciter.name}</span>
                              <span className={cn("text-[10px] uppercase tracking-widest", !syncMode && currentSurah && reciter.name.includes(currentSurah.name) ? "text-primary/60" : "text-white/30")}>
                                {reciter.moshaf[0]?.name || "رواية حفص عن عاصم"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </div>
                </Tabs>
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};

export default QuranPlayerBar;
