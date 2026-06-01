import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { fetchWithCache } from "@/lib/apiClient";
import { fetchAudioEditions, fetchChapterAudio, fetchReciters, type Edition, type Reciter } from "@/services/quranService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SURAHS, type Surah, type ReciterInfo, type MoshafInfo, type PlaylistTrackGlobal } from "@/data/audioData";
import { useUser } from "./UserContext";
import { Capacitor } from "@capacitor/core";

export type { Surah, ReciterInfo, MoshafInfo, PlaylistTrackGlobal };

interface AyahAudio {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface LastPlayed {
  reciterId: number;
  reciterName: string;
  moshafId: number;
  moshafName: string;
  moshafServer: string;
  surahId: number;
  surahName: string;
  currentTime: number;
  surahList: string;
}

const LAST_PLAYED_KEY = "quran-last-played";

export const getAudioUrl = (server: string, surahId: number | string | undefined | null): string => {
  if (!server) return "";
  const padded = String(surahId ?? "").padStart(3, "0");
  
  // Clean the server URL
  let httpsServer = server.trim();
  
  // Always normalize external recitation hosts to HTTPS. The app is served over
  // HTTPS, so leaving an http:// moshaf URL here can produce mixed-content
  // failures that leave the media element unable to load subsequent tracks.
  if (httpsServer.startsWith("http://")) {
    httpsServer = httpsServer.replace("http://", "https://");
  } else if (httpsServer.startsWith("//")) {
    httpsServer = "https:" + httpsServer;
  } else if (!httpsServer.startsWith("https://")) {
    httpsServer = "https://" + httpsServer;
  }
  
  // Ensure trailing slash
  if (!httpsServer.endsWith("/")) {
    httpsServer += "/";
  }
  return `${httpsServer}${padded}.mp3`;
};

interface AudioPlayerContextType {
  currentSurah: Surah | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  audioLoading: boolean;
  playerMinimized: boolean;
  selectedReciterName: string;
  playlistQueue: PlaylistTrackGlobal[];
  playlistQueueIndex: number;
  activePlaylistName: string;
  currentVerseKey: string | null;
  syncMode: boolean;
  selectedEdition: Edition | null;
  editions: Edition[];
  currentAyahs: AyahAudio[];
  currentAyahIndex: number;
  reciters: Reciter[];
  setSyncMode: (v: boolean) => void;
  setSelectedEdition: (e: Edition | null) => void;
  playSurah: (surah: Surah, reciter: ReciterInfo, moshaf: MoshafInfo, resumeTime?: number) => void;
  playAyah: (surahId: number, ayahNumber: number, juzId?: number) => void;
  skipNextAyah: () => void;
  skipPrevAyah: () => void;
  playJuz: (juzId: number) => void;
  playPlaylistQueue: (tracks: PlaylistTrackGlobal[], name: string, startIndex?: number) => void;
  togglePlay: () => void;
  playNextSurah: () => void;
  playPrevSurah: () => void;
  handleSeek: (val: number[]) => void;
  handleVolume: (val: number[]) => void;
  toggleMute: () => void;
  setIsRepeat: (v: boolean) => void;
  setIsShuffle: (v: boolean) => void;
  setPlayerMinimized: (v: boolean) => void;
  stopPlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
};

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { addAyahRead } = useUser();
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>(() => {
    const saved = localStorage.getItem("quran-repeat-mode");
    if (saved === 'all' || saved === 'one') return saved;
    // Backward compatibility
    return localStorage.getItem("quran-is-repeat") === "true" ? 'one' : 'none';
  });
  const [isShuffle, setIsShuffle] = useState(() => localStorage.getItem("quran-is-shuffle") === "true");
  const [audioLoading, setAudioLoading] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(true);
  const [selectedReciterName, setSelectedReciterName] = useState("");
  const [playlistQueue, setPlaylistQueue] = useState<PlaylistTrackGlobal[]>([]);
  const [playlistQueueIndex, setPlaylistQueueIndex] = useState(-1);
  const [activePlaylistName, setActivePlaylistName] = useState("");
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState(() => localStorage.getItem("quran-sync-mode") === "true");
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(() => {
    const saved = localStorage.getItem("quran-selected-edition");
    return saved ? JSON.parse(saved) : { identifier: "7", name: "العفاسي", englishName: "Alafasy", language: "ar", format: "audio", type: "versebyverse", direction: null };
  });
  const [editions, setEditions] = useState<Edition[]>([]);
  const [currentAyahs, setCurrentAyahs] = useState<AyahAudio[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const [currentJuzId, setCurrentJuzId] = useState<number | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);

