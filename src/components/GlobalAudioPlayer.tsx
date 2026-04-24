import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ChevronDown, ChevronUp, X, Maximize2, Minimize2, ListMusic, Music } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const GlobalAudioPlayer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    currentSurah, isPlaying, currentTime, duration, audioLoading,
    playerMinimized, selectedReciterName, playlistQueue, playlistQueueIndex,
    activePlaylistName, isShuffle, isRepeat, volume, isMuted, syncMode,
    togglePlay, playNextSurah, playPrevSurah, handleSeek, handleVolume,
    toggleMute, setIsRepeat, setIsShuffle, setPlayerMinimized, setSyncMode,
    stopPlayer
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Show the player if a surah is active, regardless of page
  // Hide on juz viewer as requested
  if (!currentSurah || location.pathname.startsWith("/juz/")) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  // Fix: Ensure strokeDashoffset is never undefined or NaN
  const strokeDashoffset = isFinite(progress) 
    ? circumference - (progress / 100) * circumference 
    : circumference;

  const handleProgressChange = (val: number[]) => {
    handleSeek(val);
  };

  const handleVolumeChange = (val: number[]) => {
    handleVolume(val);
  };

  return (
    <div className="fixed bottom-28 left-0 right-0 z-[110] px-4 pointer-events-none flex justify-center">
      <AnimatePresence mode="wait">
        {isFullScreen ? (
          <motion.div
            key="fullscreen"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed inset-0 bg-background/98 backdrop-blur-xl z-[200] pointer-events-auto flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="text-foreground h-12 w-12 rounded-full hover:bg-white/5">
                    <ChevronDown className="size-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("player.collapse")}</TooltipContent>
              </Tooltip>
              
              <span className="font-serif text-lg font-bold text-gold tracking-tight">
                {activePlaylistName || t("player.nowPlaying")}
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={stopPlayer}>
                    <X className="size-6 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("player.stop")}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-muted/30 flex items-center justify-center shadow-2xl overflow-hidden group border border-border/40">
                <div className="absolute inset-0 pattern-islamic opacity-5 group-hover:opacity-10 transition-opacity" />
                <Music className="size-32 text-primary/20" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                   <span className="text-muted-foreground font-serif text-sm">
                     {selectedReciterName}
                   </span>
                </div>
              </div>

              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight tracking-tight">
                  {currentSurah.name}
                </h2>
                <p className="text-lg text-gold/90 font-medium">
                  {selectedReciterName}
                </p>
              </div>

              <div className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleProgressChange}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={cn(isShuffle ? "text-accent" : "text-muted-foreground")}
                      >
                        <Shuffle className="size-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("player.shuffle")}</TooltipContent>
                  </Tooltip>

                  <div className="flex items-center gap-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={playPrevSurah} className="text-foreground h-14 w-14 rounded-full hover:bg-primary/5">
                          <SkipForward className="size-8 fill-current" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("player.previous")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={togglePlay}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-transform active:scale-95"
                        >
                          {isPlaying ? <Pause className="size-10" /> : <Play className="size-10 ml-1.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isPlaying ? t("player.pause") : t("player.play")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={playNextSurah} className="text-foreground h-14 w-14 rounded-full hover:bg-primary/5">
                          <SkipBack className="size-8 fill-current" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("player.next")}</TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={cn(isRepeat ? "text-accent" : "text-muted-foreground")}
                      >
                        <Repeat className="size-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("player.repeat")}</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-4 px-4 pt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={toggleMute} className="text-primary">
                        {isMuted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? t("player.unmute") : t("player.mute")}</TooltipContent>
                  </Tooltip>
                  
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-center pb-8">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" className="gap-2 text-primary" onClick={() => {}}>
                     <ListMusic className="size-5" />
                     <span>{t("player.queue")}</span>
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent>{t("player.queue")}</TooltipContent>
               </Tooltip>
            </div>
          </motion.div>
        ) : !isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            onClick={() => setIsExpanded(true)}
            className="relative flex items-center justify-center w-12 h-12 bg-primary/40 backdrop-blur-2xl border border-primary/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] rounded-full hover:scale-105 active:scale-95 transition-all group pointer-events-auto overflow-hidden"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-white/5"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="text-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]"
              />
            </svg>
            {isPlaying ? (
              <Pause className="text-white relative z-10" size={20} />
            ) : (
              <Play className="text-white relative z-10 ml-0.5" size={20} />
            )}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ width: 48, height: 48, opacity: 0, y: 20 }}
            animate={{ width: "auto", height: "auto", opacity: 1, y: 0 }}
            exit={{ width: 48, height: 48, opacity: 0, y: 20 }}
            className="bg-primary/40 backdrop-blur-2xl border border-primary/10 rounded-[3rem] shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-2.5 flex items-center gap-4 min-w-[280px] max-w-[420px] pointer-events-auto"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative shrink-0 group cursor-pointer" onClick={() => setIsFullScreen(true)}>
                   <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 pattern-islamic opacity-5" />
                     <Music className="size-6 text-primary/40" />
                   </div>
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                     <Maximize2 className="size-4 text-white" />
                   </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("player.expand")}</TooltipContent>
            </Tooltip>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate leading-tight">
                  {currentSurah.name}
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {formatTime(currentTime)}
                </span>
              </div>
              <span className="text-[10px] text-gold/80 truncate leading-tight mb-2">
                {selectedReciterName}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="h-1"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={cn("size-8 rounded-full transition-all", isShuffle ? "bg-gold/20 text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5")}
                  >
                    <Shuffle size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("player.shuffle")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={cn("size-8 rounded-full transition-all", isRepeat ? "bg-gold/20 text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5")}
                  >
                    <Repeat size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("player.repeat")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="size-10 rounded-full bg-gold text-primary hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isPlaying ? t("player.pause") : t("player.play")}</TooltipContent>
              </Tooltip>

              <div className="flex flex-col gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 text-white/40 hover:text-white hover:bg-white/5 transition-all rounded-full"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("player.minimize")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={stopPlayer}
                      className="p-1 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("player.stop")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalAudioPlayer;
