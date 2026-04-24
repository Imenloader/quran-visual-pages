import React from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Loader2, Sparkles, ChevronUp, Search } from "lucide-react";
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10 text-white/80">
                    <Music size={16} className="sm:size-[18px]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh] rounded-t-[3rem] border-t-primary/10 bg-primary/98 backdrop-blur-3xl text-white">
                  <SheetHeader className="text-right pb-6 border-b border-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="w-10" />
                      <SheetTitle className="font-serif text-3xl text-gold">إعدادات التلاوة</SheetTitle>
                      <div className="p-2 rounded-full bg-primary/5 text-white/40">
                        <Music size={20} />
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <Tabs defaultValue={syncMode ? "editions" : "reciters"} dir="rtl" className="mt-6 flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-3 bg-primary/20 p-1 rounded-2xl">
                      <TabsTrigger value="surahs" className="rounded-xl data-[state=active]:bg-gold data-[state=active]:text-primary">السور</TabsTrigger>
                      <TabsTrigger value="editions" className="rounded-xl data-[state=active]:bg-gold data-[state=active]:text-primary">آية بآية</TabsTrigger>
                      <TabsTrigger value="reciters" className="rounded-xl data-[state=active]:bg-gold data-[state=active]:text-primary">تلاوة كاملة</TabsTrigger>
                    </TabsList>
                    
                    <div className="px-1 mt-4 sticky top-0 z-10 bg-primary/95 backdrop-blur-md pb-2">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                          type="text"
                          placeholder="بحث..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-0 mt-2 overflow-hidden">
                      <ScrollArea className="h-full pb-32" dir="rtl">
                        <TabsContent value="surahs" className="mt-0">
                          <div className="grid grid-cols-2 gap-2 p-1">
                            {SURAHS.filter(s => s.name.includes(searchQuery) || s.id.toString().includes(searchQuery)).map((surah) => (
                              <Button
                                key={surah.id}
                                variant={currentSurah?.id === surah.id ? "default" : "ghost"}
                                className={cn(
                                  "justify-start h-auto py-3 px-4 rounded-xl font-naskh text-right",
                                  currentSurah?.id === surah.id ? "bg-gold text-primary shadow-lg" : "text-white/70 hover:bg-primary/10"
                                )}
                                onClick={() => {
                                  if (syncMode) playAyah(surah.id, 1);
                                  else if (reciters.length > 0) {
                                    const reciter = reciters[0];
                                    const moshaf = reciter.moshaf[0];
                                    playSurah(surah, { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                  }
                                }}
                              >
                                <span className="text-sm">{surah.id}. {surah.name}</span>
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="editions" className="mt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                            {editions.filter(e => e.name.includes(searchQuery) || e.englishName.toLowerCase().includes(searchQuery.toLowerCase())).map((edition) => (
                              <Button
                                key={edition.identifier}
                                variant={selectedEdition?.identifier === edition.identifier ? "default" : "ghost"}
                                className={cn(
                                  "justify-start h-auto py-4 px-5 rounded-xl font-naskh text-right",
                                  selectedEdition?.identifier === edition.identifier ? "bg-gold text-primary shadow-lg" : "text-white/70 hover:bg-primary/10"
                                )}
                                onClick={() => {
                                  setSyncMode(true);
                                  setSelectedEdition(edition);
                                }}
                              >
                                <div className="flex flex-col items-start text-right">
                                  <span className="text-md">{edition.name}</span>
                                  <span className="text-[10px] opacity-40 uppercase">{edition.englishName}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="reciters" className="mt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                            {reciters.filter(r => r.name.includes(searchQuery)).slice(0, 50).map((reciter) => (
                              <Button
                                key={reciter.id}
                                variant={!syncMode && currentSurah && reciter.name.includes(currentSurah.name) ? "default" : "ghost"} // Approximate check
                                className={cn(
                                  "justify-start h-auto py-4 px-5 rounded-xl font-naskh text-right",
                                  !syncMode && currentSurah && reciter.name.includes(currentSurah.name) ? "bg-gold text-primary shadow-lg" : "text-white/70 hover:bg-primary/10"
                                )}
                                onClick={() => {
                                  setSyncMode(false);
                                  const moshaf = reciter.moshaf[0];
                                  if (currentSurah) {
                                    playSurah(currentSurah, { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                  } else {
                                    playSurah(SURAHS[0], { id: reciter.id, name: reciter.name }, { id: moshaf.id, name: moshaf.name, server: moshaf.server, surah_list: moshaf.surah_list });
                                  }
                                }}
                              >
                                <div className="flex flex-col items-start text-right">
                                  <span className="text-md">{reciter.name}</span>
                                  <span className="text-[10px] opacity-40 uppercase">{reciter.moshaf[0]?.name || "رواية حفص"}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </div>
                  </Tabs>
                </SheetContent>
              </Sheet>

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
  );
};

export default QuranPlayerBar;
