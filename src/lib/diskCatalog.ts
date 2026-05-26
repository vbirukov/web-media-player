import { getPlayerConfig } from "../playerConfig";
import type { Catalog, Track } from "../types/catalog";
import { inferMediaKind } from "./mediaKind";

type YandexItem = {
  type?: string;
  name?: string;
  path?: string;
  resource_id?: string;
  size?: number;
  modified?: string;
  mime_type?: string;
};

type YandexList = {
  name?: string;
  _embedded?: { items?: YandexItem[] };
};

const MEDIA_EXT = [
  ".mp3",
  ".m4a",
  ".ogg",
  ".wav",
  ".aac",
  ".flac",
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".mkv",
  ".md",
  ".txt",
  ".html",
  ".htm",
  ".markdown",
];

function isMediaFile(item: YandexItem): boolean {
  if (item.type !== "file") return false;
  const lower = String(item.name || "").toLowerCase();
  return MEDIA_EXT.some((ext) => lower.endsWith(ext));
}

function trackFromItem(
  item: YandexItem,
  folder: string,
  folderPath: string,
  section: string,
): Track {
  const fileName = String(item.name);
  return {
    id: String(item.resource_id || item.path),
    title: fileName.replace(/\.[^.]+$/, ""),
    fileName,
    folder,
    folderPath,
    section,
    path: String(item.path),
    size: item.size,
    modified: item.modified,
    mimeType: item.mime_type,
    kind: inferMediaKind({ fileName, mimeType: item.mime_type }),
  };
}

export async function fetchJson(url: string): Promise<YandexList> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<YandexList>;
}

async function listFolder(path: string): Promise<YandexItem[]> {
  const { apiRoot, publicDiskKey } = getPlayerConfig().catalog;
  const folderData = await fetchJson(
    `${apiRoot}?public_key=${encodeURIComponent(publicDiskKey)}&path=${encodeURIComponent(path)}&limit=500`,
  );
  return folderData._embedded?.items ?? [];
}

export async function buildDiskCatalog(): Promise<Catalog> {
  const { apiRoot, publicDiskKey } = getPlayerConfig().catalog;
  const root = await fetchJson(
    `${apiRoot}?public_key=${encodeURIComponent(publicDiskKey)}&limit=200`,
  );
  const topItems = (root._embedded?.items ?? []).filter(
    (item): item is YandexItem => item.type === "dir",
  );

  const tracks: Track[] = [];
  const folders = new Set<string>();
  const sections = new Set<string>();

  for (const top of topItems) {
    const topName = String(top.name);
    const topPath = String(top.path);
    try {
      const items = await listFolder(topPath);
      const subdirs = items.filter((item) => item.type === "dir");
      const files = items.filter(isMediaFile);

      if (subdirs.length > 0) {
        sections.add(topName);
        for (const sub of subdirs) {
          const folderName = String(sub.name);
          folders.add(folderName);
          try {
            const subItems = await listFolder(String(sub.path));
            for (const item of subItems.filter(isMediaFile)) {
              tracks.push(
                trackFromItem(item, folderName, String(sub.path), topName),
              );
            }
          } catch {
            /* subfolder */
          }
        }
      }

      for (const item of files) {
        const section = "Каталог";
        sections.add(section);
        folders.add(topName);
        tracks.push(trackFromItem(item, topName, topPath, section));
      }
    } catch {
      /* top folder */
    }
  }

  return {
    sourceTitle: root.name || "Библиотека",
    sections: [...sections].sort((a, b) => a.localeCompare(b, "ru")),
    folders: [...folders].sort((a, b) => a.localeCompare(b, "ru")),
    tracks,
    loaded: true,
  };
}
