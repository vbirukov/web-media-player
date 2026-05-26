import type { MediaKind, Track } from "../types/catalog";

const AUDIO_EXT = [".mp3", ".m4a", ".ogg", ".wav", ".aac", ".flac"];
const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v", ".mkv"];
const TEXT_EXT = [".md", ".txt", ".html", ".htm", ".markdown"];

export type MediaKindFilter = MediaKind | "all";

export function inferMediaKind(track: Pick<Track, "fileName" | "mimeType">): MediaKind {
  const mime = (track.mimeType ?? "").toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("text/") || mime.includes("html")) return "text";

  const lower = track.fileName.toLowerCase();
  if (VIDEO_EXT.some((ext) => lower.endsWith(ext))) return "video";
  if (TEXT_EXT.some((ext) => lower.endsWith(ext))) return "text";
  if (AUDIO_EXT.some((ext) => lower.endsWith(ext))) return "audio";
  return "audio";
}

export function trackKind(track: Track): MediaKind {
  return track.kind ?? inferMediaKind(track);
}

export function matchesMediaKindFilter(
  track: Track,
  filter: MediaKindFilter,
): boolean {
  if (filter === "all") return true;
  return trackKind(track) === filter;
}

export const mediaKindLabel: Record<MediaKind, string> = {
  audio: "Аудио",
  video: "Видео",
  text: "Текст",
};

export function mediaActionLabel(kind: MediaKind, playing: boolean): string {
  if (kind === "video") return playing ? "Пауза" : "Смотреть";
  if (kind === "text") return "Читать";
  return playing ? "Пауза" : "Слушать";
}
