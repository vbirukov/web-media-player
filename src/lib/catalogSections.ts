import { trackKind, type MediaKindFilter } from "./mediaKind";
import type { Catalog, Track } from "../types/catalog";

export type SectionFolder = {
  name: string;
  trackCount: number;
  kinds: { audio: number; video: number; text: number };
};

export type CatalogSectionNav = {
  id: string;
  title: string;
  folders: SectionFolder[];
  trackCount: number;
};

export function resolveTrackSection(track: Track): string {
  if (track.section?.trim()) return track.section.trim();
  const parts = track.folder.split(/[/\\|—–-]+/).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[0]! : "Каталог";
}

export function buildCatalogSections(
  catalog: Catalog,
  kindFilter: MediaKindFilter = "all",
): CatalogSectionNav[] {
  const bySection = new Map<string, Map<string, SectionFolder>>();

  for (const track of catalog.tracks) {
    if (kindFilter !== "all" && trackKind(track) !== kindFilter) continue;
    const sectionId = resolveTrackSection(track);
    let folders = bySection.get(sectionId);
    if (!folders) {
      folders = new Map();
      bySection.set(sectionId, folders);
    }
    let folder = folders.get(track.folder);
    if (!folder) {
      folder = {
        name: track.folder,
        trackCount: 0,
        kinds: { audio: 0, video: 0, text: 0 },
      };
      folders.set(track.folder, folder);
    }
    folder.trackCount += 1;
    folder.kinds[trackKind(track)] += 1;
  }

  const sectionIds =
    catalog.sections.length > 0
      ? [
          ...catalog.sections.filter((id) => bySection.has(id)),
          ...[...bySection.keys()].filter((id) => !catalog.sections.includes(id)),
        ]
      : [...bySection.keys()].sort((a, b) => a.localeCompare(b, "ru"));

  return sectionIds.map((id) => {
    const folders = [...(bySection.get(id)?.values() ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name, "ru"),
    );
    return {
      id,
      title: id,
      folders,
      trackCount: folders.reduce((n, f) => n + f.trackCount, 0),
    };
  });
}

export function catalogKindCounts(catalog: Catalog) {
  const counts = { audio: 0, video: 0, text: 0 };
  for (const track of catalog.tracks) {
    counts[trackKind(track)] += 1;
  }
  return counts;
}
