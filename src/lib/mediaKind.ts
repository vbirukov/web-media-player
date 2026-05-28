import type { MediaKind, Track } from "../types/catalog";

const AUDIO_EXT = [".mp3", ".m4a", ".ogg", ".wav", ".aac", ".flac"];
const VIDEO_EXT = [
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".mkv",
  ".avi",
  ".mpeg",
  ".mpg",
  ".ts",
  ".m2ts",
  ".mts",
  ".wmv",
  ".flv",
  ".3gp",
  ".m3u8",
];
const TEXT_EXT = [".md", ".txt", ".html", ".htm", ".markdown"];

export type MediaKindFilter = MediaKind | "all";

function normalizeSourceName(value?: string): string {
  return (value ?? "").toLowerCase().split(/[?#]/, 1)[0] ?? "";
}

export function inferMediaKind(
  track: Pick<Track, "fileName" | "mimeType"> &
    Partial<Pick<Track, "path" | "url">>,
): MediaKind {
  const mime = (track.mimeType ?? "").toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("text/") || mime.includes("html")) return "text";

  const candidates = [
    normalizeSourceName(track.fileName),
    normalizeSourceName(track.path),
    normalizeSourceName(track.url),
  ];

  if (candidates.some((value) => VIDEO_EXT.some((ext) => value.endsWith(ext)))) {
    return "video";
  }
  if (candidates.some((value) => TEXT_EXT.some((ext) => value.endsWith(ext)))) {
    return "text";
  }
  if (candidates.some((value) => AUDIO_EXT.some((ext) => value.endsWith(ext)))) {
    return "audio";
  }
  return "audio";
}

export function trackKind(track: Track): MediaKind {
  const inferred = inferMediaKind(track);
  if (!track.kind) return inferred;
  if (track.kind === inferred) return track.kind;
  if (track.kind === "audio" && (inferred === "video" || inferred === "text")) {
    return inferred;
  }
  return track.kind;
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
