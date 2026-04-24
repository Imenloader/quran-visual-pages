import React from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Loader2, Sparkles, ChevronUp, Search, ChevronDown, Maximize2, Settings, Volume2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
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

      {/* Full Player Overlay */}
      <AnimatePresence>
        {isFullView && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[500] bg-primary/98 backdrop-blur-3xl flex flex-col text-white"
          >
            {/* Header */}
            <div className="px-6 py-8 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10"
                onClick={() => setIsFullView(false)}
              >
                <ChevronDown size={24} />
              </Button>
              <div className="text-center">
                <h2 className="text-gold font-serif text-xs font-bold tracking-[0.3em] uppercase mb-1">الآن يتلى</h2>
                <p className="text-lg font-serif font-bold text-white truncate max-w-[200px]">
                  {currentSurah ? currentSurah.name : "لم يتم اختيار سورة"}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5">
                <Settings size={20} className="text-white/40" />
              </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-12">
              {/* Visualization Placeholder */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-gold/10 rounded-full animate-pulse-slow" />
                <div className="absolute inset-4 bg-gold/5 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-gold to-yellow-600 rounded-[3rem] shadow-2xl flex items-center justify-center transform rotate-12">
                  <Music size={60} className="text-primary -rotate-12" />
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold drop-shadow-lg">
                  {currentSurah?.name || "اختر سورة للبدء"}
                </h1>
                <p className="text-lg md:text-xl text-white/60 font-naskh">
                  {selectedEdition?.name || "القارئ التلقائي"}
                </p>
              </div>

              {/* Progress Slider Placeholder (Visual only for now as audio logic is complex) */}
              <div className="w-full max-w-md space-y-4">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>الآية {toArabicNumber(currentAyahIndex + 1)}</span>
                  <span>من {toArabicNumber(currentAyahs.length)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8 md:gap-12">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={skipPrevAyah}
                >
                  <SkipBack size={28} />
                </Button>
                
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gold text-primary shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                  onClick={handlePlayToggle}
                >
                  {audioLoading ? (
                    <Loader2 size={36} className="animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={40} fill="currentColor" />
                  ) : (
                    <Play size={40} fill="currentColor" className="ml-2" />
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={skipNextAyah}
                >
                  <SkipForward size={28} />
                </Button>
              </div>
            </div>

            {/* Bottom Settings Tabs */}
            <div className="h-[40vh] bg-black/20 backdrop-blur-2xl rounded-t-[3rem] border-t border-white/5 p-6 md:p-8">
              <Tabs defaultValue={syncMode ? "editions" : "reciters"} dir="rtl" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1.5 rounded-[2rem] border border-white/5 mb-6">
                  <TabsTrigger value="surahs" className="rounded-2xl py-3 data-[state=active]:bg-gold data-[state=active]:text-primary font-bold">السور</TabsTrigger>
                  <TabsTrigger value="editions" className="rounded-2xl py-3 data-[state=active]:bg-gold data-[state=active]:text-primary font-bold">آية بآية</TabsTrigger>
                  <TabsTrigger value="reciters" className="rounded-2xl py-3 data-[state=active]:bg-gold data-[state=active]:text-primary font-bold">تلاوة كاملة</TabsTrigger>
                </TabsList>

                <div className="relative mb-4">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="text"
                    placeholder="بحث عن سورة أو قارئ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-12 pl-6 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>

                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full pb-8" dir="rtl">
                    <TabsContent value="surahs" className="mt-0 focus-visible:ring-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SURAHS.filter(s => s.name.includes(searchQuery) || s.id.toString().includes(searchQuery)).map((surah) => (
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
                        {editions.filter(e => e.name.includes(searchQuery) || e.englishName.toLowerCase().includes(searchQuery.toLowerCase())).map((edition) => (
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
        )}
      </AnimatePresence>
    </>
  );
};

export default QuranPlayerBar;
