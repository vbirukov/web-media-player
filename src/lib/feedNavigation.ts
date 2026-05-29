import {
  buildCatalogSections,
  resolveTrackSection,
  type CatalogSectionNav,
  type SectionFolder,
} from "./catalogSections";
import { folderShareSlug, utf8ShareSlug } from "./shareOg";
import { getPlayerConfig, type CatalogNavigationConfig } from "../playerConfig";
import type { Catalog, Track } from "../types/catalog";
import type {
  BreadcrumbItem,
  FeedMode,
  FeedScope,
  FolderRef,
} from "../types/navigation";

export type { FeedScope, FolderRef, BreadcrumbItem, FeedMode };

export type FolderFeedEntry = SectionFolder & {
  sectionId: string;
  folderPath?: string;
};

export function getCatalogNavigationConfig(): Required<CatalogNavigationConfig> {
  const cfg = getPlayerConfig().catalogNavigation;
  return {
    mode: cfg?.mode ?? "hierarchical",
    catalogRoot: cfg?.catalogRoot ?? "sections",
    sectionView: cfg?.sectionView ?? "folder-cards",
  };
}

export function isHierarchicalNavigation(): boolean {
  return getCatalogNavigationConfig().mode === "hierarchical";
}

export function folderRefFromTrack(track: Track): FolderRef {
  return {
    sectionId: resolveTrackSection(track),
    folder: track.folder,
    folderPath: track.folderPath || undefined,
  };
}

export function matchTrackToFolderRef(track: Track, ref: FolderRef): boolean {
  if (resolveTrackSection(track) !== ref.sectionId) return false;
  if (ref.folderPath?.trim()) {
    const path = (track.folderPath || track.folder).replace(/\\/g, "/");
    const want = ref.folderPath.replace(/\\/g, "/");
    return (
      path === want ||
      path.endsWith(`/${want}`) ||
      path.endsWith(want) ||
      path.includes(want)
    );
  }
  return track.folder === ref.folder;
}

export function resolveSectionForFolderName(
  catalog: Catalog,
  folder: string,
): string | null {
  const sections = new Set<string>();
  for (const t of catalog.tracks) {
    if (t.folder === folder) sections.add(resolveTrackSection(t));
  }
  if (sections.size === 1) return [...sections][0]!;
  return null;
}

export function feedScopeToFolderNames(scope: FeedScope): string[] {
  if (scope.level === "folder") return [scope.folder];
  if (scope.level === "selection") return scope.folders.map((f) => f.folder);
  return [];
}

export function scopeUsesHierarchicalFeed(
  view: string,
  scope: FeedScope,
): boolean {
  if (!isHierarchicalNavigation()) return false;
  if (view !== "all") return false;
  if (scope.level === "selection") return false;
  return true;
}

export function resolveFeedMode(
  view: string,
  scope: FeedScope,
): FeedMode {
  const cfg = getCatalogNavigationConfig();
  if (!scopeUsesHierarchicalFeed(view, scope)) return "tracks";
  if (scope.level === "catalog") {
    return cfg.catalogRoot === "flat-tracks" ? "tracks" : "sections";
  }
  if (scope.level === "section") {
    return cfg.sectionView === "tracks-with-headers" ? "tracks" : "folders";
  }
  return "tracks";
}

export function trackMatchesFeedScope(
  track: Track,
  scope: FeedScope,
  view: string,
): boolean {
  if (!scopeUsesHierarchicalFeed(view, scope)) {
    const names = feedScopeToFolderNames(scope);
    if (!names.length) return true;
    return names.includes(track.folder);
  }

  const mode = resolveFeedMode(view, scope);
  switch (scope.level) {
    case "catalog":
      return mode === "tracks";
    case "section":
      return (
        mode === "tracks" && resolveTrackSection(track) === scope.sectionId
      );
    case "folder":
      return matchTrackToFolderRef(track, {
        sectionId: scope.sectionId,
        folder: scope.folder,
        folderPath: scope.folderPath,
      });
    case "selection":
      return scope.folders.some((ref) => matchTrackToFolderRef(track, ref));
    default:
      return true;
  }
}

export function buildFolderFeedEntries(
  catalog: Catalog,
  sectionId: string,
  kindFilter: import("./mediaKind").MediaKindFilter = "all",
): FolderFeedEntry[] {
  const section = buildCatalogSections(catalog, kindFilter).find(
    (s) => s.id === sectionId,
  );
  if (!section) return [];
  return section.folders.map((f) => ({
    ...f,
    sectionId,
    folderPath: f.name,
  }));
}

export function buildBreadcrumbs(
  scope: FeedScope,
  catalog: Catalog,
): BreadcrumbItem[] {
  const root: BreadcrumbItem = { label: "Каталог", scope: { level: "catalog" } };
  if (scope.level === "catalog") return [root];

  if (scope.level === "section") {
    return [
      root,
      { label: scope.sectionId, scope: { level: "section", sectionId: scope.sectionId } },
    ];
  }

  if (scope.level === "folder") {
    return [
      root,
      {
        label: scope.sectionId,
        scope: { level: "section", sectionId: scope.sectionId },
      },
      {
        label: scope.folder,
        scope: {
          level: "folder",
          sectionId: scope.sectionId,
          folder: scope.folder,
          folderPath: scope.folderPath,
        },
      },
    ];
  }

  const label =
    scope.folders.length === 1
      ? scope.folders[0]!.folder
      : `Выборка · ${scope.folders.length}`;
  return [root, { label, scope }];
}

export function feedScopeParent(scope: FeedScope): FeedScope {
  switch (scope.level) {
    case "folder":
      return { level: "section", sectionId: scope.sectionId };
    case "section":
    case "selection":
      return { level: "catalog" };
    default:
      return { level: "catalog" };
  }
}

export function feedScopeToUrlParams(scope: FeedScope): URLSearchParams {
  const params = new URLSearchParams();
  if (scope.level === "section") {
    params.set("section", utf8ShareSlug(scope.sectionId));
  } else if (scope.level === "folder") {
    params.set("section", utf8ShareSlug(scope.sectionId));
    params.set("album", folderShareSlug(scope.folder));
  }
  return params;
}

export function syncFeedScopeToLocation(scope: FeedScope, view: string) {
  if (typeof window === "undefined") return;
  if (view !== "all") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("section");
  url.searchParams.delete("album");
  url.searchParams.delete("catalog");
  const next = feedScopeToUrlParams(scope);
  for (const [k, v] of next.entries()) url.searchParams.set(k, v);
  if (scope.level === "catalog") url.searchParams.set("catalog", "1");
  const qs = url.searchParams.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `${url.pathname}?${qs}${url.hash}` : `${url.pathname}${url.hash}`,
  );
}

export function sectionEntriesForScope(
  catalog: Catalog,
  kindFilter: import("./mediaKind").MediaKindFilter,
): CatalogSectionNav[] {
  return buildCatalogSections(catalog, kindFilter);
}

export function sortTracksForCatalog(
  list: Track[],
  catalog: Catalog,
): Track[] {
  const order = new Map(catalog.sections.map((id, i) => [id, i]));
  return [...list].sort((a, b) => {
    const sa = order.get(resolveTrackSection(a)) ?? 9999;
    const sb = order.get(resolveTrackSection(b)) ?? 9999;
    if (sa !== sb) return sa - sb;
    const fc = a.folder.localeCompare(b.folder, "ru");
    if (fc !== 0) return fc;
    return a.title.localeCompare(b.title, "ru");
  });
}
