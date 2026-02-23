import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Home, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Search, ChevronDown, Loader2, Music, Heart, ListMusic, X, Trash2, Clock, Download, Check, Square } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { Slider } from "@/components/ui/slider";

interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

interface Surah {
  id: number;
  name: string;
}

interface PlaylistItem {
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
const PLAYLIST_KEY = "quran-playlist";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "٠٠:٠٠";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getLastPlayed = (): LastPlayed | null => {
  try { return JSON.parse(localStorage.getItem(LAST_PLAYED_KEY) || "null"); } catch { return null; }
};

const getPlaylist = (): PlaylistItem[] => {
  try { return JSON.parse(localStorage.getItem(PLAYLIST_KEY) || "[]"); } catch { return []; }
};

const Recitations = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState<Moshaf | null>(null);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [dlState, setDlState] = useState<"idle" | "downloading" | "paused" | "done">("idle");
  const [dlProgress, setDlProgress] = useState(0);
  const dlAbortRef = useRef<AbortController | null>(null);
  const dlLoadedRef = useRef(0);
  const [cachedSurahs, setCachedSurahs] = useState<Set<number>>(new Set());
  const [isShuffle, setIsShuffle] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showReciters, setShowReciters] = useState(true);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(getPlaylist);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState<"reciters" | "playlist">("reciters");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Load reciters
  useEffect(() => {
    fetch("https://mp3quran.net/api/v3/reciters?language=ar")
      .then((res) => res.json())
      .then((data) => {
        setReciters(data.reciters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Restore last played on load
  useEffect(() => {
    const last = getLastPlayed();
    if (last && reciters.length > 0) {
      const reciter = reciters.find(r => r.id === last.reciterId);
      if (reciter) {
        setSelectedReciter(reciter);
        const moshaf = reciter.moshaf.find(m => m.id === last.moshafId);
        if (moshaf) {
          setSelectedMoshaf(moshaf);
          setShowReciters(false);
        }
      }
    }
  }, [reciters]);

  // Save current time periodically
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (audioRef.current && currentSurah && selectedReciter && selectedMoshaf) {
        const data: LastPlayed = {
          reciterId: selectedReciter.id,
          reciterName: selectedReciter.name,
          moshafId: selectedMoshaf.id,
          moshafName: selectedMoshaf.name,
          moshafServer: selectedMoshaf.server,
          surahId: currentSurah.id,
          surahName: currentSurah.name,
          currentTime: audioRef.current.currentTime,
          surahList: selectedMoshaf.surah_list,
        };
        localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(data));
      }
    }, 3000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, [currentSurah, selectedReciter, selectedMoshaf]);

  const getAvailableSurahs = useCallback((): Surah[] => {
    if (!selectedMoshaf) return [];
    const ids = selectedMoshaf.surah_list.split(",").map(Number);
    return SURAHS.filter((s) => ids.includes(s.id));
  }, [selectedMoshaf]);

  const getAudioUrl = (server: string, surahId: number): string => {
    const padded = surahId.toString().padStart(3, "0");
    return `${server}${padded}.mp3`;
  };

  const checkCachedSurahs = useCallback(async () => {
    if (!selectedMoshaf) return;
    const available = getAvailableSurahs();
    const cached = new Set<number>();
    try {
      const cache = await caches.open("workbox-runtime");
      for (const surah of available) {
        const url = getAudioUrl(selectedMoshaf.server, surah.id);
        const match = await cache.match(url);
        if (match) cached.add(surah.id);
      }
    } catch {
      // Cache API not available
    }
    setCachedSurahs(cached);
  }, [selectedMoshaf, getAvailableSurahs]);

  useEffect(() => {
    checkCachedSurahs();
  }, [checkCachedSurahs]);

  const playSurah = (surah: Surah, resumeTime?: number, server?: string) => {
    const srv = server || selectedMoshaf?.server;
    if (!srv) return;
    setCurrentSurah(surah);
    setAudioLoading(true);
    const url = getAudioUrl(srv, surah.id);

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume / 100;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setAudioLoading(false);
      if (resumeTime && resumeTime > 0) {
        audio.currentTime = resumeTime;
      }
    });
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", () => setAudioLoading(false));

    audio.play().then(() => setIsPlaying(true)).catch(() => setAudioLoading(false));
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    playNextSurah();
  };

  const playNextSurah = () => {
    const available = getAvailableSurahs();
    if (!currentSurah || available.length === 0) return;
    if (isShuffle) {
      const rand = available[Math.floor(Math.random() * available.length)];
      playSurah(rand);
      return;
    }
    const idx = available.findIndex((s) => s.id === currentSurah.id);
    if (idx < available.length - 1) playSurah(available[idx + 1]);
  };

  const playPrevSurah = () => {
    const available = getAvailableSurahs();
    if (!currentSurah || available.length === 0) return;
    const idx = available.findIndex((s) => s.id === currentSurah.id);
    if (idx > 0) playSurah(available[idx - 1]);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) { audioRef.current.currentTime = val[0]; setCurrentTime(val[0]); }
  };

  const handleVolume = (val: number[]) => {
    setVolume(val[0]);
    setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = val[0] / 100;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.volume = isMuted ? volume / 100 : 0;
  };

  const selectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    setSelectedMoshaf(reciter.moshaf[0] || null);
    setShowReciters(false);
  };

  // Playlist functions
  const addToPlaylist = (surah: Surah) => {
    if (!selectedReciter || !selectedMoshaf) return;
    const item: PlaylistItem = {
      surahId: surah.id,
      surahName: surah.name,
      reciterId: selectedReciter.id,
      reciterName: selectedReciter.name,
      moshafId: selectedMoshaf.id,
      moshafServer: selectedMoshaf.server,
    };
    const exists = playlist.some(p => p.surahId === surah.id && p.reciterId === selectedReciter.id && p.moshafId === selectedMoshaf.id);
    if (exists) return;
    const updated = [...playlist, item];
    setPlaylist(updated);
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updated));
  };

  const removeFromPlaylist = (index: number) => {
    const updated = playlist.filter((_, i) => i !== index);
    setPlaylist(updated);
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updated));
  };

  const playFromPlaylist = (item: PlaylistItem) => {
    const reciter = reciters.find(r => r.id === item.reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
      const moshaf = reciter.moshaf.find(m => m.id === item.moshafId);
      if (moshaf) setSelectedMoshaf(moshaf);
    }
    setShowPlaylist(false);
    setShowReciters(false);
    const surah = SURAHS.find(s => s.id === item.surahId);
    if (surah) playSurah(surah, undefined, item.moshafServer);
  };

  const isInPlaylist = (surahId: number) => {
    if (!selectedReciter || !selectedMoshaf) return false;
    return playlist.some(p => p.surahId === surahId && p.reciterId === selectedReciter.id && p.moshafId === selectedMoshaf.id);
  };

  const resumeLastPlayed = () => {
    const last = getLastPlayed();
    if (!last) return;
    const reciter = reciters.find(r => r.id === last.reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
      const moshaf = reciter.moshaf.find(m => m.id === last.moshafId);
      if (moshaf) {
        setSelectedMoshaf(moshaf);
        setShowReciters(false);
      }
    }
    const surah = SURAHS.find(s => s.id === last.surahId);
    if (surah) playSurah(surah, last.currentTime, last.moshafServer);
  };

  const downloadAllSurahs = async () => {
    if (!selectedMoshaf || dlState === "downloading") return;
    const available = getAvailableSurahs();
    const startFrom = dlLoadedRef.current;
    setDlState("downloading");
    const controller = new AbortController();
    dlAbortRef.current = controller;
    let loaded = startFrom;
    setDlProgress(Math.round((loaded / available.length) * 100));
    const batchSize = 3;
    try {
      for (let i = startFrom; i < available.length; i += batchSize) {
        if (controller.signal.aborted) break;
        const batch = available.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (surah) => {
            try {
              const url = getAudioUrl(selectedMoshaf.server, surah.id);
              const res = await fetch(url, { cache: "force-cache" });
              if (res.ok) await res.blob();
            } catch { /* skip */ }
            loaded++;
            dlLoadedRef.current = loaded;
            setDlProgress(Math.round((loaded / available.length) * 100));
          })
        );
      }
      if (!controller.signal.aborted) {
        setDlState("done");
        dlLoadedRef.current = 0;
        checkCachedSurahs();
        setTimeout(() => setDlState("idle"), 5000);
      }
    } catch { /* aborted */ }
  };

  const pauseDl = () => {
    dlAbortRef.current?.abort();
    setDlState("paused");
  };

  const cancelDl = () => {
    dlLoadedRef.current = 0;
    setDlProgress(0);
    setDlState("idle");
  };

  const filteredReciters = reciters.filter((r) => r.name.includes(searchQuery));
  const lastPlayed = getLastPlayed();

  // cleanup
  useEffect(() => {
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="flex justify-end items-center pt-3 pb-1">
          <button
            onClick={() => { setShowPlaylist(!showPlaylist); setActiveTab("playlist"); }}
            className="flex items-center gap-1.5 bg-white/10 text-primary-foreground px-3 py-2 rounded-lg hover:bg-white/20 transition-all font-naskh text-xs font-bold"
          >
            <ListMusic size={14} />
            قائمتي ({playlist.length})
          </button>
        </div>
        <div className="pb-6">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">سماع التلاوات</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">استمع لأشهر القراء والمشايخ</p>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-4">
        {/* Resume last played banner */}
        {lastPlayed && !currentSurah && (
          <button
            onClick={resumeLastPlayed}
            className="w-full mb-4 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-right hover:bg-primary/15 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full gradient-islamic flex items-center justify-center shrink-0">
              <Clock size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-naskh text-sm font-bold text-foreground">استئناف آخر تلاوة</p>
              <p className="text-xs text-muted-foreground font-naskh truncate">
                سورة {lastPlayed.surahName} - {lastPlayed.reciterName}
              </p>
            </div>
            <Play size={18} className="text-primary shrink-0" />
          </button>
        )}

        {/* Playlist Panel */}
        {showPlaylist && (
          <div className="mb-4 bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-naskh text-sm font-bold text-foreground flex items-center gap-2">
                <ListMusic size={16} className="text-gold" />
                قائمة التشغيل المخصصة
              </h3>
              <button onClick={() => setShowPlaylist(false)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            {playlist.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground font-naskh">لم تضف أي سور بعد</p>
                <p className="text-xs text-muted-foreground/70 font-naskh mt-1">اضغط على ♡ بجانب أي سورة لإضافتها</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-border">
                {playlist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors">
                    <button onClick={() => playFromPlaylist(item)} className="flex-1 text-right min-w-0">
                      <p className="font-naskh text-sm text-foreground truncate">سورة {item.surahName}</p>
                      <p className="text-xs text-muted-foreground font-naskh truncate">{item.reciterName}</p>
                    </button>
                    <button onClick={() => removeFromPlaylist(idx)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reciter Selection */}
        {selectedReciter && !showReciters && (
          <button
            onClick={() => setShowReciters(true)}
            className="w-full mb-4 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full gradient-islamic flex items-center justify-center shrink-0">
              <Music size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-naskh text-sm font-bold text-foreground">{selectedReciter.name}</p>
              {selectedMoshaf && <p className="text-xs text-muted-foreground font-naskh">{selectedMoshaf.name}</p>}
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        )}

        {showReciters && (
          <>
            <div className="relative mb-4">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قارئ..."
                className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto mb-4">
                {filteredReciters.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => selectReciter(reciter)}
                    className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 hover:border-gold/50 hover:shadow-islamic transition-all text-right ${
                      selectedReciter?.id === reciter.id ? "border-gold shadow-islamic" : "border-border"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full gradient-islamic flex items-center justify-center shrink-0">
                      <Music size={14} className="text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-naskh text-sm font-bold text-foreground truncate">{reciter.name}</p>
                      <p className="text-xs text-muted-foreground font-naskh">{reciter.moshaf.length > 0 ? reciter.moshaf[0].name : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Moshaf selection */}
        {selectedReciter && selectedReciter.moshaf.length > 1 && !showReciters && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {selectedReciter.moshaf.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMoshaf(m)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-naskh border transition-colors ${
                  selectedMoshaf?.id === m.id
                    ? "gradient-gold text-foreground border-transparent font-bold"
                    : "bg-card border-border text-foreground hover:bg-muted"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Download all surahs button */}
        {selectedMoshaf && !showReciters && (
          <div className="w-full mb-4 flex items-center gap-2">
            <button
              onClick={dlState === "downloading" ? pauseDl : downloadAllSurahs}
              className={`flex-1 flex items-center gap-3 border rounded-xl px-4 py-3 transition-all font-naskh text-sm ${
                dlState === "done"
                  ? "bg-primary/10 border-primary/30"
                  : dlState === "downloading"
                  ? "bg-gold/10 border-gold/30"
                  : dlState === "paused"
                  ? "bg-accent border-gold/40"
                  : "bg-card border-border hover:border-gold/50 hover:shadow-islamic"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${dlState === "done" ? "bg-primary/20" : "gradient-gold"}`}>
                {dlState === "downloading" ? <Pause size={16} className="text-foreground" /> : dlState === "done" ? <Check size={16} className="text-primary" /> : dlState === "paused" ? <Play size={16} className="text-foreground" /> : <Download size={16} className="text-foreground" />}
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="font-bold text-foreground">
                  {dlState === "done" ? "✓ تم تحميل جميع التلاوات" : dlState === "downloading" ? `جاري التحميل... ${dlProgress}%` : dlState === "paused" ? `متوقف مؤقتاً - ${dlProgress}%` : "تحميل جميع التلاوات للأوفلاين"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dlState === "downloading" || dlState === "paused"
                    ? `${Math.round((dlProgress / 100) * getAvailableSurahs().length)} من ${getAvailableSurahs().length} سورة`
                    : `${getAvailableSurahs().length} سورة - ${selectedReciter?.name}`}
                </p>
              </div>
            </button>
            {dlState === "paused" && (
              <button
                onClick={cancelDl}
                className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors shrink-0"
                title="إلغاء التحميل"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {(dlState === "downloading" || dlState === "paused") && (
          <div className="w-full mb-4 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-gold transition-all duration-300 rounded-full" style={{ width: `${dlProgress}%` }} />
          </div>
        )}

        {/* Surah list */}
        {selectedMoshaf && !showReciters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-24">
            {getAvailableSurahs().map((surah) => (
              <div
                key={surah.id}
                className={`flex items-center gap-2 bg-card border rounded-lg px-3 py-2.5 hover:border-gold/50 transition-all text-right ${
                  currentSurah?.id === surah.id ? "border-gold shadow-islamic" : "border-border"
                }`}
              >
                <button onClick={() => playSurah(surah)} className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-full gradient-islamic flex items-center justify-center text-xs text-primary-foreground font-bold shrink-0">
                    {surah.id}
                  </span>
                  <span className="font-naskh text-sm text-foreground truncate">{surah.name}</span>
                  {cachedSurahs.has(surah.id) && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="محملة أوفلاين" />
                  )}
                  {currentSurah?.id === surah.id && isPlaying && (
                    <span className="mr-auto text-gold"><Volume2 size={14} /></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (!selectedReciter || !selectedMoshaf) return;
                    const favItem = {
                      type: "recitation" as const,
                      id: surah.id,
                      surahName: surah.name,
                      reciterId: selectedReciter.id,
                      reciterName: selectedReciter.name,
                      moshafId: selectedMoshaf.id,
                      moshafServer: selectedMoshaf.server,
                    };
                    toggleFavorite(favItem);
                    // Also sync with playlist
                    if (isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id)) {
                      // Was favorite, now removing — also remove from playlist
                      const idx = playlist.findIndex(p => p.surahId === surah.id && p.reciterId === selectedReciter.id && p.moshafId === selectedMoshaf.id);
                      if (idx !== -1) removeFromPlaylist(idx);
                    } else {
                      // Adding — also add to playlist
                      addToPlaylist(surah);
                    }
                  }}
                  className={`p-1.5 rounded-md transition-colors shrink-0 ${
                    selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id)
                      ? "text-gold"
                      : "text-muted-foreground/40 hover:text-gold"
                  }`}
                >
                  <Heart size={14} fill={selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Audio Player - Fixed Bottom */}
      {currentSurah && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur-md border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)] mb-[72px]">
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
              <p className="text-xs text-muted-foreground font-naskh truncate">{selectedReciter?.name}</p>
            </div>

            <div className="flex items-center gap-1">
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
      )}
    </div>
  );
};

export default Recitations;
