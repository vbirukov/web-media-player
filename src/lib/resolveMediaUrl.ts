import { fetchDiskDownloadHref, isStubTrack } from "./diskDownload";
import { mediaUrlForPath, useServerMedia } from "./mediaUrl";
import type { Track } from "../types/catalog";

export async function resolveTrackMediaUrl(
  track: Track,
  patchTrackUrl?: (trackId: string, url: string) => void,
): Promise<string> {
  if (isStubTrack(track)) throw new Error("stub");
  if (track.url) return track.url;
  if (useServerMedia()) {
    const url = mediaUrlForPath(track.path);
    patchTrackUrl?.(track.id, url);
    return url;
  }
  const url = await fetchDiskDownloadHref(track.path);
  patchTrackUrl?.(track.id, url);
  return url;
}
