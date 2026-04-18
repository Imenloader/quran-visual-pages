import { useState, useCallback, useEffect } from "react";

export interface PlaylistTrack {
  surahId: number;
  surahName: string;
  reciterId: number;
  reciterName: string;
  moshafId: number;
  moshafServer: string;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
  isPreset?: boolean;
  tracks: PlaylistTrack[];
}

const STORAGE_KEY = "quran-playlists";

// Preset playlists with surah IDs only (tracks filled when a reciter is selected)
export const PRESET_PLAYLISTS: { id: string; name: string; icon: string; surahIds: number[] }[] = [
  {
    id: "short-surahs",
    name: "سور قصيرة",
    icon: "📖",
    surahIds: [93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
  },
  {
    id: "ruqyah",
    name: "الرقية الشرعية",
    icon: "🛡️",
    surahIds: [1, 2, 112, 113, 114],
  },
  {
    id: "friday",
    name: "سور يوم الجمعة",
    icon: "🕌",
    surahIds: [18, 32, 67],
  },
  {
    id: "before-sleep",
    name: "قبل النوم",
    icon: "🌙",
    surahIds: [32, 36, 56, 67, 112, 113, 114],
  },
];

const loadPlaylists = (): Playlist[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const savePlaylists = (items: Playlist[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPlaylists(loadPlaylists());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const createPlaylist = useCallback((name: string, icon: string = "🎵") => {
    const id = `custom-${Date.now()}`;
    const newPlaylist: Playlist = { id, name, icon, tracks: [] };
    setPlaylists(prev => {
      const next = [...prev, newPlaylist];
      savePlaylists(next);
      return next;
    });
    return id;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== id);
      savePlaylists(next);
      return next;
    });
  }, []);

  const addTrack = useCallback((playlistId: string, track: PlaylistTrack) => {
    setPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id !== playlistId) return p;
        const exists = p.tracks.some(
          t => t.surahId === track.surahId && t.reciterId === track.reciterId && t.moshafId === track.moshafId
        );
        if (exists) return p;
        return { ...p, tracks: [...p.tracks, track] };
      });
      savePlaylists(next);
      return next;
    });
  }, []);

  const removeTrack = useCallback((playlistId: string, surahId: number, reciterId: number, moshafId: number) => {
    setPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          tracks: p.tracks.filter(
            t => !(t.surahId === surahId && t.reciterId === reciterId && t.moshafId === moshafId)
          ),
        };
      });
      savePlaylists(next);
      return next;
    });
  }, []);

  const reorderTracks = useCallback((playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id !== playlistId) return p;
        const tracks = [...p.tracks];
        const [moved] = tracks.splice(fromIndex, 1);
        tracks.splice(toIndex, 0, moved);
        return { ...p, tracks };
      });
      savePlaylists(next);
      return next;
    });
  }, []);

  const isInPlaylist = useCallback((playlistId: string, surahId: number, reciterId: number, moshafId: number) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return false;
    return pl.tracks.some(t => t.surahId === surahId && t.reciterId === reciterId && t.moshafId === moshafId);
  }, [playlists]);

  return { playlists, createPlaylist, deletePlaylist, addTrack, removeTrack, reorderTracks, isInPlaylist };
};
