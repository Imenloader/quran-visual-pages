import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { fetchWithCache } from "@/lib/apiClient";
import { fetchAudioEditions, type Edition } from "@/services/quranService";
import { toast } from "sonner";

export interface Surah {
  id: number;
  name: string;
}

export interface ReciterInfo {
  id: number;
  name: string;
}

export interface MoshafInfo {
  id: number;
  name: string;
  server: string;
  surah_list: string;
}

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

export interface PlaylistTrackGlobal {
  surahId: number;
  surahName: string;
  reciterId: number;
  reciterName: string;
  moshafId: number;
  moshafServer: string;
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

export const SURAHS: Surah[] = [
  { id: 1, name: "الفاتحة" }, { id: 2, name: "البقرة" }, { id: 3, name: "آل عمران" },
  { id: 4, name: "النساء" }, { id: 5, name: "المائدة" }, { id: 6, name: "الأنعام" },
  { id: 7, name: "الأعراف" }, { id: 8, name: "الأنفال" }, { id: 9, name: "التوبة" },
  { id: 10, name: "يونس" }, { id: 11, name: "هود" }, { id: 12, name: "يوسف" },
  { id: 13, name: "الرعد" }, { id: 14, name: "إبراهيم" }, { id: 15, name: "الحجر" },
  { id: 16, name: "النحل" }, { id: 17, name: "الإسراء" }, { id: 18, name: "الكهف" },
  { id: 19, name: "مريم" }, { id: 20, name: "طه" }, { id: 21, name: "الأنبياء" },
  { id: 22, name: "الحج" }, { id: 23, name: "المؤمنون" }, { id: 24, name: "النور" },
  { id: 25, name: "الفرقان" }, { id: 26, name: "الشعراء" }, { id: 27, name: "النمل" },
  { id: 28, name: "القصص" }, { id: 29, name: "العنكبوت" }, { id: 30, name: "الروم" },
  { id: 31, name: "لقمان" }, { id: 32, name: "السجدة" }, { id: 33, name: "الأحزاب" },
  { id: 34, name: "سبأ" }, { id: 35, name: "فاطر" }, { id: 36, name: "يس" },
  { id: 37, name: "الصافات" }, { id: 38, name: "ص" }, { id: 39, name: "الزمر" },
  { id: 40, name: "غافر" }, { id: 41, name: "فصلت" }, { id: 42, name: "الشورى" },
  { id: 43, name: "الزخرف" }, { id: 44, name: "الدخان" }, { id: 45, name: "الجاثية" },
  { id: 46, name: "الأحقاف" }, { id: 47, name: "محمد" }, { id: 48, name: "الفتح" },
  { id: 49, name: "الحجرات" }, { id: 50, name: "ق" }, { id: 51, name: "الذاريات" },
  { id: 52, name: "الطور" }, { id: 53, name: "النجم" }, { id: 54, name: "القمر" },
  { id: 55, name: "الرحمن" }, { id: 56, name: "الواقعة" }, { id: 57, name: "الحديد" },
  { id: 58, name: "المجادلة" }, { id: 59, name: "الحشر" }, { id: 60, name: "الممتحنة" },
  { id: 61, name: "الصف" }, { id: 62, name: "الجمعة" }, { id: 63, name: "المنافقون" },
  { id: 64, name: "التغابن" }, { id: 65, name: "الطلاق" }, { id: 66, name: "التحريم" },
  { id: 67, name: "الملك" }, { id: 68, name: "القلم" }, { id: 69, name: "الحاقة" },
  { id: 70, name: "المعارج" }, { id: 71, name: "نوح" }, { id: 72, name: "الجن" },
  { id: 73, name: "المزمل" }, { id: 74, name: "المدثر" }, { id: 75, name: "القيامة" },
  { id: 76, name: "الإنسان" }, { id: 77, name: "المرسلات" }, { id: 78, name: "النبأ" },
  { id: 79, name: "النازعات" }, { id: 80, name: "عبس" }, { id: 81, name: "التكوير" },
  { id: 82, name: "الانفطار" }, { id: 83, name: "المطففين" }, { id: 84, name: "الانشقاق" },
  { id: 85, name: "البروج" }, { id: 86, name: "الطارق" }, { id: 87, name: "الأعلى" },
  { id: 88, name: "الغاشية" }, { id: 89, name: "الفجر" }, { id: 90, name: "البلد" },
  { id: 91, name: "الشمس" }, { id: 92, name: "الليل" }, { id: 93, name: "الضحى" },
  { id: 94, name: "الشرح" }, { id: 95, name: "التين" }, { id: 96, name: "العلق" },
  { id: 97, name: "القدر" }, { id: 98, name: "البينة" }, { id: 99, name: "الزلزلة" },
  { id: 100, name: "العاديات" }, { id: 101, name: "القارعة" }, { id: 102, name: "التكاثر" },
  { id: 103, name: "العصر" }, { id: 104, name: "الهمزة" }, { id: 105, name: "الفيل" },
  { id: 106, name: "قريش" }, { id: 107, name: "الماعون" }, { id: 108, name: "الكوثر" },
  { id: 109, name: "الكافرون" }, { id: 110, name: "النصر" }, { id: 111, name: "المسد" },
  { id: 112, name: "الإخلاص" }, { id: 113, name: "الفلق" }, { id: 114, name: "الناس" },
];

const LAST_PLAYED_KEY = "quran-last-played";

const getAudioUrl = (server: string, surahId: number | string | undefined | null): string => {
  if (!server) return "";
  const padded = String(surahId ?? "").padStart(3, "0");
  
  // Clean the server URL
  let httpsServer = server.trim();
  
  // Relax https force if user is having SSL issues
  if (httpsServer.startsWith("//")) {
    httpsServer = "https:" + httpsServer;
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
  setSyncMode: (v: boolean) => void;
  setSelectedEdition: (e: Edition | null) => void;
  playSurah: (surah: Surah, reciter: ReciterInfo, moshaf: MoshafInfo, resumeTime?: number) => void;
  playAyah: (surahId: number, ayahNumber: number) => void;
  skipNextAyah: () => void;
  skipPrevAyah: () => void;
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
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(() => localStorage.getItem("quran-is-repeat") === "true");
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
    return saved ? JSON.parse(saved) : { identifier: "ar.alafasy", name: "العفاسي", englishName: "Alafasy", language: "ar", format: "audio", type: "versebyverse", direction: null };
  });
  const [editions, setEditions] = useState<Edition[]>([]);
  const [currentAyahs, setCurrentAyahs] = useState<AyahAudio[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);

