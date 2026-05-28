import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { formatPlaybackError } from "../lib/playbackErrors";
import { resolveTrackMediaUrl } from "../lib/resolveMediaUrl";
import {
  configureBackgroundVideoElement,
  useBackgroundPlayback,
} from "./useBackgroundPlayback";
import type { Track } from "../types/catalog";
import type { UserState } from "../types/user";

type ToastPush = (message: string) => void;

type Options = {
  patchTrackUrl: (trackId: string, url: string) => void;
  user: UserState;
  setUser: Dispatch<SetStateAction<UserState>>;
  pushToast: ToastPush;
};

function replaceExt(url: string, ext: string): string {
  const parts = url.split(/([?#].*)/, 2);
  const base = parts[0] ?? url;
  const suffix = parts[1] ?? "";
  const nextBase = base.replace(/\.[a-z0-9]{2,5}$/i, ext);
  return `${nextBase}${suffix}`;
}

function buildVideoCandidates(primaryUrl: string): string[] {
  const clean = primaryUrl.trim();
  if (!clean) return [];
  const h264 = replaceExt(clean, ".mp4");
  const tagged = h264.replace(/\.mp4([?#]|$)/i, "_h264.mp4$1");
  const normalized = clean.replace(/\\/g, "/");
  const fromMkv =
    /\.mkv([?#]|$)/i.test(normalized) || /\.avi([?#]|$)/i.test(normalized)
      ? [h264, tagged]
      : [tagged, h264];
  return Array.from(new Set([clean, ...fromMkv])).filter(Boolean);
}

function guessMimeFromUrl(url: string): string {
  const clean = url.toLowerCase().split(/[?#]/, 1)[0] ?? "";
  if (clean.endsWith(".mp4") || clean.endsWith(".m4v")) return "video/mp4";
  if (clean.endsWith(".webm")) return "video/webm";
  if (clean.endsWith(".mov")) return "video/quicktime";
  if (clean.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  return "video/mp4";
}

function canBrowserAttemptVideo(url: string, mimeType?: string): boolean {
  const probe = document.createElement("video");
  const mime = (mimeType ?? "").trim() || guessMimeFromUrl(url);
  if (!mime) return true;
  const verdict = probe.canPlayType(mime);
  return verdict === "probably" || verdict === "maybe";
}

async function ensureVideoFrames(video: HTMLVideoElement, timeoutMs = 2500) {
  if (video.videoWidth > 0 && video.videoHeight > 0) return;

  await new Promise<void>((resolve, reject) => {
    let done = false;
    const startedAt = performance.now();

    const cleanup = () => {
      if (done) return;
      done = true;
      video.removeEventListener("resize", onFrameSignal);
      video.removeEventListener("loadeddata", onFrameSignal);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onError);
    };

    const finishOk = () => {
      cleanup();
      resolve();
    };

    const finishError = () => {
      cleanup();
      reject(new Error("video-no-frames"));
    };

    const onFrameSignal = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) finishOk();
    };

    const onTimeUpdate = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        finishOk();
        return;
      }
      if (performance.now() - startedAt > timeoutMs && video.currentTime > 0.3) {
        finishError();
      }
    };

    const onError = () => finishError();

    video.addEventListener("resize", onFrameSignal);
    video.addEventListener("loadeddata", onFrameSignal);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("error", onError);

    window.setTimeout(() => {
      if (!done && video.videoWidth === 0 && video.videoHeight === 0) finishError();
    }, timeoutMs);
  });
}

export function useVideoPlayer({
  patchTrackUrl,
  user,
  setUser,
  pushToast,
}: Options) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playGenerationRef = useRef(0);
  const playbackIntentRef = useRef(false);

  const bindVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoEl(el);
    if (el) configureBackgroundVideoElement(el);
  }, []);

  useBackgroundPlayback(videoEl, playbackIntentRef);

  const persistProgress = useCallback(
    (trackId: string, position: number, duration: number) => {
      setUser((prev) => ({
        ...prev,
        lastTrackId: trackId,
        progress: {
          ...prev.progress,
          [trackId]: {
            position,
            duration,
            completed: duration > 0 && position / duration >= 0.92,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [setUser],
  );

  const resolveResumeSec = useCallback(
    (trackId: string, duration: number, explicitStart?: number) => {
      if (Number.isFinite(explicitStart) && (explicitStart ?? 0) > 0) {
        return explicitStart as number;
      }
      const saved = user.progress[trackId];
      if (!saved || saved.completed) return 0;
      const savedPos = Number(saved.position ?? 0);
      if (!Number.isFinite(savedPos) || savedPos <= 0) return 0;
      const maxDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
      if (!maxDuration) return Math.max(0, savedPos);
      return Math.max(0, Math.min(savedPos, Math.max(0, maxDuration - 0.25)));
    },
    [user.progress],
  );

  const stop = useCallback(() => {
    playGenerationRef.current += 1;
    const video = videoRef.current;
    if (video) {
      playbackIntentRef.current = false;
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    setCurrentTrackId(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const playTrack = useCallback(
    async (track: Track, opts?: { startAtSec?: number }) => {
      const gen = ++playGenerationRef.current;
      setCurrentTrackId(track.id);
      setCurrentTrack(track);
      setIsLoading(true);
      setIsPlaying(false);

      try {
        const primaryUrl = await resolveTrackMediaUrl(track, patchTrackUrl);
        if (gen !== playGenerationRef.current) return;

        const video = videoRef.current;
        if (!video) throw new Error("no video element");
        const candidates = buildVideoCandidates(primaryUrl);
        let started = false;
        let lastError: unknown = null;

        for (const candidate of candidates) {
          if (gen !== playGenerationRef.current) return;
          if (!canBrowserAttemptVideo(candidate)) continue;

          try {
            video.src = candidate;
            video.playbackRate = user.playbackRate;
            video.volume = user.volume;

            await new Promise<void>((resolve, reject) => {
              const onMeta = () => {
                cleanup();
                resolve();
              };
              const onErr = () => {
                cleanup();
                reject(new Error("metadata"));
              };
              const cleanup = () => {
                video.removeEventListener("loadedmetadata", onMeta);
                video.removeEventListener("error", onErr);
              };
              video.addEventListener("loadedmetadata", onMeta);
              video.addEventListener("error", onErr);
              video.load();
            });

            const resumeAtSec = resolveResumeSec(
              track.id,
              video.duration || 0,
              opts?.startAtSec,
            );
            if (resumeAtSec > 0) {
              video.currentTime = resumeAtSec;
            }

            playbackIntentRef.current = true;
            await video.play();
            await ensureVideoFrames(video);
            patchTrackUrl(track.id, candidate);
            started = true;
            break;
          } catch (e) {
            lastError = e;
            playbackIntentRef.current = false;
            video.pause();
            video.removeAttribute("src");
            video.load();
          }
        }

        if (gen !== playGenerationRef.current) return;
        if (!started) throw (lastError ?? new Error("video-source-unavailable"));
        setIsPlaying(true);
      } catch (e) {
        if (gen !== playGenerationRef.current) return;
        if (e instanceof Error && e.message === "video-no-frames") {
          pushToast(
            "Видео-дорожка не декодируется в браузере (чёрный экран при звуке). Перекодируй в MP4 H.264 + AAC.",
          );
        } else {
          pushToast(formatPlaybackError(e));
        }
        stop();
      } finally {
        if (gen === playGenerationRef.current) setIsLoading(false);
      }
    },
    [patchTrackUrl, pushToast, resolveResumeSec, stop, user.playbackRate, user.volume],
  );

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !currentTrack) return;
    if (video.paused) {
      try {
        playbackIntentRef.current = true;
        await video.play();
        setIsPlaying(true);
      } catch (e) {
        playbackIntentRef.current = false;
        pushToast(formatPlaybackError(e));
      }
    } else {
      playbackIntentRef.current = false;
      video.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, pushToast]);

  const seek = useCallback((sec: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, sec));
  }, []);

  const seekBy = useCallback((deltaSec: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, (video.currentTime || 0) + deltaSec),
    );
  }, []);

  const setVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, value));
  }, []);

  useEffect(() => {
    const video = videoEl;
    if (!video || !currentTrackId) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      if (!video.ended) playbackIntentRef.current = false;
    };
    const onTimeUpdate = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      persistProgress(currentTrackId, video.currentTime, video.duration);
    };
    const onEnded = () => {
      persistProgress(currentTrackId, video.duration, video.duration);
      setIsPlaying(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [currentTrackId, persistProgress, videoEl]);

  return {
    currentTrackId,
    currentTrack,
    isPlaying,
    isLoading,
    videoRef,
    bindVideoRef,
    playTrack,
    togglePlay,
    seek,
    seekBy,
    setVolume,
    stop,
  };
}
