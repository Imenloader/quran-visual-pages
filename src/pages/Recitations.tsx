import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Search, ChevronDown, Loader2, Music, Heart, ListMusic, X, Trash2, Clock, DownloadCloud, Check, Square, Star, Plus, FolderPlus, GripVertical, ArrowRight, Link2 } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlaylists, PRESET_PLAYLISTS, type PlaylistTrack, type Playlist } from "@/hooks/usePlaylists";
import { useAudioPlayer, SURAHS, type Surah } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";
import { normalizeArabic } from "@/lib/arabicUtils";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal from "@/components/ScrollReveal";

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

const getLastPlayed = (): LastPlayed | null => {
  try { return JSON.parse(localStorage.getItem(LAST_PLAYED_KEY) || "null"); } catch { return null; }
};

const getAudioUrl = (server: string, surahId: number | string | undefined | null): string => {
  if (!server) return "";
  const padded = String(surahId ?? "").padStart(3, "0");
  
  // Clean the server URL
  let httpsServer = server.trim();
  
  // Force https if server starts with http:// or // to avoid mixed content issues
  if (httpsServer.startsWith("http://")) {
    httpsServer = httpsServer.replace("http://", "https://");
  } else if (httpsServer.startsWith("//")) {
    httpsServer = "https:" + httpsServer;
  } else if (!httpsServer.startsWith("https://")) {
    // If no protocol, assume https
    httpsServer = "https://" + httpsServer;
  }
  
  // Ensure trailing slash
  if (!httpsServer.endsWith("/")) {
    httpsServer += "/";
  }
  return `${httpsServer}${padded}.mp3`;
};

