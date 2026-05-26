import { resolveTrackSection } from "./catalogSections";
import { inferMediaKind } from "./mediaKind";
import type { Catalog } from "../types/catalog";

export function normalizeCatalog(cat: Catalog): Catalog {
  const tracks = cat.tracks.map((t) => ({
    ...t,
    kind: t.kind ?? inferMediaKind(t),
    section: t.section ?? resolveTrackSection(t),
  }));
  const sections =
    cat.sections?.length > 0
      ? cat.sections
      : [...new Set(tracks.map((t) => t.section!))].sort((a, b) =>
          a.localeCompare(b, "ru"),
        );
  const folders =
    cat.folders?.length > 0
      ? cat.folders
      : [...new Set(tracks.map((t) => t.folder))].sort((a, b) =>
          a.localeCompare(b, "ru"),
        );
  return { ...cat, sections, folders, tracks };
}
