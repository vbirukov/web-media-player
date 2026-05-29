import {
  albumSharePagePath,
  albumSharePageUrl,
  catalogSharePageUrl,
  resolveSiteOrigin,
  shareDescriptionForCatalog,
  shareDescriptionForFolder,
  shareTitleForCatalog,
  shareTitleForFolder,
  utf8ShareSlug,
} from "./shareOg";
import { shareViaWebOrClipboard, type ShareLinkResult } from "./shareLink";

export type { ShareLinkResult };

export function buildFolderShareUrl(folder: string, sectionId?: string): string {
  if (!sectionId?.trim()) {
    return albumSharePageUrl(folder, resolveSiteOrigin());
  }
  const origin = resolveSiteOrigin();
  const base = (origin || "http://localhost").replace(/\/$/, "");
  const url = new URL(albumSharePagePath(folder), `${base}/`);
  url.searchParams.set("section", utf8ShareSlug(sectionId.trim()));
  return url.href;
}

export function buildCatalogShareUrl(): string {
  return catalogSharePageUrl(resolveSiteOrigin());
}

export async function shareFolder(opts: {
  folder: string;
  trackCount: number;
  sectionId?: string;
}): Promise<ShareLinkResult> {
  const url = buildFolderShareUrl(opts.folder, opts.sectionId);
  const title = shareTitleForFolder(opts.folder);
  const text = shareDescriptionForFolder(opts.folder, opts.trackCount);
  return shareViaWebOrClipboard({
    title,
    text,
    url,
    promptLabel: "Ссылка на альбом:",
  });
}

export async function shareCatalog(opts: {
  trackCount: number;
  albumCount?: number;
}): Promise<ShareLinkResult> {
  const url = buildCatalogShareUrl();
  const title = shareTitleForCatalog();
  const text = shareDescriptionForCatalog(opts.trackCount, opts.albumCount);
  return shareViaWebOrClipboard({
    title,
    text,
    url,
    promptLabel: "Ссылка на каталог:",
  });
}