  // Store current moshaf info for next/prev
  const currentMoshafRef = useRef<MoshafInfo | null>(null);
  const currentReciterRef = useRef<ReciterInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRepeatRef = useRef(isRepeat);
  const isShuffleRef = useRef(isShuffle);
  const playlistQueueRef = useRef(playlistQueue);
  const playlistQueueIndexRef = useRef(playlistQueueIndex);
  const syncModeRef = useRef(syncMode);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const playSurahInternalRef = useRef<((surah: Surah, server: string, resumeTime?: number) => Promise<void>) | null>(null);
  const playNextSurahInternalRef = useRef<(() => void) | null>(null);
  const playPrevSurahInternalRef = useRef<(() => void) | null>(null);
  const playAyahInternalRef = useRef<((surahId: number, ayahIdx: number, ayahs: AyahAudio[]) => Promise<void>) | null>(null);
  const handleEndedRef = useRef<(() => void) | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

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
    audioRef.current.pause();
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-is-repeat", isRepeat.toString());
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    localStorage.setItem("quran-is-shuffle", isShuffle.toString());
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

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
      
      if (isRepeatRef.current) {
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
          
          setTimeout(() => {
            if (audioRef.current) {
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
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
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
    if (isRepeatRef.current && audioRef.current) {
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
    if (idx < available.length - 1) playSurahInternalRef.current?.(available[idx + 1], currentMoshafRef.current!.server);
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
    setCurrentVerseKey(`${surahId}:${ayah.numberInSurah}`);
    
    let url = ayah.audio;
    if (!url) {
      toast.error("رابط الصوت غير متوفر لهذه الآية");
      return;
    }

    if (url.startsWith("//")) {
      url = "https:" + url;
    }
    
    audioRef.current.src = url;
    audioRef.current.removeAttribute("data-retried");
    audioRef.current.load();
    safePlay();
    
    const onAyahEnd = () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", onAyahEnd);
      }
      if (isRepeatRef.current) {
        playAyahInternalRef.current?.(surahId, ayahIdx, ayahs);
      } else {
        playAyahInternalRef.current?.(surahId, ayahIdx + 1, ayahs);
      }
    };
    
    ayahEndedListenerRef.current = onAyahEnd;
    audioRef.current.addEventListener("ended", onAyahEnd);
  }, [safePlay]);

  const playSurahInternal = useCallback(async (surah: Surah, server: string, resumeTime?: number) => {
    if (!audioRef.current) return;
    
    setCurrentSurah(surah);
    setAudioLoading(true);
    
    if (syncModeRef.current && selectedEdition) {
      try {
        const data = await fetchWithCache(`https://api.alquran.cloud/v1/surah/${surah.id}/${selectedEdition.identifier}?audio=1`, {});
        if (data.code === 200) {
          const ayahs = data.data.ayahs as AyahAudio[];
          setCurrentAyahs(ayahs);
          playAyahInternalRef.current?.(surah.id, 0, ayahs);
          return;
        }
      } catch (error) {
        console.error("Sync mode error:", error);
      }
    }

    const url = getAudioUrl(server, surah.id);
    audioRef.current.src = url;
    audioRef.current.removeAttribute("data-retried");
    audioRef.current.load();
    if (resumeTime && resumeTime > 0) {
      const onLoaded = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = resumeTime;
          audioRef.current.removeEventListener("loadedmetadata", onLoaded);
        }
      };
      audioRef.current.addEventListener("loadedmetadata", onLoaded);
    }
    safePlay();
  }, [safePlay, selectedEdition]);

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

  // MediaSession API for lock screen controls
  useEffect(() => {
    if (!currentSurah || !('mediaSession' in navigator)) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `سورة ${currentSurah.name}`,
      artist: selectedReciterName,
      album: "القرآن الكريم",
    });

    const playHandler = () => {
      safePlay();
      setIsPlaying(true);
    };
    const pauseHandler = () => {
      safePause();
      setIsPlaying(false);
    };
    const prevHandler = () => playPrevSurahInternalRef.current?.();
    const nextHandler = () => playNextSurahInternalRef.current?.();

    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler);
    navigator.mediaSession.setActionHandler('previoustrack', prevHandler);
    navigator.mediaSession.setActionHandler('nexttrack', nextHandler);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [currentSurah, selectedReciterName, safePause, safePlay]);

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
    playSurahInternalRef.current?.(surah, moshaf.server, resumeTime);
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

  const playAyah = useCallback(async (surahId: number, ayahNumber: number) => {
    if (!selectedEdition) return;
    
    setSyncMode(true);
    setAudioLoading(true);
    
    try {
      const data = await fetchWithCache(`https://api.alquran.cloud/v1/surah/${surahId}/${selectedEdition.identifier}?audio=1`, {});
      if (data.code === 200) {
        const ayahs = data.data.ayahs as AyahAudio[];
        setCurrentAyahs(ayahs);
        const surah = SURAHS.find(s => s.id === surahId);
        if (surah) setCurrentSurah(surah);
        
        const idx = ayahs.findIndex((a: AyahAudio) => a.numberInSurah === ayahNumber);
        if (idx !== -1) {
          playAyahInternalRef.current?.(surahId, idx, ayahs);
        }
      }
    } catch (error) {
      console.error("Play ayah error:", error);
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
    if (audioRef.current) { safePause(); }
    setCurrentSurah(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [safePause]);

  return (
    <AudioPlayerContext.Provider value={{
      currentSurah, isPlaying, currentTime, duration, volume, isMuted,
      isRepeat, isShuffle, audioLoading, playerMinimized, selectedReciterName,
      playlistQueue, playlistQueueIndex, activePlaylistName, currentVerseKey,
      syncMode, setSyncMode, selectedEdition, setSelectedEdition, editions,
      currentAyahs, currentAyahIndex,
      playSurah, playPlaylistQueue, togglePlay, playNextSurah: playNextSurahInternal,
      playPrevSurah: playPrevSurahInternal, handleSeek, handleVolume, toggleMute,
      setIsRepeat, setIsShuffle, setPlayerMinimized, stopPlayer,
      playAyah, skipNextAyah, skipPrevAyah,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