const Recitations = () => {
  const { t } = useTranslation();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState<Moshaf | null>(null);
  const [showReciters, setShowReciters] = useState(true);
  const [activeTab, setActiveTab] = useState<"reciters" | "playlists">("reciters");
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Surah | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const [dlState, setDlState] = useState<"idle" | "downloading" | "paused" | "done">("idle");
  const [dlProgress, setDlProgress] = useState(0);
  const dlAbortRef = useRef<AbortController | null>(null);
  const dlLoadedRef = useRef(0);
  const [cachedSurahs, setCachedSurahs] = useState<Set<number>>(new Set());

  const { toggleFavorite, isFavorite } = useFavorites();
  const { playlists, createPlaylist, deletePlaylist, addTrack, removeTrack, reorderTracks } = usePlaylists();
  const dragState = useRef<{ playlistId: string; fromIndex: number; currentIndex: number } | null>(null);
  const [dragPlaylistId, setDragPlaylistId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  // Global audio player
  const {
    currentSurah, isPlaying,
    playSurah: globalPlaySurah,
    playPlaylistQueue,
  } = useAudioPlayer();

  // Load reciters
  const fetchReciters = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("https://mp3quran.net/api/v3/reciters?language=ar")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reciters");
        return res.json();
      })
      .then((data) => {
        setReciters(data.reciters || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reciters:", err);
        setError("حدث خطأ أثناء تحميل قائمة القراء. يرجى التحقق من اتصالك بالإنترنت.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchReciters();
  }, [fetchReciters]);

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

  const getAvailableSurahs = useCallback((): Surah[] => {
    if (!selectedMoshaf) return [];
    const ids = selectedMoshaf.surah_list.split(",").map(Number);
    return SURAHS.filter((s) => ids.includes(s.id));
  }, [selectedMoshaf]);

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
    } catch { /* Cache API not available */ }
    setCachedSurahs(cached);
  }, [selectedMoshaf, getAvailableSurahs]);

  useEffect(() => {
    checkCachedSurahs();
  }, [checkCachedSurahs]);

  const playSurah = useCallback((surah: Surah, resumeTime?: number, server?: string) => {
    const srv = server || selectedMoshaf?.server;
    if (!srv || !selectedReciter) return;
    const moshafToUse = selectedMoshaf || { id: 0, name: "", server: srv, surah_total: 0, surah_list: "" };
    globalPlaySurah(
      surah,
      { id: selectedReciter.id, name: selectedReciter.name },
      { id: moshafToUse.id, name: moshafToUse.name, server: srv, surah_list: moshafToUse.surah_list },
      resumeTime,
    );
  }, [selectedMoshaf, selectedReciter, globalPlaySurah]);

  const selectReciter = useCallback((reciter: Reciter) => {
    setSelectedReciter(reciter);
    setSelectedMoshaf(reciter.moshaf[0] || null);
    setShowReciters(false);
  }, []);

  const resumeLastPlayed = useCallback(() => {
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
    if (surah) {
      globalPlaySurah(
        surah,
        { id: last.reciterId, name: last.reciterName },
        { id: last.moshafId, name: last.moshafName, server: last.moshafServer, surah_list: last.surahList },
        last.currentTime,
      );
    }
  }, [reciters, globalPlaySurah]);

  const playPlaylist = useCallback((pl: Playlist) => {
    if (pl.tracks.length === 0) {
      toast("القائمة فارغة", { description: "أضف سوراً أولاً" });
      return;
    }
    const tracks = pl.tracks.map(t => ({
      surahId: t.surahId,
      surahName: t.surahName,
      reciterId: t.reciterId,
      reciterName: t.reciterName,
      moshafId: t.moshafId,
      moshafServer: t.moshafServer,
    }));
    // Set reciter context locally
    const track = pl.tracks[0];
    const reciter = reciters.find(r => r.id === track.reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
      const moshaf = reciter.moshaf.find(m => m.id === track.moshafId);
      if (moshaf) setSelectedMoshaf(moshaf);
    }
    setShowReciters(false);
    setActiveTab("reciters");
    playPlaylistQueue(tracks, pl.name);
  }, [reciters, playPlaylistQueue]);

  const playPresetPlaylist = useCallback((preset: typeof PRESET_PLAYLISTS[0]) => {
    if (!selectedReciter || !selectedMoshaf) {
      toast("اختر قارئاً أولاً", { description: "يجب اختيار قارئ لتشغيل القائمة الجاهزة" });
      return;
    }
    const available = selectedMoshaf.surah_list.split(",").map(Number);
    const tracks = preset.surahIds
      .filter(id => available.includes(id))
      .map(id => ({
        surahId: id,
        surahName: SURAHS.find(s => s.id === id)?.name || "",
        reciterId: selectedReciter.id,
        reciterName: selectedReciter.name,
        moshafId: selectedMoshaf.id,
        moshafServer: selectedMoshaf.server,
      }));
    if (tracks.length === 0) {
      toast("لا توجد سور متاحة", { description: "القارئ لا يملك هذه السور" });
      return;
    }
    setActiveTab("reciters");
    playPlaylistQueue(tracks, preset.name);
    toast.success(`تشغيل: ${preset.name}`, { description: `${tracks.length} سور` });
  }, [selectedReciter, selectedMoshaf, playPlaylistQueue]);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    toast.success("تم إنشاء القائمة");
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

  const pauseDl = () => { dlAbortRef.current?.abort(); setDlState("paused"); };
  const cancelDl = () => { dlLoadedRef.current = 0; setDlProgress(0); setDlState("idle"); };

  const filteredReciters = reciters.filter((r) => {
    const normalizedName = normalizeArabic(r.name);
    const normalizedQuery = normalizeArabic(searchQuery);
    const matchesSearch = normalizedName.includes(normalizedQuery);
    const matchesLetter = !selectedLetter || r.letter === selectedLetter;
    return matchesSearch && matchesLetter;
  });

  const alphabet = Array.from(new Set(reciters.map(r => r.letter))).sort();
  const lastPlayed = getLastPlayed();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setShowScrollTop]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message);
    });
  };

  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    
    // Create a flexible regex for Arabic characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexibleHighlight = escapedHighlight
      .replace(/[أإآا]/g, "[أإآا]")
      .replace(/[ةه]/g, "[ةه]")
      .replace(/[ىي]/g, "[ىي]");
      
    const regex = new RegExp(`(${flexibleHighlight})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-gold/30 text-foreground rounded-sm px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const ReciterSkeleton = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-5 bg-card/40 border border-border/40 rounded-2xl p-5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-muted/20 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/20 rounded w-3/4" />
              <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
            <div className="w-10 h-10 rounded-full bg-muted/20 shrink-0" />
          </div>
        ))}
      </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-gold/30 selection:text-gold">
      {/* Header */}
      <header className="relative overflow-hidden bg-emerald-deep min-h-[50vh] flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.3, 1, 1.3],
              opacity: [0.1, 0.3, 0.1],
              x: [0, -50, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-gold/5 rounded-full blur-[150px]" 
          />
          
          {/* Floating Particles */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                y: -200,
                x: Math.sin(i) * 100
              }}
              transition={{ 
                duration: 7 + Math.random() * 7, 
                repeat: Infinity, 
                delay: Math.random() * 7,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-gold/30 rounded-full"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${80 + Math.random() * 20}%` 
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-16">
            <Link 
              to="/" 
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all border border-border/40"
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/favorites" 
                className="h-12 px-6 rounded-full bg-muted flex items-center gap-3 text-xs font-sans font-bold tracking-widest text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all border border-border/40 uppercase"
              >
                <Heart size={16} strokeWidth={1.5} />
                <span>{t("recitations.favorites")}</span>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-muted/50 border border-border/40 backdrop-blur-md mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-muted-foreground uppercase">{t("recitations.audioLibrary")}</span>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="font-serif italic text-gold/80 text-2xl mb-6"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl sm:text-8xl font-serif font-light text-white mb-8 tracking-tighter"
            >
              سماع <span className="italic font-light text-gold/80">التلاوات</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white font-naskh text-xl max-w-2xl mx-auto leading-relaxed"
            >
              رحلة إيمانية مع أعذب الأصوات وأشهر القراء في العالم الإسلامي
            </motion.p>
          </div>
        </div>

        {/* Decorative Bottom Ornament */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </header>

      {/* Tabs: Reciters / Playlists */}
      <div className="sticky top-0 z-40 -mt-8 px-4">
        <div className="max-w-md mx-auto bg-muted/30 backdrop-blur-2xl border border-border/40 rounded-2xl p-1.5 shadow-2xl shadow-black/20">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("reciters")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                activeTab === "reciters" 
                  ? "bg-gold text-black shadow-lg shadow-gold/20" 
                  : "text-muted-foreground hover:text-primary hover:bg-card/20"
              }`}
            >
              <Music size={14} />
              {t("recitations.recitersAndSurahs")}
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-sans font-bold tracking-wider uppercase transition-all relative ${
                activeTab === "playlists" 
                  ? "bg-gold text-black shadow-lg shadow-gold/20" 
                  : "text-muted-foreground hover:text-primary hover:bg-card/20"
              }`}
            >
              <ListMusic size={14} />
              {t("recitations.playlists")}
              {playlists.length > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] flex items-center justify-center border border-black/10 ${
                  activeTab === "playlists" ? "bg-black text-gold" : "bg-gold text-black"
                }`}>
                  {playlists.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {activeTab === "playlists" ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Preset playlists */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                  <ListMusic size={18} />
                </div>
                <h3 className="font-serif text-2xl text-foreground">قوائم <span className="italic text-gold">جاهزة</span></h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESET_PLAYLISTS.map((preset, idx) => (
                  <ScrollReveal key={preset.id} index={idx}>
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => playPresetPlaylist(preset)}
                      className="group w-full flex items-center gap-5 bg-card/40 border border-border/40 rounded-2xl p-5 hover:bg-card hover:border-gold/30 transition-all text-right relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors" />
                      
                      <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center text-3xl shadow-inner">
                        {preset.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-naskh text-lg font-bold text-primary group-hover:text-gold transition-colors">{preset.name}</p>
                        <p className="text-[10px] font-sans font-bold tracking-widest text-primary/90 uppercase mt-1">{preset.surahIds.length} Surahs</p>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </motion.button>
                  </ScrollReveal>
                ))}
              </div>
              {!selectedReciter && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 rounded-xl bg-gold/5 border border-gold/10 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Music size={14} />
                  </div>
                  <p className="text-xs text-gold/90 font-naskh">
                    اختر قارئاً أولاً من تبويب "القراء والسور" لتشغيل القوائم الجاهزة بصوته المفضل
                  </p>
                </motion.div>
              )}
            </section>

            {/* Custom playlists */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald">
                    <FolderPlus size={18} />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground">قوائمي <span className="italic text-gold">المخصصة</span></h3>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                    placeholder="اسم القائمة..."
                    className="bg-card/40 border border-border/40 rounded-xl px-4 py-2 text-sm font-naskh text-primary placeholder:text-primary/20 focus:outline-none focus:border-gold/50 transition-all w-40 sm:w-64"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="w-10 h-10 rounded-xl bg-gold text-black flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-gold/20"
                  >
                    <Plus size={20} />
                  </motion.button>
                </div>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-20 bg-card/40 border border-dashed border-border/40 rounded-3xl">
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                    <ListMusic size={40} className="text-primary/10" />
                  </div>
                  <p className="text-lg text-primary/70 font-serif italic">لا توجد قوائم مخصصة بعد</p>
                  <p className="text-xs text-primary/50 font-naskh mt-2">أنشئ قائمة وأضف إليها سوراً من أي قارئ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {playlists.map(pl => (
                    <motion.div 
                      layout
                      key={pl.id} 
                      className="group bg-card/40 border border-border/40 rounded-3xl overflow-hidden hover:border-border/60 transition-all"
                    >
                      <div className="flex items-center gap-5 px-6 py-5 bg-card/40">
                        <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center text-3xl shadow-inner">
                          {pl.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-naskh text-xl font-bold text-primary">{pl.name}</p>
                          <p className="text-[10px] font-sans font-bold tracking-widest text-primary/90 uppercase mt-1">{pl.tracks.length} Recitations</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => playPlaylist(pl)}
                            disabled={pl.tracks.length === 0}
                            className="w-12 h-12 rounded-full bg-gold text-black flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-gold/20"
                          >
                            <Play size={20} fill="currentColor" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { deletePlaylist(pl.id); toast.success("تم حذف القائمة"); }}
                            className="w-10 h-10 rounded-full bg-muted text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {pl.tracks.length > 0 && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            className="border-t border-border/40 max-h-80 overflow-y-auto custom-scrollbar"
                          >
                            {pl.tracks.map((track, idx) => (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={`${track.surahId}-${track.reciterId}-${idx}`}
                                className={`group/track flex items-center gap-4 px-6 py-4 text-right transition-all border-b border-border/10 last:border-0 ${
                                  dragPlaylistId === pl.id && dragOverIndex === idx ? "bg-gold/10" : "hover:bg-card/40"
                                }`}
                                draggable
                                onDragStart={(e) => {
                                  dragState.current = { playlistId: pl.id, fromIndex: idx, currentIndex: idx };
                                  setDragPlaylistId(pl.id);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (dragState.current?.playlistId === pl.id) {
                                    setDragOverIndex(idx);
                                    dragState.current.currentIndex = idx;
                                  }
                                }}
                                onDragEnd={() => {
                                  if (dragState.current && dragState.current.fromIndex !== dragState.current.currentIndex) {
                                    reorderTracks(dragState.current.playlistId, dragState.current.fromIndex, dragState.current.currentIndex);
                                  }
                                  dragState.current = null;
                                  setDragPlaylistId(null);
                                  setDragOverIndex(-1);
                                }}
                                data-track-index={idx}
                              >
                                <div data-grip className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-gold transition-colors p-1">
                                  <GripVertical size={16} />
                                </div>
                                
                                <button
                                  onClick={() => {
                                    const reciter = reciters.find(r => r.id === track.reciterId);
                                    if (reciter) {
                                      setSelectedReciter(reciter);
                                      const moshaf = reciter.moshaf.find(m => m.id === track.moshafId);
                                      if (moshaf) setSelectedMoshaf(moshaf);
                                    }
                                    setShowReciters(false);
                                    setActiveTab("reciters");
                                    const s = SURAHS.find(su => su.id === track.surahId);
                                    if (s) {
                                      globalPlaySurah(
                                        s,
                                        { id: track.reciterId, name: track.reciterName },
                                        { id: track.moshafId, name: "", server: track.moshafServer, surah_list: "" },
                                      );
                                    }
                                  }}
                                  className="flex-1 min-w-0 text-right group-hover/track:translate-x-1 transition-transform"
                                >
                                  <p className="font-naskh text-sm text-primary group-hover/track:text-gold transition-colors">سورة {track.surahName}</p>
                                  <p className="text-[10px] font-sans font-bold tracking-widest text-primary/60 uppercase mt-0.5">{track.reciterName}</p>
                                </button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeTrack(pl.id, track.surahId, track.reciterId, track.moshafId)}
                                  className="w-8 h-8 rounded-lg text-primary/10 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center opacity-0 group-hover/track:opacity-100"
                                >
                                  <X size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Resume last played banner */}
            {lastPlayed && !currentSurah && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={resumeLastPlayed}
                className="w-full mb-8 flex items-center gap-6 bg-card/40 border border-border/40 rounded-3xl p-6 text-right hover:bg-card/60 transition-all group shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                  <Clock size={28} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-gold/80 uppercase mb-1 block">Continue Listening</span>
                  <p className="font-serif text-xl text-primary">استئناف آخر تلاوة</p>
                  <p className="text-xs text-primary/90 font-naskh truncate mt-1">
                    سورة {lastPlayed.surahName} • {lastPlayed.reciterName}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-black shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform relative z-10">
                  <Play size={24} fill="currentColor" />
                </div>
              </motion.button>
            )}

            {/* Reciter Selection */}
            {selectedReciter && !showReciters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowReciters(true)}
                className="w-full mb-8 flex items-center gap-6 bg-card/40 border border-border/40 rounded-3xl p-6 hover:bg-card/60 transition-all shadow-xl group cursor-pointer relative overflow-hidden"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowReciters(true);
                  }
                }}
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald/5 rounded-full blur-3xl -ml-16 -mt-16" />
                <div className="w-16 h-16 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                  <Music size={28} className="text-primary/60" />
                </div>
                <div className="flex-1 text-right min-w-0 relative z-10">
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-primary/80 uppercase mb-1 block">Selected Reciter</span>
                  <p className="font-serif text-2xl text-primary truncate">{selectedReciter.name}</p>
                  {selectedMoshaf && <p className="text-xs text-primary/90 font-naskh truncate mt-1">{selectedMoshaf.name}</p>}
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite({ type: "reciter", id: selectedReciter.id, name: selectedReciter.name });
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isFavorite("reciter", selectedReciter.id) 
                        ? "bg-gold text-black shadow-lg shadow-gold/20" 
                        : "bg-muted text-muted-foreground/40 hover:text-gold hover:bg-muted/80"
                    }`}
                    title="تفضيل القارئ"
                  >
                    <Star size={18} fill={isFavorite("reciter", selectedReciter.id) ? "currentColor" : "none"} />
                  </motion.button>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </motion.div>
            )}

            {showReciters && (
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group max-w-2xl mx-auto"
                >
                  <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-gold transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن قارئ..."
                    className="w-full bg-muted/30 border border-border/40 rounded-2xl pr-14 pl-14 py-4 text-sm font-naskh text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all shadow-2xl backdrop-blur-xl"
                    aria-label="البحث عن القراء"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-all"
                      title="مسح البحث"
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>

                {loading ? (
                  <ReciterSkeleton />
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-6 bg-red-500/5 border border-dashed border-red-500/20 rounded-[2rem] backdrop-blur-sm"
                  >
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                      <X size={40} className="text-red-500/40" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-serif text-2xl text-foreground">خطأ في التحميل</p>
                      <p className="font-naskh text-sm text-muted-foreground">{error}</p>
                    </div>
                    <button 
                      onClick={fetchReciters}
                      className="px-8 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-sans text-xs font-bold tracking-widest uppercase"
                    >
                      إعادة المحاولة
                    </button>
                  </motion.div>
                ) : filteredReciters.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-6 bg-muted/30 border border-dashed border-border/40 rounded-[2rem] backdrop-blur-sm"
                  >
                    <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                      <Search size={40} className="text-muted-foreground/20" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-serif text-2xl text-foreground">لا توجد نتائج</p>
                      <p className="font-naskh text-sm text-muted-foreground">لم نجد قارئاً بهذا الاسم، جرب كلمة أخرى</p>
                    </div>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="px-8 py-3 rounded-full bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-sans text-xs font-bold tracking-widest uppercase"
                    >
                      عرض الكل
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                    {filteredReciters.map((reciter, idx) => (
                      <ScrollReveal key={reciter.id} index={idx}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-5 bg-card border rounded-2xl p-5 hover:bg-muted/50 transition-all text-right group relative overflow-hidden ${
                            selectedReciter?.id === reciter.id 
                              ? "border-gold/50 bg-gold/5 shadow-lg shadow-gold/5" 
                              : "border-border/40"
                          }`}
                        >
                          <button onClick={() => selectReciter(reciter)} className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                              selectedReciter?.id === reciter.id ? "bg-gold text-black" : "bg-muted text-muted-foreground/40 group-hover:bg-muted/80"
                            }`}>
                              <Music size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-lg text-foreground truncate group-hover:text-gold transition-colors">
                                <HighlightText text={reciter.name} highlight={searchQuery} />
                              </p>
                              <p className="text-[11px] text-muted-foreground/60 font-naskh truncate mt-1">{reciter.moshaf.length > 0 ? reciter.moshaf[0].name : ""}</p>
                            </div>
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite({ type: "reciter", id: reciter.id, name: reciter.name })}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative z-10 ${
                              isFavorite("reciter", reciter.id) 
                                ? "bg-gold text-black shadow-lg shadow-gold/20" 
                                : "bg-muted text-muted-foreground/20 hover:text-gold hover:bg-muted/80"
                            }`}
                            title="تفضيل القارئ"
                          >
                            <Star size={18} fill={isFavorite("reciter", reciter.id) ? "currentColor" : "none"} />
                          </motion.button>
                        </motion.div>
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Moshaf selection */}
            {selectedReciter && selectedReciter.moshaf.length > 1 && !showReciters && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-8 overflow-x-auto pb-4 custom-scrollbar"
              >
                {selectedReciter.moshaf.map((m) => (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={m.id}
                    onClick={() => setSelectedMoshaf(m)}
                    className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-sans font-bold tracking-wider uppercase border transition-all shadow-lg ${
                      selectedMoshaf?.id === m.id
                        ? "bg-gold text-black border-transparent"
                        : "bg-card border-border/40 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {m.name}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Download all surahs button */}
            {selectedMoshaf && !showReciters && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={dlState === "downloading" ? pauseDl : downloadAllSurahs}
                    className={`flex-1 flex items-center gap-6 border rounded-3xl p-6 transition-all shadow-xl relative overflow-hidden ${
                      dlState === "done" ? "bg-emerald/10 border-emerald/20"
                        : dlState === "downloading" ? "bg-gold/10 border-gold/20"
                        : dlState === "paused" ? "bg-card border-gold/30"
                        : "bg-card border-border/40 hover:bg-muted/50 hover:border-gold/30"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all ${
                      dlState === "done" ? "bg-emerald/20 text-emerald" : "bg-gold text-black"
                    }`}>
                      {dlState === "downloading" ? <Pause size={24} /> : dlState === "done" ? <Check size={24} /> : dlState === "paused" ? <Play size={24} /> : <DownloadCloud size={24} />}
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-primary/60 uppercase mb-1 block">Offline Access</span>
                      <p className="font-serif text-xl text-foreground">
                        {dlState === "done" ? "تم تحميل جميع التلاوات" : dlState === "downloading" ? `جاري التحميل... ${dlProgress}%` : dlState === "paused" ? `متوقف مؤقتاً - ${dlProgress}%` : "تحميل جميع التلاوات"}
                      </p>
                      <p className="text-xs text-muted-foreground/70 font-naskh mt-1">
                        {dlState === "downloading" || dlState === "paused"
                          ? `${Math.round((dlProgress / 100) * getAvailableSurahs().length)} من ${getAvailableSurahs().length} سورة`
                          : `${getAvailableSurahs().length} سورة • ${selectedReciter?.name}`}
                      </p>
                    </div>
                  </motion.button>
                  {dlState === "paused" && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={cancelDl} 
                      className="w-16 h-16 rounded-3xl border border-border/40 bg-card flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all shadow-xl shrink-0" 
                      title="إلغاء التحميل"
                    >
                      <X size={24} />
                    </motion.button>
                  )}
                </div>

                <AnimatePresence>
                  {(dlState === "downloading" || dlState === "paused") && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full h-1.5 bg-muted rounded-full overflow-hidden shadow-inner"
                    >
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dlProgress}%` }}
                        className="h-full bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Surah list */}
            {selectedMoshaf && !showReciters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                {getAvailableSurahs().map((surah, idx) => (
                  <ScrollReveal key={surah.id} index={idx}>
                    <motion.div
                      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`group flex items-center gap-5 bg-card border rounded-[2rem] p-5 hover:bg-muted/50 transition-all text-right shadow-xl relative overflow-hidden ${
                        currentSurah?.id === surah.id ? "border-gold/50 bg-gold/5 shadow-lg shadow-gold/5" : "border-border/40"
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors" />
                      
                      <button onClick={() => playSurah(surah)} className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all ${
                          currentSurah?.id === surah.id ? "bg-gold text-black" : "bg-muted text-muted-foreground/40 group-hover:bg-muted/80"
                        }`}>
                          {currentSurah?.id === surah.id && isPlaying ? (
                            <div className="flex items-end gap-1 h-5">
                              <motion.div animate={{ height: [4, 20, 8, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-current rounded-full" />
                              <motion.div animate={{ height: [12, 4, 20, 10, 12] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-current rounded-full" />
                              <motion.div animate={{ height: [18, 12, 4, 20, 18] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-current rounded-full" />
                            </div>
                          ) : (
                            <span className="font-sans font-bold text-lg tracking-tighter">{surah.id}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-xl text-foreground truncate group-hover:text-gold transition-colors">{surah.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {cachedSurahs.has(surah.id) && (
                              <div className="flex items-center gap-1 text-[10px] font-sans font-bold tracking-[0.2em] text-emerald uppercase">
                                <Check size={10} />
                                Offline
                              </div>
                            )}
                            {cachedSurahs.has(surah.id) && <span className="w-1 h-1 rounded-full bg-border/40" />}
                            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
                              {surah.type === "meccan" ? "Meccan" : "Medinan"}
                            </span>
                          </div>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (!selectedReciter || !selectedMoshaf) return;
                            toggleFavorite({
                              type: "recitation", id: surah.id, surahName: surah.name,
                              reciterId: selectedReciter.id, reciterName: selectedReciter.name,
                              moshafId: selectedMoshaf.id, moshafServer: selectedMoshaf.server,
                            });
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id)
                              ? "bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10" 
                              : "bg-muted text-muted-foreground/20 hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          <Heart size={18} fill={selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id) ? "currentColor" : "none"} />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowAddToPlaylist(surah)}
                          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/20 hover:text-gold hover:bg-gold/10 transition-all"
                        >
                          <Plus size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 left-6 z-40 w-12 h-12 rounded-2xl gradient-gold text-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
            aria-label="العودة للأعلى"
          >
            <ChevronDown className="rotate-180" size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add to Playlist Modal */}
      <AnimatePresence>
        {showAddToPlaylist && selectedReciter && selectedMoshaf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" 
            onClick={() => setShowAddToPlaylist(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card border border-border/40 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-border/10 bg-muted/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <FolderPlus size={24} />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddToPlaylist(null)} 
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/20 hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">أضف إلى <span className="italic text-gold">القائمة</span></h3>
                <p className="font-naskh text-sm text-muted-foreground/60">سورة {showAddToPlaylist.name} بصوت {selectedReciter.name}</p>
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar">
                {playlists.length === 0 ? (
                  <div className="text-center py-12">
                    <ListMusic size={48} className="mx-auto text-muted-foreground/10 mb-4" />
                    <p className="text-sm text-muted-foreground/40 font-naskh">لا توجد قوائم مخصصة بعد</p>
                    <p className="text-[10px] text-muted-foreground/20 font-sans font-bold tracking-widest uppercase mt-2">Create one in the Playlists tab</p>
                  </div>
                ) : (
                  playlists.map(pl => {
                    const isIn = pl.tracks.some(
                      t => t.surahId === showAddToPlaylist.id && t.reciterId === selectedReciter.id && t.moshafId === selectedMoshaf.id
                    );
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        key={pl.id}
                        onClick={() => {
                          if (isIn) {
                            removeTrack(pl.id, showAddToPlaylist.id, selectedReciter.id, selectedMoshaf.id);
                            toast.success("تمت الإزالة من القائمة");
                          } else {
                            addTrack(pl.id, {
                              surahId: showAddToPlaylist.id, surahName: showAddToPlaylist.name,
                              reciterId: selectedReciter.id, reciterName: selectedReciter.name,
                              moshafId: selectedMoshaf.id, moshafServer: selectedMoshaf.server,
                            });
                            toast.success("تمت الإضافة إلى القائمة");
                          }
                        }}
                        className={`w-full flex items-center gap-5 p-5 rounded-3xl border transition-all text-right shadow-xl ${
                          isIn ? "border-gold/50 bg-gold/5" : "border-border/10 bg-muted/30 hover:bg-muted/50 hover:border-border/20"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${
                          isIn ? "bg-gold text-black" : "bg-muted"
                        }`}>
                          {isIn ? <Check size={20} /> : pl.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-naskh text-lg font-bold text-foreground">{pl.name}</p>
                          <p className="text-[10px] font-sans font-bold tracking-widest text-muted-foreground/60 uppercase mt-0.5">{pl.tracks.length} Recitations</p>
                        </div>
                        {isIn && (
                          <div className="w-8 h-8 rounded-full bg-emerald/10 text-emerald flex items-center justify-center">
                            <Check size={16} />
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
              
              <div className="p-8 bg-muted/30 border-t border-border/10">
                <button
                  onClick={() => setShowAddToPlaylist(null)}
                  className="w-full py-4 rounded-2xl bg-muted text-muted-foreground/80 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-muted/80 hover:text-foreground transition-all"
                >
                  Close Modal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recitations;
