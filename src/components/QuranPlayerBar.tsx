import React from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Loader2, Sparkles, ChevronUp, Search, ChevronDown, Maximize2, Settings, Volume2, ListMusic, X, Repeat } from "lucide-react";
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
    syncMode, setSyncMode, reciters, playSurah, playAyah,
    selectedReciterName, repeatMode, setRepeatMode
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
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "flex flex-col items-center transition-all duration-500 group",
          className
        )}
      >
        <motion.div 
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={cn(
            "relative flex items-center gap-0.5 sm:gap-2 p-1 rounded-full bg-primary/40 backdrop-blur-2xl border border-primary/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[0.16, 1, 0.3, 1] max-w-[98vw] sm:max-w-none overflow-hidden cursor-pointer",
            isExpanded ? "px-2 sm:px-5 py-2.5 rounded-[3rem] cursor-default" : "p-1 hover:scale-105 active:scale-95"
          )}
        >
          {/* Expand Hint (Floating Handle when collapsed) */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
            >
              <div className="w-8 h-1 rounded-full bg-white/20" />
              <ChevronUp size={14} className="text-white/40 animate-bounce" />
            </motion.div>
          )}

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
                  <SkipForward size={16} className="sm:size-[18px]" />
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
                  <SkipBack size={16} className="sm:size-[18px]" />
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

                <div className="hidden sm:block h-6 w-px bg-primary/10 mx-1" />

                <Button 
                  variant={repeatMode !== 'none' ? "default" : "ghost"} 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all",
                    repeatMode !== 'none' ? "bg-gold text-primary" : "hover:bg-primary/10 text-white/80"
                  )}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (repeatMode === 'none') setRepeatMode('all');
                    else if (repeatMode === 'all') setRepeatMode('one');
                    else setRepeatMode('none');
                  }}
                >
                  <div className="relative">
                    <Repeat size={16} className="sm:size-[18px]" />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-gold">1</span>
                    )}
                  </div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 hover:bg-primary/30 text-white shadow-inner transition-all duration-500"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            >
              <motion.div
                animate={{ rotate: 180 }}
              >
                <ChevronUp size={12} className="sm:size-[14px]" />
              </motion.div>
            </Button>
          )}
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
            className="fixed inset-0 z-[501] flex items-center justify-center focus:outline-none"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="w-full h-full bg-background/98 backdrop-blur-xl flex flex-col relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-8 pb-4 relative z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-full hover:bg-white/5 text-foreground"
                  onClick={() => setIsFullView(false)}
                >
                  <ChevronDown className="size-8" />
                </Button>
                
                <div className="text-center">
                  <h2 className="text-gold font-serif text-[10px] font-bold tracking-[0.3em] uppercase mb-1 opacity-50">الآن يتلى</h2>
                  <p className="text-lg font-serif font-bold text-gold">
                    {currentSurah ? currentSurah.name : "لم يتم اختيار سورة"}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-full hover:bg-red-400/10 text-red-400/40 hover:text-red-400 transition-all"
                  onClick={() => setIsFullView(false)}
                >
                  <X className="size-6" />
                </Button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center min-h-0">
                {/* Centerpiece - Large Rounded Square Artwork */}
                <motion.div 
                  layoutId="player-artwork"
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-muted/30 flex items-center justify-center shadow-2xl overflow-hidden group border border-border/40 mb-8"
                >
                  <div className="absolute inset-0 pattern-islamic opacity-5 group-hover:opacity-10 transition-opacity" />
                  <Music className="size-32 text-primary/20" />
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                     <span className="text-muted-foreground font-serif text-sm">
                       {selectedEdition?.name || "القارئ التلقائي"}
                     </span>
                  </div>
                </motion.div>

                {/* Info & Metadata */}
                <div className="w-full max-w-md space-y-4 text-center mb-8">
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight tracking-tight">
                      {currentSurah?.name || "اختر سورة"}
                    </h1>
                    <p className="text-lg text-gold/90 font-medium font-serif">
                      {selectedEdition?.name || "تلاوة آية بآية"}
                    </p>
                  </div>

                  {/* Progress & Time */}
                  <div className="space-y-3">
                    <div className="relative h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 right-0 bg-gold shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                      />
                    </div>
                    <div className="flex justify-between items-center px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      <div className="flex items-center gap-2">
                        <span>الآية</span>
                        <span className="text-foreground">{toArabicNumber(currentAyahIndex + 1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>من</span>
                        <span className="text-foreground">{toArabicNumber(currentAyahs.length)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-8 mb-12">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-14 w-14 rounded-full hover:bg-primary/5 text-foreground active:scale-90 transition-all"
                    onClick={skipPrevAyah}
                  >
                    <SkipForward size={32} fill="currentColor" />
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={handlePlayToggle}
                  >
                    {audioLoading ? (
                      <Loader2 size={36} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={40} fill="currentColor" />
                    ) : (
                      <Play size={40} fill="currentColor" className="ml-1.5" />
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-14 w-14 rounded-full hover:bg-primary/5 text-foreground active:scale-90 transition-all"
                    onClick={skipNextAyah}
                  >
                    <SkipBack size={32} fill="currentColor" />
                  </Button>
                </div>
              </div>

              {/* Bottom Settings Tabs Area - Integrated in the same background */}
              <div className="relative z-10 bg-muted/5 backdrop-blur-xl border-t border-border/40 px-6 pt-8 pb-8 h-[35vh]">
                <Tabs defaultValue={syncMode ? "editions" : "reciters"} dir="rtl" className="h-full flex flex-col max-w-2xl mx-auto">
                  <div className="w-full flex flex-col gap-4">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1.5 rounded-2xl border border-border/10">
                      <TabsTrigger value="surahs" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs transition-all">السور</TabsTrigger>
                      <TabsTrigger value="editions" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs transition-all">آية بآية</TabsTrigger>
                      <TabsTrigger value="reciters" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs transition-all">تلاوة كاملة</TabsTrigger>
                    </TabsList>

                    <div className="relative group">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder="بحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/20 border border-border/10 rounded-2xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 mt-4">
                    <ScrollArea className="h-full" dir="rtl">
                      <TabsContent value="surahs" className="mt-0 focus-visible:ring-0 outline-none">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
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
                                "flex items-center gap-3 p-4 rounded-2xl border transition-all text-right group",
                                currentSurah?.id === surah.id 
                                  ? "bg-primary border-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" 
                                  : "bg-muted/20 border-border/10 hover:bg-muted/40 text-foreground/70"
                              )}
                            >
                              <span className="text-[10px] opacity-30 group-hover:opacity-50">{toArabicNumber(surah.id)}</span>
                              <span className="font-serif text-sm">{surah.name}</span>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="editions" className="mt-0 focus-visible:ring-0 outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
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
                                  ? "bg-primary border-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" 
                                  : "bg-muted/20 border-border/10 hover:bg-muted/40 text-foreground/70"
                              )}
                            >
                              <span className="text-base font-serif">{edition.name}</span>
                              <span className={cn("text-[10px] uppercase tracking-widest", selectedEdition?.identifier === edition.identifier ? "text-primary-foreground/60" : "text-muted-foreground/40")}>
                                {edition.englishName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="reciters" className="mt-0 focus-visible:ring-0 outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                          {reciters.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 200).map((reciter) => (
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
                                  !syncMode && selectedReciterName === reciter.name
                                    ? "bg-primary border-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" 
                                    : "bg-muted/20 border-border/10 hover:bg-muted/40 text-foreground/70"
                                )}
                            >
                              <span className="text-base font-serif">{reciter.name}</span>
                              <span className={cn("text-[10px] uppercase tracking-widest", !syncMode && selectedReciterName === reciter.name ? "text-primary-foreground/60" : "text-muted-foreground/40")}>
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
