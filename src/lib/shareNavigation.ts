import { folderFromShareSlug, utf8FromShareSlug } from "./shareOg";
import { resolveSectionForFolderName } from "./feedNavigation";
import type { Catalog } from "../types/catalog";

export type AppEntryParams =
  | { kind: "track"; trackId: string; startAtSec?: number }
  | { kind: "section"; sectionId: string }
  | { kind: "folder"; sectionId: string; folder: string }
  | { kind: "catalog" }
  | { kind: "none" };

export function parseAppEntryParams(
  catalog?: Pick<Catalog, "tracks">,
): AppEntryParams {
  const params = new URLSearchParams(window.location.search);

  const trackId = params.get("track")?.trim() || null;
  if (trackId) {
    const tRaw = params.get("t");
    let startAtSec: number | undefined;
    if (tRaw != null && tRaw !== "") {
      const t = parseInt(tRaw, 10);
      if (Number.isFinite(t) && t >= 0) startAtSec = t;
    }
    return { kind: "track", trackId, startAtSec };
  }

  const sectionSlug = params.get("section")?.trim();
  const albumSlug = params.get("album")?.trim();
  const sectionId = sectionSlug ? utf8FromShareSlug(sectionSlug) : null;

  if (albumSlug) {
    const folder = folderFromShareSlug(albumSlug);
    if (folder) {
      const resolvedSection =
        sectionId ??
        (catalog ? resolveSectionForFolderName(catalog as Catalog, folder) : null);
      if (resolvedSection) {
        return { kind: "folder", sectionId: resolvedSection, folder };
      }
      return { kind: "folder", sectionId: sectionId ?? "Каталог", folder };
    }
  }

  if (sectionId) return { kind: "section", sectionId };

  if (params.get("catalog") === "1") return { kind: "catalog" };

  return { kind: "none" };
}

export function clearAppEntryParams() {
  const url = new URL(window.location.href);
  const keys = ["track", "t", "album", "catalog", "section"] as const;
  let changed = false;
  for (const key of keys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (!changed) return;
  const qs = url.searchParams.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `${url.pathname}?${qs}${url.hash}` : `${url.pathname}${url.hash}`,
  );
}
