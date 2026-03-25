import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";

interface Surah {
  id: number;
  name: string;
}

interface ReciterInfo {
  id: number;
  name: string;
}

interface MoshafInfo {
  id: number;
  name: string;
  server: string;
  surah_list: string;
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

const SURAHS: Surah[] = [
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
  const padded = String(surahId ?? "").padStart(3, "0");
  // Force https if server starts with http:// to avoid mixed content issues
  let httpsServer = server.startsWith("http://") ? server.replace("http://", "https://") : server;
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
  playSurah: (surah: Surah, reciter: ReciterInfo, moshaf: MoshafInfo, resumeTime?: number) => void;
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
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const [selectedReciterName, setSelectedReciterName] = useState("");
  const [playlistQueue, setPlaylistQueue] = useState<PlaylistTrackGlobal[]>([]);
  const [playlistQueueIndex, setPlaylistQueueIndex] = useState(-1);
  const [activePlaylistName, setActivePlaylistName] = useState("");

  // Store current moshaf info for next/prev
  const currentMoshafRef = useRef<MoshafInfo | null>(null);
  const currentReciterRef = useRef<ReciterInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRepeatRef = useRef(isRepeat);
  const isShuffleRef = useRef(isShuffle);
  const playlistQueueRef = useRef(playlistQueue);
  const playlistQueueIndexRef = useRef(playlistQueueIndex);
  const playSurahInternalRef = useRef<((surah: Surah, server: string, resumeTime?: number) => void) | null>(null);
  const playNextSurahInternalRef = useRef<(() => void) | null>(null);
  const handleEndedRef = useRef<(() => void) | null>(null);

  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { playlistQueueRef.current = playlistQueue; }, [playlistQueue]);
  useEffect(() => { playlistQueueIndexRef.current = playlistQueueIndex; }, [playlistQueueIndex]);

  const getAvailableSurahs = useCallback((): Surah[] => {
    if (!currentMoshafRef.current) return [];
    const ids = currentMoshafRef.current.surah_list.split(",").map(Number);
    return SURAHS.filter(s => ids.includes(s.id));
  }, []);

  const playSurahInternal = useCallback((surah: Surah, server: string, resumeTime?: number) => {
    setCurrentSurah(surah);
    setAudioLoading(true);
    const url = getAudioUrl(server, surah.id);
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume / 100;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setAudioLoading(false);
      if (resumeTime && resumeTime > 0) audio.currentTime = resumeTime;
    });
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => handleEndedRef.current?.());
    audio.addEventListener("error", () => setAudioLoading(false));
    audio.play().then(() => setIsPlaying(true)).catch(() => setAudioLoading(false));
  }, [isMuted, volume]);

  const handleEnded = useCallback(() => {
    if (isRepeatRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    playNextSurahInternalRef.current?.();
  }, []);

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

  playSurahInternalRef.current = playSurahInternal;
  playNextSurahInternalRef.current = playNextSurahInternal;
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
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('previoustrack', playPrevSurahInternal);
    navigator.mediaSession.setActionHandler('nexttrack', playNextSurahInternal);
  }, [currentSurah, selectedReciterName, playNextSurahInternal, playPrevSurahInternal, setIsPlaying]);

  const playSurah = useCallback((surah: Surah, reciter: ReciterInfo, moshaf: MoshafInfo, resumeTime?: number) => {
    currentReciterRef.current = reciter;
    currentMoshafRef.current = moshaf;
    setSelectedReciterName(reciter.name);
    setPlaylistQueue([]);
    setPlaylistQueueIndex(-1);
    setActivePlaylistName("");
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

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }, [isPlaying]);

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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setCurrentSurah(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <AudioPlayerContext.Provider value={{
      currentSurah, isPlaying, currentTime, duration, volume, isMuted,
      isRepeat, isShuffle, audioLoading, playerMinimized, selectedReciterName,
      playlistQueue, playlistQueueIndex, activePlaylistName,
      playSurah, playPlaylistQueue, togglePlay, playNextSurah: playNextSurahInternal,
      playPrevSurah: playPrevSurahInternal, handleSeek, handleVolume, toggleMute,
      setIsRepeat, setIsShuffle, setPlayerMinimized, stopPlayer,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
