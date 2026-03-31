import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ChevronDown, Loader2, ListMusic, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "٠٠:٠٠";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const GlobalAudioPlayer = () => {
  const {
    currentSurah, isPlaying, currentTime, duration, audioLoading,
    playerMinimized, selectedReciterName, playlistQueue, playlistQueueIndex,
    activePlaylistName, isShuffle, isRepeat, volume, isMuted, syncMode,
    togglePlay, playNextSurah, playPrevSurah, handleSeek, handleVolume,
    toggleMute, setIsRepeat, setIsShuffle, setPlayerMinimized, setSyncMode
  } = useAudioPlayer();

  const swipeData = useRef<{ startY: number | null; startTime: number | null }>({
    startY: null,
    startTime: null,
  });

  if (!currentSurah) return null;

  // Minimized: floating restore button
  if (playerMinimized) {
    return (
      <button
        onClick={() => setPlayerMinimized(false)}
        className="fixed bottom-[76px] right-3 z-[61] w-11 h-11 rounded-full gradient-islamic text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all animate-fade-in"
        title="إظهار المشغّل"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="mr-[-1px]" />}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur-md border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)] mb-[72px] transition-all duration-300 animate-slide-up"
      onTouchStart={(e) => {
        const touch = e.touches[0];
        swipeData.current = {
          startY: touch.clientY,
          startTime: Date.now(),
        };
      }}
      onTouchEnd={(e) => {
        const { startY, startTime } = swipeData.current;
        if (startY == null || startTime == null) return;
        const endY = e.changedTouches[0].clientY;
        const diff = endY - startY;
        const elapsed = Date.now() - startTime;
        if (elapsed < 400 && diff > 40) setPlayerMinimized(true);
        swipeData.current = { startY: null, startTime: null };
      }}
    >
      {/* Swipe handle + close button */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-0.5">
        <button
          onClick={() => setPlayerMinimized(true)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          title="إخفاء المشغّل"
        >
          <ChevronDown size={16} />
        </button>
        <div className="w-10 h-1 rounded-full bg-border" />
        <div className="w-6" />
      </div>

      <div>
        <div className="px-4 pt-2">
          <Slider value={[currentTime]} min={0} max={duration || 1} step={1} onValueChange={handleSeek} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground font-naskh mt-1">
            <span>{formatTime(duration)}</span>
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="px-4 pb-3 flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-naskh text-sm font-bold text-foreground truncate">سورة {currentSurah.name}</p>
            <p className="text-xs text-muted-foreground font-naskh truncate">{selectedReciterName}</p>
            {playlistQueue.length > 0 && activePlaylistName && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <ListMusic size={10} className="text-gold shrink-0" />
                <span className="text-[10px] text-gold font-naskh truncate">
                  {activePlaylistName} • {playlistQueueIndex + 1}/{playlistQueue.length}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setSyncMode(!syncMode)} 
              className={`p-2 rounded-full transition-colors ${syncMode ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
              title="تزامن الآيات"
            >
              <Sparkles size={16} />
            </button>
            <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 rounded-full transition-colors ${isShuffle ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              <Shuffle size={16} />
            </button>
            <button onClick={playPrevSurah} className="p-2 rounded-full text-foreground hover:bg-muted transition-colors">
              <SkipForward size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full gradient-islamic flex items-center justify-center text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
              disabled={audioLoading}
            >
              {audioLoading ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="mr-[-2px]" />}
            </button>
            <button onClick={playNextSurah} className="p-2 rounded-full text-foreground hover:bg-muted transition-colors">
              <SkipBack size={18} />
            </button>
            <button onClick={() => setIsRepeat(!isRepeat)} className={`p-2 rounded-full transition-colors ${isRepeat ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              <Repeat size={16} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 w-28">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <Slider value={[isMuted ? 0 : volume]} min={0} max={100} step={1} onValueChange={handleVolume} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