  // Store current moshaf info for next/prev
  const currentMoshafRef = useRef<MoshafInfo | null>(null);
  const currentReciterRef = useRef<ReciterInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const playlistQueueRef = useRef(playlistQueue);
  const playlistQueueIndexRef = useRef(playlistQueueIndex);
  const syncModeRef = useRef(syncMode);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const playSurahInternalRef = useRef<((surah: Surah, server: string, resumeTime?: number, forceRegularMode?: boolean) => Promise<void>) | null>(null);
  const playNextSurahInternalRef = useRef<(() => void) | null>(null);
  const playPrevSurahInternalRef = useRef<(() => void) | null>(null);
  const playAyahInternalRef = useRef<((surahId: number, ayahIdx: number, ayahs: AyahAudio[]) => Promise<void>) | null>(null);
  const handleEndedRef = useRef<(() => void) | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const sourceRequestIdRef = useRef(0);

  const safePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        await promise;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Playback error:", error);
      }
    } finally {
      playPromiseRef.current = null;
    }
  }, []);

  const safePause = useCallback(async () => {
    if (!audioRef.current) return;
    // If a play is pending, we wait for it to resolve before pausing
    // to avoid "The play() request was interrupted by a call to pause()" error.
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch (e) {
        // Ignore errors from play promise
      }
    }
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const loadAndPlayAudioSource = useCallback(async (url: string, resumeTime?: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const sourceRequestId = sourceRequestIdRef.current + 1;
    sourceRequestIdRef.current = sourceRequestId;

    await safePause();

    if (sourceRequestIdRef.current !== sourceRequestId) return;
    setIsPlaying(false);
    setAudioLoading(true);
    setDuration(0);
    if (!resumeTime) setCurrentTime(0);

    // Fully detach any failed or half-open source before assigning the next
    // recitation. Without this reset, mobile browsers can keep the previous
    // network error attached to the media element and every later surah fails
    // until the page is refreshed.
    audio.removeAttribute("data-retried");
    audio.removeAttribute("src");
    audio.load();

    if (resumeTime && resumeTime > 0) {
      const onLoaded = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = resumeTime;
          audioRef.current.removeEventListener("loadedmetadata", onLoaded);
        }
      };
      audio.addEventListener("loadedmetadata", onLoaded);
    }

    audio.src = url;
    audio.load();
    safePlay();
  }, [safePause, safePlay]);

  useEffect(() => {
    localStorage.setItem("quran-repeat-mode", repeatMode);
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem("quran-is-shuffle", isShuffle.toString());
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  // Predictive Audio Pre-fetching
  useEffect(() => {
    if (currentAyahIndex >= 0 && currentAyahs.length > 0) {
      const nextIndices = [currentAyahIndex + 1, currentAyahIndex + 2];
      nextIndices.forEach(idx => {
        if (idx < currentAyahs.length) {
          const nextAyah = currentAyahs[idx];
          let nextUrl = nextAyah.audio;
          if (nextUrl) {
            if (nextUrl.startsWith("//")) nextUrl = "https:" + nextUrl;
            caches.open("quran-audio-cache").then(cache => {
              cache.match(nextUrl).then(match => {
                if (!match) {
                  fetch(nextUrl).then(res => {
                    if (res.ok) cache.put(nextUrl, res);
                  }).catch(() => {});
                }
              });
            });
          }
        }
      });
    }
  }, [currentAyahIndex, currentAyahs]);

  useEffect(() => { playlistQueueRef.current = playlistQueue; }, [playlistQueue]);
  useEffect(() => { playlistQueueIndexRef.current = playlistQueueIndex; }, [playlistQueueIndex]);
  useEffect(() => { syncModeRef.current = syncMode; }, [syncMode]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Initialize audio object once
  useEffect(() => {
    const audio = new Audio();
    // Remove crossOrigin = "anonymous" as it can cause issues with some servers
    // that don't support CORS correctly, and we don't need it for simple playback.
    audioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      if (syncModeRef.current) {
        // In sync mode, the ended event is handled by the specific listener in playAyahInternal
        return;
      }
      
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        safePlay();
      } else {
        playNextSurahInternalRef.current?.();
      }
    };
    const onError = () => {
      const audio = audioRef.current;
      if (audio && audio.error) {
        const failingUrl = audio.src;
        const errorCode = audio.error.code;
        const errorMessage = audio.error.message;
        
        console.error(`Audio Error [${errorCode}]: ${errorMessage} | URL: ${failingUrl}`);

        // One-time retry for format errors or network errors
        if ((errorCode === 4 || errorCode === 2) && !audio.getAttribute("data-retried")) {
          console.log(`Attempting one-time recovery for error ${errorCode}...`);
          audio.setAttribute("data-retried", "true");
          
          // Thorough reset
          const currentSrc = audio.src;
          audio.src = "";
          audio.load();
          
          const retryRequestId = sourceRequestIdRef.current;
          setTimeout(() => {
            if (audioRef.current && sourceRequestIdRef.current === retryRequestId) {
              audioRef.current.src = currentSrc;
              audioRef.current.load();
              safePlay();
            }
          }, 500);
          return;
        }

        let message = "خطأ في تشغيل الصوت";
        switch (errorCode) {
          case 1: return; // Aborted
          case 2: message = "خطأ في الشبكة. تحقق من اتصالك بالإنترنت."; break;
          case 3: message = "خطأ في فك تشفير الملف. قد يكون الرابط تالفاً."; break;
          case 4: message = "رابط الصوت غير مدعوم أو غير موجود حالياً."; break;
        }
        
        toast.error(message, {
          description: `المصدر: ${failingUrl.split('/').slice(0, 3).join('/')}...`,
          action: {
            label: "محاولة أخرى",
            onClick: () => {
              audio.removeAttribute("data-retried");
              audio.load();
              safePlay();
            }
          }
        });
      }
      setAudioLoading(false);
    };
    const onPlay = () => {
      setIsPlaying(true);
      if (Capacitor.isNativePlatform()) {
        import('@capgo/capacitor-media-session').then(({ MediaSession }) => {
          MediaSession.setPlaybackState({ playbackState: 'playing' });
        }).catch(() => {});
      }
    };
    const onPause = () => {
      setIsPlaying(false);
      if (Capacitor.isNativePlatform()) {
        import('@capgo/capacitor-media-session').then(({ MediaSession }) => {
          MediaSession.setPlaybackState({ playbackState: 'paused' });
        }).catch(() => {});
      }
    };
    const onLoadStart = () => setAudioLoading(true);
    const onCanPlay = () => setAudioLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      safePause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getAvailableSurahs = useCallback((): Surah[] => {
    if (!currentMoshafRef.current) return [];
    const ids = currentMoshafRef.current.surah_list.split(",").map(Number);
    return SURAHS.filter(s => ids.includes(s.id));
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-sync-mode", syncMode.toString());
  }, [syncMode]);

  const handleEnded = useCallback(() => {
    if (repeatModeRef.current === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      safePlay();
      return;
    }
    playNextSurahInternalRef.current?.();
  }, [safePlay]);

  const playNextSurahInternal = useCallback(() => {
    const queue = playlistQueueRef.current;
    const qIdx = playlistQueueIndexRef.current;
    if (queue.length > 0 && qIdx >= 0) {
      const nextIdx = qIdx + 1;
      if (nextIdx < queue.length) {
        setPlaylistQueueIndex(nextIdx);
        const track = queue[nextIdx];
        const surah = SURAHS.find(s => s.id === track.surahId);
        if (surah) {
          setSelectedReciterName(track.reciterName);
          currentReciterRef.current = { id: track.reciterId, name: track.reciterName };
          playSurahInternalRef.current?.(surah, track.moshafServer);
        }
      }
      return;
    }
    const available = getAvailableSurahs();
    const cur = currentSurah;
    if (!cur || available.length === 0) return;
    if (isShuffleRef.current) {
      const rand = available[Math.floor(Math.random() * available.length)];
      playSurahInternalRef.current?.(rand, currentMoshafRef.current!.server);
      return;
    }
    const idx = available.findIndex(s => s.id === cur.id);
    if (idx < available.length - 1) {
      playSurahInternalRef.current?.(available[idx + 1], currentMoshafRef.current!.server);
    } else if (repeatModeRef.current === 'all' && available.length > 0) {
      // Loop back to start
      playSurahInternalRef.current?.(available[0], currentMoshafRef.current!.server);
    }
  }, [currentSurah, getAvailableSurahs]);

  const playPrevSurahInternal = useCallback(() => {
    const queue = playlistQueueRef.current;
    const qIdx = playlistQueueIndexRef.current;
    if (queue.length > 0 && qIdx >= 0) {
      const prevIdx = qIdx - 1;
      if (prevIdx >= 0) {
        setPlaylistQueueIndex(prevIdx);
        const track = queue[prevIdx];
        const surah = SURAHS.find(s => s.id === track.surahId);
        if (surah) {
          setSelectedReciterName(track.reciterName);
          currentReciterRef.current = { id: track.reciterId, name: track.reciterName };
          playSurahInternalRef.current?.(surah, track.moshafServer);
        }
      }
      return;
    }
    const available = getAvailableSurahs();
    const cur = currentSurah;
    if (!cur || available.length === 0) return;
    const idx = available.findIndex(s => s.id === cur.id);
    if (idx > 0) playSurahInternalRef.current?.(available[idx - 1], currentMoshafRef.current!.server);
  }, [currentSurah, getAvailableSurahs]);

  useEffect(() => {
    fetchAudioEditions().then(setEditions).catch(console.error);
    fetchReciters().then(setReciters).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedEdition) {
      localStorage.setItem("quran-selected-edition", JSON.stringify(selectedEdition));
    }
  }, [selectedEdition]);

  const ayahEndedListenerRef = useRef<(() => void) | null>(null);

  const playAyahInternal = useCallback(async (surahId: number, ayahIdx: number, ayahs: AyahAudio[]) => {
    if (!audioRef.current || ayahIdx < 0 || ayahIdx >= ayahs.length) return;
    
    // Clean up previous ayah listener
    if (ayahEndedListenerRef.current) {
      audioRef.current.removeEventListener("ended", ayahEndedListenerRef.current);
    }

    const ayah = ayahs[ayahIdx];
    setCurrentAyahIndex(ayahIdx);
    
    // Extract actual surahId from verse key if playing across surahs (e.g. in a Juz)
    const verseKey = ayah.number.toString();
    const actualSurahId = parseInt(verseKey.split(':')[0]);
    
    if (currentSurah?.id !== actualSurahId) {
      const newSurah = SURAHS.find(s => s.id === actualSurahId);
      if (newSurah) setCurrentSurah(newSurah);
    }
    
    setCurrentVerseKey(verseKey);
    
    let url = ayah.audio;
    if (!url) {
      toast.error("رابط الصوت غير متوفر لهذه الآية");
      return;
    }

    if (url.startsWith("//")) {
      url = "https:" + url;
    }
    
    loadAndPlayAudioSource(url);
    
    // Track points/stats only for actual verse playback
    const isRegularVerse = url && !url.includes("bismillah");
    
    const onAyahEnd = () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", onAyahEnd);
      }
      
      // Increment stats
      if (isRegularVerse) {
        addAyahRead();
      }
      if (repeatModeRef.current === 'one') {
        playAyahInternalRef.current?.(surahId, ayahIdx, ayahs);
      } else if (ayahIdx < ayahs.length - 1) {
        playAyahInternalRef.current?.(surahId, ayahIdx + 1, ayahs);
      } else if (repeatModeRef.current === 'all' && ayahs.length > 0) {
        // Loop back to start of ayah list (surah or juz)
        playAyahInternalRef.current?.(surahId, 0, ayahs);
      } else {
        // End of current list
        playNextSurahInternalRef.current?.();
      }
    };
    
    ayahEndedListenerRef.current = onAyahEnd;
    audioRef.current.addEventListener("ended", onAyahEnd);
  }, [safePlay, currentSurah]);

  const playSurahInternal = useCallback(async (surah: Surah, server: string, resumeTime?: number, forceRegularMode = false) => {
    if (!audioRef.current) return;
    
    setCurrentSurah(surah);
    setAudioLoading(true);
    
    if (!forceRegularMode && syncModeRef.current && selectedEdition) {
      try {
        const data = await fetchChapterAudio(surah.id, selectedEdition.identifier);
        if (data && data.audio_files) {
          const ayahs = data.audio_files.map((v: any) => ({
            number: v.verse_key,
            numberInSurah: parseInt(v.verse_key.split(':')[1]),
            text: "", // We don't necessarily need text here
            audio: v.url.startsWith('http') ? v.url : `https://verses.quran.com/${v.url}`
          })) as AyahAudio[];
          setCurrentAyahs(ayahs);
          playAyahInternalRef.current?.(surah.id, 0, ayahs);
          return;
        }
      } catch (error) {
        console.error("Sync mode error:", error);
      }
    }

    // Clear any active sync mode listeners and state when switching to full surah playback
    if (ayahEndedListenerRef.current) {
      audioRef.current.removeEventListener("ended", ayahEndedListenerRef.current);
      ayahEndedListenerRef.current = null;
    }
    setCurrentAyahs([]);
    setCurrentAyahIndex(-1);
    setCurrentVerseKey(null);

    const url = getAudioUrl(server, surah.id);
    loadAndPlayAudioSource(url, resumeTime);
  }, [loadAndPlayAudioSource, selectedEdition]);

  playSurahInternalRef.current = playSurahInternal;
  playNextSurahInternalRef.current = playNextSurahInternal;
  playPrevSurahInternalRef.current = playPrevSurahInternal;
  playAyahInternalRef.current = playAyahInternal;
  handleEndedRef.current = handleEnded;

  // Save last played periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (audioRef.current && currentSurah && currentReciterRef.current && currentMoshafRef.current) {
        const data: LastPlayed = {
          reciterId: currentReciterRef.current.id,
          reciterName: currentReciterRef.current.name,
          moshafId: currentMoshafRef.current.id,
          moshafName: currentMoshafRef.current.name,
          moshafServer: currentMoshafRef.current.server,
          surahId: currentSurah.id,
          surahName: currentSurah.name,
          currentTime: audioRef.current.currentTime,
          surahList: currentMoshafRef.current.surah_list,
        };
        localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(data));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [currentSurah]);

  // Effect to handle switching edition or sync mode while playing
  useEffect(() => {
    if (isPlaying && currentSurah) {
      // If we are playing, and the mode or edition changes, we should restart the current surah/ayah in the new mode
      // Only switch if the internal state (currentAyahs) doesn't match the new syncMode
      if (syncMode && currentAyahs.length === 0) {
        // If switching to sync mode, start from the current ayah index if possible
        const targetAyah = currentAyahIndex >= 0 && currentAyahs[currentAyahIndex] 
          ? currentAyahs[currentAyahIndex].numberInSurah 
          : 1;
        playAyah(currentSurah.id, targetAyah);
      } else if (!syncMode && currentAyahs.length > 0 && currentMoshafRef.current) {
        // If switching to full surah mode, resume from current time
        playSurahInternalRef.current?.(currentSurah, currentMoshafRef.current.server, currentTime);
      }
    }
  }, [selectedEdition?.identifier, syncMode]);

  // MediaSession API for lock screen controls
  useEffect(() => {
    if (!currentSurah) return;
    
    const setupMediaSession = async () => {
      const metadata = {
        title: `سورة ${currentSurah.name}`,
        artist: selectedReciterName || t("player.reciter") || "القارئ",
        album: t("common.quran") || "القرآن الكريم",
        artwork: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
        ]
      };

      const playHandler = () => { safePlay(); setIsPlaying(true); };
      const pauseHandler = () => { safePause(); setIsPlaying(false); };
      const prevHandler = () => playPrevSurahInternalRef.current?.();
      const nextHandler = () => playNextSurahInternalRef.current?.();
      const stopHandler = () => handleEndedRef.current?.();

      if (Capacitor.isNativePlatform()) {
        try {
          const { MediaSession } = await import('@capgo/capacitor-media-session');
          await MediaSession.setMetadata(metadata);
          
          MediaSession.setActionHandler({ action: 'play' }, playHandler);
          MediaSession.setActionHandler({ action: 'pause' }, pauseHandler);
          MediaSession.setActionHandler({ action: 'previoustrack' }, prevHandler);
          MediaSession.setActionHandler({ action: 'nexttrack' }, nextHandler);
          MediaSession.setActionHandler({ action: 'stop' }, stopHandler);
        } catch(e) {
          console.warn("Capacitor MediaSession failed", e);
        }
      } else if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata(metadata);
        
        navigator.mediaSession.setActionHandler('play', playHandler);
        navigator.mediaSession.setActionHandler('pause', pauseHandler);
        navigator.mediaSession.setActionHandler('previoustrack', prevHandler);
        navigator.mediaSession.setActionHandler('nexttrack', nextHandler);
        try {
          navigator.mediaSession.setActionHandler('stop', stopHandler);
        } catch(e) {}
      }
    };

    setupMediaSession();

    return () => {
      if (Capacitor.isNativePlatform()) {
        import('@capgo/capacitor-media-session').then(({ MediaSession }) => {
          MediaSession.setActionHandler({ action: 'play' }, null);
          MediaSession.setActionHandler({ action: 'pause' }, null);
          MediaSession.setActionHandler({ action: 'previoustrack' }, null);
          MediaSession.setActionHandler({ action: 'nexttrack' }, null);
          MediaSession.setActionHandler({ action: 'stop' }, null);
        }).catch(() => {});
      } else if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        try { navigator.mediaSession.setActionHandler('stop', null); } catch(e) {}
      }
    };
  }, [currentSurah, selectedReciterName, safePause, safePlay, t]);

  const playSurah = useCallback((surah: Surah, reciter: ReciterInfo, moshaf: MoshafInfo, resumeTime?: number) => {
    currentReciterRef.current = reciter;
    currentMoshafRef.current = moshaf;
    setSelectedReciterName(reciter.name);
    setPlaylistQueue([]);
    setPlaylistQueueIndex(-1);
    setActivePlaylistName("");
    // When playing a full surah from a specific reciter, we should disable sync mode
    // unless the user explicitly wants it. This ensures we use the selected reciter's server.
    setSyncMode(false);
    syncModeRef.current = false; // Update Ref immediately to avoid race conditions in playSurahInternal
    if (!resumeTime) setCurrentTime(0); // Reset time if not resuming
    playSurahInternalRef.current?.(surah, moshaf.server, resumeTime, true);
  }, []);

  const playPlaylistQueue = useCallback((tracks: PlaylistTrackGlobal[], name: string, startIndex = 0) => {
    if (tracks.length === 0) return;
    setPlaylistQueue(tracks);
    setPlaylistQueueIndex(startIndex);
    setActivePlaylistName(name);
    const track = tracks[startIndex];
    currentReciterRef.current = { id: track.reciterId, name: track.reciterName };
    currentMoshafRef.current = { id: track.moshafId, name: "", server: track.moshafServer, surah_list: "" };
    setSelectedReciterName(track.reciterName);
    const surah = SURAHS.find(s => s.id === track.surahId);
    if (surah) playSurahInternalRef.current?.(surah, track.moshafServer);
  }, []);

  const playAyah = useCallback(async (surahId: number, ayahNumber: number, juzId?: number) => {
    const edition = selectedEdition || { identifier: "7", name: "العفاسي", englishName: "Alafasy", language: "ar", format: "audio", type: "versebyverse", direction: null };
    if (!selectedEdition) setSelectedEdition(edition);
    setSelectedReciterName(edition.name);

    if (audioRef.current) audioRef.current.pause();
    
    setSyncMode(true);
    setAudioLoading(true);
    setCurrentJuzId(juzId || null);

    try {
      const { fetchChapterAudio, fetchJuzAudio } = await import("@/services/quranService");
      
      const data = juzId 
        ? await fetchJuzAudio(juzId, edition.identifier)
        : await fetchChapterAudio(surahId, edition.identifier);

      if (data && data.audio_files) {
        const ayahs = data.audio_files.map((v: any) => ({
          number: v.verse_key,
          numberInSurah: parseInt(v.verse_key.split(':')[1]),
          text: "",
          audio: v.url.startsWith('http') ? v.url : `https://verses.quran.com/${v.url}`
        })) as AyahAudio[];
        
        setCurrentAyahs(ayahs);
        const surah = SURAHS.find(s => s.id === surahId);
        if (surah) setCurrentSurah(surah);
        
        const idx = ayahs.findIndex((a: AyahAudio) => {
          if (juzId) {
            const [sId, aNum] = a.number.toString().split(':').map(Number);
            return sId === surahId && aNum === ayahNumber;
          }
          return a.numberInSurah === ayahNumber;
        });

        if (idx !== -1) {
          playAyahInternalRef.current?.(surahId, idx, ayahs);
        } else {
          playAyahInternalRef.current?.(surahId, 0, ayahs);
        }
      }
    } catch (error) {
      console.error("Play ayah error:", error);
    } finally {
      setAudioLoading(false);
    }
  }, [selectedEdition]);

  const playJuz = useCallback(async (juzId: number) => {
    if (!selectedEdition) return;
    setSyncMode(true);
    setAudioLoading(true);
    setCurrentJuzId(juzId);
    try {
      const { fetchJuzAudio } = await import("@/services/quranService");
      const data = await fetchJuzAudio(juzId, selectedEdition.identifier);
      if (data && data.audio_files) {
        const ayahs = data.audio_files.map((v: any) => ({
          number: v.verse_key,
          numberInSurah: parseInt(v.verse_key.split(':')[1]),
          text: "",
          audio: v.url.startsWith('http') ? v.url : `https://verses.quran.com/${v.url}`
        })) as AyahAudio[];
        setCurrentAyahs(ayahs);
        // Start from the first ayah of the Juz
        const firstVerseKey = ayahs[0].number.toString();
        const firstSurahId = parseInt(firstVerseKey.split(':')[0]);
        const surah = SURAHS.find(s => s.id === firstSurahId);
        if (surah) setCurrentSurah(surah);
        playAyahInternalRef.current?.(firstSurahId, 0, ayahs);
      }
    } catch (error) {
      console.error("Play Juz error:", error);
    } finally {
      setAudioLoading(false);
    }
  }, [selectedEdition]);

  const skipNextAyah = useCallback(() => {
    if (currentSurah && currentAyahs.length > 0 && currentAyahIndex < currentAyahs.length - 1) {
      playAyahInternalRef.current?.(currentSurah.id, currentAyahIndex + 1, currentAyahs);
    } else {
      playNextSurahInternalRef.current?.();
    }
  }, [currentSurah, currentAyahs, currentAyahIndex]);

  const skipPrevAyah = useCallback(() => {
    if (currentSurah && currentAyahs.length > 0 && currentAyahIndex > 0) {
      playAyahInternalRef.current?.(currentSurah.id, currentAyahIndex - 1, currentAyahs);
    } else {
      playPrevSurahInternalRef.current?.();
    }
  }, [currentSurah, currentAyahs, currentAyahIndex]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { safePause(); setIsPlaying(false); }
    else { safePlay(); setIsPlaying(true); }
  }, [isPlaying, safePlay, safePause]);

  const handleSeek = useCallback((val: number[]) => {
    if (audioRef.current) { audioRef.current.currentTime = val[0]; setCurrentTime(val[0]); }
  }, []);

  const handleVolume = useCallback((val: number[]) => {
    setVolume(val[0]);
    setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = val[0] / 100;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      if (audioRef.current) audioRef.current.volume = m ? volume / 100 : 0;
      return !m;
    });
  }, [volume]);

  const stopPlayer = useCallback(() => {
    if (audioRef.current) { 
      safePause(); 
      // Clean up sync mode listeners
      if (ayahEndedListenerRef.current) {
        audioRef.current.removeEventListener("ended", ayahEndedListenerRef.current);
        ayahEndedListenerRef.current = null;
      }
    }
    setCurrentSurah(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentAyahs([]);
    setCurrentAyahIndex(-1);
    setCurrentVerseKey(null);
  }, [safePause]);

  return (
    <AudioPlayerContext.Provider value={{
      currentSurah, isPlaying, currentTime, duration, volume, isMuted,
      repeatMode, isShuffle, audioLoading, playerMinimized, selectedReciterName,
      playlistQueue, playlistQueueIndex, activePlaylistName, currentVerseKey,
      syncMode, setSyncMode, selectedEdition, setSelectedEdition, editions,
      currentAyahs, currentAyahIndex, reciters,
      playSurah, playPlaylistQueue, togglePlay, playNextSurah: playNextSurahInternal,
      playPrevSurah: playPrevSurahInternal, handleSeek, handleVolume, toggleMute,
      setRepeatMode, setIsShuffle, setPlayerMinimized, stopPlayer,
      playAyah, skipNextAyah, skipPrevAyah, playJuz
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
