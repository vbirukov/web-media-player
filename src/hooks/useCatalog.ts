import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ymGoal } from "../lib/metrika";
import {
  isCatalogRefreshDue,
  loadCachedCatalog,
  markCatalogRefreshed,
  saveCachedCatalog,
} from "../lib/catalogCache";
import { getPlayerConfig } from "../playerConfig";
import { catalogWithServerMediaUrls } from "../lib/serverMediaCatalog";
import { useServerMedia } from "../lib/mediaUrl";
import { runCatalogWorker } from "../lib/catalogWorker";
import { listenStatus, matchesFeedListenFilter } from "../lib/listenStatus";
import { matchesMediaKindFilter, trackKind, type MediaKindFilter } from "../lib/mediaKind";
import { normalizeCatalog } from "../lib/normalizeCatalog";
import { pickAdjacentId, shuffleIds, shuffleIdsLeading } from "../lib/queue";
import {
  buildBreadcrumbs,
  buildFolderFeedEntries,
  feedScopeToFolderNames,
  resolveFeedMode,
  sectionEntriesForScope,
  sortTracksForCatalog,
  trackMatchesFeedScope,
} from "../lib/feedNavigation";
import type { Catalog, Track } from "../types/catalog";
import type { FeedScope } from "../types/navigation";
import type { FeedListenFilter, LibraryView, UserState } from "../types/user";

type Filters = {
  view: LibraryView;
  feedScope: FeedScope;
  /** @deprecated — используй feedScope; оставлено для flat/legacy */
  feedFolderFilter?: string[];
  selectedPlaylist: string | null;
  feedListenFilter: FeedListenFilter;
  mediaKindFilter: MediaKindFilter;
  leadTrackIdRef?: RefObject<string | null>;
};

function resolveLeadId(
  filteredIds: string[],
  leadRef: RefObject<string | null> | undefined,
  lastTrackId: string | null,
): string | null {
  const fromRef = leadRef?.current;
  if (fromRef && filteredIds.includes(fromRef)) return fromRef;
  if (lastTrackId && filteredIds.includes(lastTrackId)) return lastTrackId;
  return null;
}

function legacyFolderFilter(scope: FeedScope, legacy?: string[]): string[] {
  const fromScope = feedScopeToFolderNames(scope);
  if (fromScope.length) return fromScope;
  return legacy ?? [];
}

