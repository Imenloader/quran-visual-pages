import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Home, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Search, ChevronDown, Loader2, Music, Heart, ListMusic, X, Trash2, Clock, Download, Check, Square, Star, Plus, FolderPlus, GripVertical } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlaylists, PRESET_PLAYLISTS, type PlaylistTrack, type Playlist } from "@/hooks/usePlaylists";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";

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

const getLastPlayed = (): LastPlayed | null => {
  try { return JSON.parse(localStorage.getItem(LAST_PLAYED_KEY) || "null"); } catch { return null; }
};

const getAudioUrl = (server: string, surahId: number): string => {
  const padded = surahId.toString().padStart(3, "0");
  return `${server}${padded}.mp3`;
};

const Recitations = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const playSurah = (surah: Surah, resumeTime?: number, server?: string) => {
    const srv = server || selectedMoshaf?.server;
    if (!srv || !selectedReciter) return;
    const moshafToUse = selectedMoshaf || { id: 0, name: "", server: srv, surah_total: 0, surah_list: "" };
    globalPlaySurah(
      surah,
      { id: selectedReciter.id, name: selectedReciter.name },
      { id: moshafToUse.id, name: moshafToUse.name, server: srv, surah_list: moshafToUse.surah_list },
      resumeTime,
    );
  };

  const selectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    setSelectedMoshaf(reciter.moshaf[0] || null);
    setShowReciters(false);
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
    if (surah) {
      globalPlaySurah(
        surah,
        { id: last.reciterId, name: last.reciterName },
        { id: last.moshafId, name: last.moshafName, server: last.moshafServer, surah_list: last.surahList },
        last.currentTime,
      );
    }
  };

  const playPlaylist = (pl: Playlist) => {
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
  };

  const playPresetPlaylist = (preset: typeof PRESET_PLAYLISTS[0]) => {
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
  };

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

  const filteredReciters = reciters.filter((r) => r.name.includes(searchQuery));
  const lastPlayed = getLastPlayed();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="flex justify-end items-center gap-2 pt-3 pb-1">
          <Link to="/favorites" className="flex items-center gap-1.5 bg-white/10 text-primary-foreground px-3 py-2 rounded-lg hover:bg-white/20 transition-all font-naskh text-xs font-bold">
            <Heart size={14} />
            المفضلة
          </Link>
        </div>
        <div className="pb-6">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">سماع التلاوات</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">استمع لأشهر القراء والمشايخ</p>
        </div>
      </header>

      {/* Tabs: Reciters / Playlists */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setActiveTab("reciters")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-naskh font-bold transition-all ${
                activeTab === "reciters" ? "gradient-gold text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Music size={14} />
              القراء والسور
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-naskh font-bold transition-all ${
                activeTab === "playlists" ? "gradient-gold text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <ListMusic size={14} />
              قوائم التشغيل
              {playlists.length > 0 && (
                <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center ${
                  activeTab === "playlists" ? "bg-foreground/20" : "bg-muted"
                }`}>{playlists.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-4">
        {activeTab === "playlists" ? (
          <div className="space-y-4">
            {/* Preset playlists */}
            <div>
              <h3 className="font-naskh text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <ListMusic size={16} className="text-gold" />
                قوائم جاهزة
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PLAYLISTS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => playPresetPlaylist(preset)}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-gold/50 hover:shadow-islamic transition-all text-right"
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-naskh text-sm font-bold text-foreground">{preset.name}</p>
                      <p className="text-xs text-muted-foreground font-naskh">{preset.surahIds.length} سور</p>
                    </div>
                    <Play size={14} className="text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
              {!selectedReciter && (
                <p className="text-xs text-muted-foreground font-naskh mt-2 text-center">
                  💡 اختر قارئاً أولاً من تبويب "القراء والسور" لتشغيل القوائم الجاهزة
                </p>
              )}
            </div>

            {/* Custom playlists */}
            <div>
              <h3 className="font-naskh text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <FolderPlus size={16} className="text-gold" />
                قوائمي المخصصة
              </h3>

              {/* Create new playlist */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                  placeholder="اسم القائمة الجديدة..."
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="px-4 py-2 rounded-lg gradient-gold text-foreground font-naskh text-sm font-bold disabled:opacity-40 transition-opacity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-8 bg-card border border-border rounded-xl">
                  <ListMusic size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground font-naskh">لا توجد قوائم مخصصة بعد</p>
                  <p className="text-xs text-muted-foreground/70 font-naskh mt-1">أنشئ قائمة وأضف إليها سوراً من أي قارئ</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlists.map(pl => (
                    <div key={pl.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xl">{pl.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-naskh text-sm font-bold text-foreground">{pl.name}</p>
                          <p className="text-xs text-muted-foreground font-naskh">{pl.tracks.length} تلاوة</p>
                        </div>
                        <button
                          onClick={() => playPlaylist(pl)}
                          disabled={pl.tracks.length === 0}
                          className="p-2 rounded-lg gradient-islamic text-primary-foreground disabled:opacity-40 transition-opacity"
                          title="تشغيل القائمة"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => { deletePlaylist(pl.id); toast("تم حذف القائمة"); }}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {pl.tracks.length > 0 && (
                        <div className="border-t border-border max-h-48 overflow-y-auto divide-y divide-border">
                          {pl.tracks.map((track, idx) => (
                            <div
                              key={`${track.surahId}-${track.reciterId}-${idx}`}
                              className={`flex items-center gap-2 px-4 py-2 text-right transition-colors ${
                                dragPlaylistId === pl.id && dragOverIndex === idx ? "bg-accent/10" : ""
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
                              onTouchStart={(e) => {
                                const grip = (e.target as HTMLElement).closest('[data-grip]');
                                if (!grip) return;
                                dragState.current = { playlistId: pl.id, fromIndex: idx, currentIndex: idx };
                                setDragPlaylistId(pl.id);
                              }}
                              onTouchMove={(e) => {
                                if (!dragState.current || dragState.current.playlistId !== pl.id) return;
                                const touch = e.touches[0];
                                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                                const row = el?.closest('[data-track-index]');
                                if (row) {
                                  const newIdx = parseInt(row.getAttribute('data-track-index') || '-1');
                                  if (newIdx >= 0) {
                                    setDragOverIndex(newIdx);
                                    dragState.current.currentIndex = newIdx;
                                  }
                                }
                              }}
                              onTouchEnd={() => {
                                if (dragState.current && dragState.current.fromIndex !== dragState.current.currentIndex) {
                                  reorderTracks(dragState.current.playlistId, dragState.current.fromIndex, dragState.current.currentIndex);
                                }
                                dragState.current = null;
                                setDragPlaylistId(null);
                                setDragOverIndex(-1);
                              }}
                              data-track-index={idx}
                            >
                              <div data-grip className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground touch-none shrink-0">
                                <GripVertical size={14} />
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
                                className="flex-1 min-w-0 text-right"
                              >
                                <p className="font-naskh text-xs text-foreground truncate">سورة {track.surahName}</p>
                                <p className="text-[10px] text-muted-foreground font-naskh truncate">{track.reciterName}</p>
                              </button>
                              <button
                                onClick={() => removeTrack(pl.id, track.surahId, track.reciterId, track.moshafId)}
                                className="p-1 rounded text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite({ type: "reciter", id: selectedReciter.id, name: selectedReciter.name });
                  }}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isFavorite("reciter", selectedReciter.id) ? "text-gold" : "text-muted-foreground hover:text-gold"
                  }`}
                  title="تفضيل القارئ"
                >
                  <Star size={16} fill={isFavorite("reciter", selectedReciter.id) ? "currentColor" : "none"} />
                </button>
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
                      <div
                        key={reciter.id}
                        className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 hover:border-gold/50 hover:shadow-islamic transition-all text-right ${
                          selectedReciter?.id === reciter.id ? "border-gold shadow-islamic" : "border-border"
                        }`}
                      >
                        <button onClick={() => selectReciter(reciter)} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full gradient-islamic flex items-center justify-center shrink-0">
                            <Music size={14} className="text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-naskh text-sm font-bold text-foreground truncate">{reciter.name}</p>
                            <p className="text-xs text-muted-foreground font-naskh">{reciter.moshaf.length > 0 ? reciter.moshaf[0].name : ""}</p>
                          </div>
                        </button>
                        <button
                          onClick={() => toggleFavorite({ type: "reciter", id: reciter.id, name: reciter.name })}
                          className={`p-1.5 rounded-md transition-colors shrink-0 ${
                            isFavorite("reciter", reciter.id) ? "text-gold" : "text-muted-foreground/30 hover:text-gold"
                          }`}
                          title="تفضيل القارئ"
                        >
                          <Star size={14} fill={isFavorite("reciter", reciter.id) ? "currentColor" : "none"} />
                        </button>
                      </div>
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
                    dlState === "done" ? "bg-primary/10 border-primary/30"
                      : dlState === "downloading" ? "bg-gold/10 border-gold/30"
                      : dlState === "paused" ? "bg-accent border-gold/40"
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
                  <button onClick={cancelDl} className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors shrink-0" title="إلغاء التحميل">
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
                    className={`flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-2.5 hover:border-gold/50 transition-all text-right ${
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
                    {/* Favorite button */}
                    <button
                      onClick={() => {
                        if (!selectedReciter || !selectedMoshaf) return;
                        toggleFavorite({
                          type: "recitation", id: surah.id, surahName: surah.name,
                          reciterId: selectedReciter.id, reciterName: selectedReciter.name,
                          moshafId: selectedMoshaf.id, moshafServer: selectedMoshaf.server,
                        });
                      }}
                      className={`p-1 rounded transition-colors shrink-0 ${
                        selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id)
                          ? "text-gold" : "text-muted-foreground/30 hover:text-gold"
                      }`}
                      title="إضافة للمفضلة"
                    >
                      <Heart size={13} fill={selectedReciter && selectedMoshaf && isFavorite("recitation", surah.id, selectedReciter.id, selectedMoshaf.id) ? "currentColor" : "none"} />
                    </button>
                    {/* Add to playlist button */}
                    <button
                      onClick={() => setShowAddToPlaylist(surah)}
                      className="p-1 rounded text-muted-foreground/30 hover:text-accent transition-colors shrink-0"
                      title="إضافة لقائمة تشغيل"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && selectedReciter && selectedMoshaf && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowAddToPlaylist(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-naskh text-sm font-bold text-foreground">إضافة سورة {showAddToPlaylist.name} إلى:</h3>
              <button onClick={() => setShowAddToPlaylist(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="p-3 max-h-60 overflow-y-auto space-y-1.5">
              {playlists.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground font-naskh py-4">لا توجد قوائم — أنشئ واحدة أولاً من تبويب "قوائم التشغيل"</p>
              ) : (
                playlists.map(pl => {
                  const isIn = pl.tracks.some(
                    t => t.surahId === showAddToPlaylist.id && t.reciterId === selectedReciter.id && t.moshafId === selectedMoshaf.id
                  );
                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        if (isIn) {
                          removeTrack(pl.id, showAddToPlaylist.id, selectedReciter.id, selectedMoshaf.id);
                          toast("تم الإزالة من " + pl.name);
                        } else {
                          addTrack(pl.id, {
                            surahId: showAddToPlaylist.id, surahName: showAddToPlaylist.name,
                            reciterId: selectedReciter.id, reciterName: selectedReciter.name,
                            moshafId: selectedMoshaf.id, moshafServer: selectedMoshaf.server,
                          });
                          toast.success("تمت الإضافة إلى " + pl.name);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-right ${
                        isIn ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"
                      }`}
                    >
                      <span className="text-lg">{pl.icon}</span>
                      <span className="flex-1 font-naskh text-sm text-foreground">{pl.name}</span>
                      {isIn ? <Check size={14} className="text-gold" /> : <Plus size={14} className="text-muted-foreground" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recitations;