export function useCatalog(user: UserState, filters: Filters) {
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const cached = loadCachedCatalog();
    const base = cached?.tracks.length
      ? cached
      : getPlayerConfig().getFallbackCatalog();
    return catalogWithServerMediaUrls(
      normalizeCatalog({ ...base, sections: base.sections ?? [] }),
    );
  });
  const [initialLoading, setInitialLoading] = useState(() => !loadCachedCatalog()?.tracks.length);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const catalogReportedRef = useRef(false);
  const refreshInFlightRef = useRef(false);

  const folderFilter = useMemo(
    () => legacyFolderFilter(filters.feedScope, filters.feedFolderFilter),
    [filters.feedFolderFilter, filters.feedScope],
  );

  const feedMode = useMemo(
    () => resolveFeedMode(filters.view, filters.feedScope),
    [filters.feedScope, filters.view],
  );

  const applyCatalog = useCallback((cat: Catalog) => {
    const prepared = catalogWithServerMediaUrls(normalizeCatalog(cat));
    setCatalog(prepared);
    saveCachedCatalog(prepared);
    markCatalogRefreshed();
    if (!catalogReportedRef.current) {
      catalogReportedRef.current = true;
      ymGoal("catalog_loaded", { track_count: prepared.tracks.length });
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    const cat = await runCatalogWorker();
    return cat?.tracks.length ? cat : null;
  }, []);

  const refreshCatalog = useCallback(
    async (opts?: { background?: boolean }) => {
      if (refreshInFlightRef.current) return null;
      refreshInFlightRef.current = true;
      if (!opts?.background) setLoadingCatalog(true);
      try {
        const cat = await fetchCatalog();
        if (cat) applyCatalog(cat);
        return cat;
      } finally {
        refreshInFlightRef.current = false;
        if (!opts?.background) setLoadingCatalog(false);
      }
    },
    [applyCatalog, fetchCatalog],
  );

  useEffect(() => {
    const hasCache = Boolean(loadCachedCatalog()?.tracks.length);
    void (async () => {
      try {
        if (!isCatalogRefreshDue()) return;
        await refreshCatalog({ background: hasCache });
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [refreshCatalog]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!isCatalogRefreshDue()) return;
      void refreshCatalog({ background: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshCatalog]);

  const patchTrackUrl = useCallback((trackId: string, url: string) => {
    setCatalog((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, url } : t)),
    }));
  }, []);

  const progressOf = useCallback(
    (id: string) =>
      user.progress[id] ?? {
        position: 0,
        duration: 0,
        completed: false,
        updatedAt: null,
      },
    [user.progress],
  );

  const trackMap = useMemo(
    () => new Map(catalog.tracks.map((t) => [t.id, t])),
    [catalog.tracks],
  );

  const filteredTracks = useMemo(() => {
    let list: Track[] = [...catalog.tracks];

    if (feedMode !== "tracks") {
      list = [];
    } else {
      list = list.filter((t) =>
        trackMatchesFeedScope(t, filters.feedScope, filters.view),
      );
    }

    if (filters.view === "liked") {
      list = list.filter((t) => user.likes[t.id]);
    }
    if (filters.view === "resume") {
      list = list.filter(
        (t) => listenStatus(progressOf(t.id)) === "in-progress",
      );
    }
    if (filters.view === "playlist" && filters.selectedPlaylist) {
      const pl = user.playlists.find((p) => p.id === filters.selectedPlaylist);
      const ids = new Set(pl?.trackIds ?? []);
      list = list.filter((t) => ids.has(t.id));
    }
    if (
      filters.feedListenFilter !== "all" &&
      filters.view !== "resume"
    ) {
      list = list.filter((t) =>
        matchesFeedListenFilter(progressOf(t.id), filters.feedListenFilter),
      );
    }
    list = list.filter((t) =>
      matchesMediaKindFilter(t, filters.mediaKindFilter),
    );
    return list;
  }, [
    catalog.tracks,
    feedMode,
    filters.feedListenFilter,
    filters.feedScope,
    filters.mediaKindFilter,
    filters.selectedPlaylist,
    filters.view,
    progressOf,
    user.likes,
    user.playlists,
  ]);

  const sectionEntries = useMemo(() => {
    if (feedMode !== "sections") return undefined;
    return sectionEntriesForScope(catalog, filters.mediaKindFilter);
  }, [catalog, feedMode, filters.mediaKindFilter]);

  const folderEntries = useMemo(() => {
    if (feedMode !== "folders") return undefined;
    if (filters.feedScope.level !== "section") return undefined;
    return buildFolderFeedEntries(
      catalog,
      filters.feedScope.sectionId,
      filters.mediaKindFilter,
    );
  }, [catalog, feedMode, filters.feedScope, filters.mediaKindFilter]);

  const audioFilteredTracks = useMemo(
    () => filteredTracks.filter((t) => trackKind(t) === "audio"),
    [filteredTracks],
  );

  const sortTracks = useCallback(
    (list: Track[]) => sortTracksForCatalog(list, catalog),
    [catalog],
  );

  const filteredIds = useMemo(
    () => audioFilteredTracks.map((t) => t.id),
    [audioFilteredTracks],
  );

  const filteredIdKey = filteredIds.join("\u0001");

  const shuffleOnRef = useRef(user.shuffle);
  useEffect(() => {
    const wasShuffle = shuffleOnRef.current;
    shuffleOnRef.current = user.shuffle;

    if (!user.shuffle) {
      setQueue(sortTracks(audioFilteredTracks).map((t) => t.id));
      return;
    }

    if (!wasShuffle && user.shuffle) {
      const lead = resolveLeadId(
        filteredIds,
        filters.leadTrackIdRef,
        user.lastTrackId,
      );
      setQueue(shuffleIdsLeading(lead, filteredIds));
      return;
    }

    setQueue((prev) => {
      const allowed = new Set(filteredIds);
      const kept = prev.filter((id) => allowed.has(id));
      const added = filteredIds.filter((id) => !kept.includes(id));
      if (!prev.length || kept.length !== prev.length) {
        const lead = resolveLeadId(
          filteredIds,
          filters.leadTrackIdRef,
          user.lastTrackId,
        );
        return shuffleIdsLeading(lead, filteredIds);
      }
      if (!added.length) return kept;
      return [...kept, ...shuffleIds(added)];
    });
  }, [
    audioFilteredTracks,
    filteredIdKey,
    filteredIds,
    filters.leadTrackIdRef,
    sortTracks,
    user.shuffle,
  ]);

  const trackById = useMemo(
    () => new Map(filteredTracks.map((t) => [t.id, t])),
    [filteredTracks],
  );

  const tracks = useMemo(() => {
    if (!user.shuffle) return sortTracks(filteredTracks);
    return queue
      .map((id) => trackById.get(id))
      .filter((t): t is Track => t != null);
  }, [filteredTracks, queue, sortTracks, trackById, user.shuffle]);

  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks]);

  const resumeCount = useMemo(
    () =>
      catalog.tracks.filter(
        (t) => listenStatus(progressOf(t.id)) === "in-progress",
      ).length,
    [catalog.tracks, progressOf],
  );

  const resumeTrack = useMemo(() => {
    const resume = user.playlists.find((p) => p.id === "resume");
    for (const id of resume?.trackIds ?? []) {
      const track = trackMap.get(id);
      if (!track) continue;
      if (listenStatus(progressOf(id)) === "in-progress") return track;
    }
    return (
      catalog.tracks.find(
        (t) => listenStatus(progressOf(t.id)) === "in-progress",
      ) ?? null
    );
  }, [catalog.tracks, progressOf, trackMap, user.playlists]);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(filters.feedScope, catalog),
    [catalog, filters.feedScope],
  );

  const sectionTitle = useMemo(() => {
    const scope = filters.feedScope;
    if (scope.level === "folder") return scope.folder;
    if (scope.level === "section") return scope.sectionId;
    if (scope.level === "selection") {
      return scope.folders.length === 1
        ? scope.folders[0]!.folder
        : `Выборка · ${scope.folders.length} серий`;
    }
    if (folderFilter.length === 1) return folderFilter[0]!;
    if (folderFilter.length > 1) return `Выборка · ${folderFilter.length} серий`;
    if (filters.view === "resume") return "Продолжить прослушивание";
    if (filters.view === "liked") return "Лайки";
    if (filters.view === "playlist") {
      return `Плейлист: ${user.playlists.find((p) => p.id === filters.selectedPlaylist)?.name ?? ""}`;
    }
    if (feedMode === "sections") return "Каталог";
    if (feedMode === "folders") {
      return scope.level === "section" ? scope.sectionId : "Каталог";
    }
    return "Каталог";
  }, [
    feedMode,
    folderFilter,
    filters.feedScope,
    filters.selectedPlaylist,
    filters.view,
    user.playlists,
  ]);

  const sectionSub = useMemo(() => {
    const scope = filters.feedScope;
    if (feedMode === "sections") {
      const n = sectionEntries?.length ?? 0;
      return `${n} разделов · выберите серию или папку.`;
    }
    if (feedMode === "folders" && scope.level === "section") {
      const n = folderEntries?.length ?? 0;
      return `${n} папок в разделе.`;
    }
    if (scope.level === "folder") return "Материалы выбранной папки.";
    if (scope.level === "selection") {
      return `${filteredTracks.length} материалов в выборке.`;
    }
    if (folderFilter.length === 1) return "Материалы выбранного раздела.";
    if (folderFilter.length > 1) {
      return `${filteredTracks.length} материалов в выборке.`;
    }
    if (filters.mediaKindFilter !== "all") {
      return `Фильтр: ${filters.mediaKindFilter}.`;
    }
    return useServerMedia()
      ? "Каталог с сервера: аудио, видео и тексты."
      : catalog.loaded
        ? "Индекс публичной папки Яндекс.Диска."
        : "Fallback до полной индексации каталога.";
  }, [
    catalog.loaded,
    feedMode,
    filteredTracks.length,
    folderEntries?.length,
    folderFilter.length,
    filters.feedScope,
    filters.mediaKindFilter,
    sectionEntries?.length,
  ]);

  const nextTrackId = useCallback(
    (currentTrackId: string | null) => {
      if (!user.shuffle || !queue.length) return null;
      return pickAdjacentId(queue, currentTrackId, 1, user.repeatMode);
    },
    [queue, user.repeatMode, user.shuffle],
  );

  return {
    catalog,
    setCatalog,
    catalogLoading: initialLoading || loadingCatalog,
    patchTrackUrl,
    trackMap,
    tracks,
    trackIds,
    queue,
    nextTrackId,
    resumeCount,
    resumeTrack,
    sectionTitle,
    sectionSub,
    feedMode,
    folderEntries,
    sectionEntries,
    breadcrumbs,
    feedFolderFilter: folderFilter,
  };
}
