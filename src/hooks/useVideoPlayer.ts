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
        const url = await resolveTrackMediaUrl(track, patchTrackUrl);
        if (gen !== playGenerationRef.current) return;

        const video = videoRef.current;
        if (!video) throw new Error("no video element");

        video.src = url;
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

        if (opts?.startAtSec && opts.startAtSec > 0) {
          video.currentTime = opts.startAtSec;
        }

        if (gen !== playGenerationRef.current) return;
        playbackIntentRef.current = true;
        await video.play();
        if (gen !== playGenerationRef.current) return;
        setIsPlaying(true);
      } catch (e) {
        if (gen !== playGenerationRef.current) return;
        pushToast(formatPlaybackError(e));
        stop();
      } finally {
        if (gen === playGenerationRef.current) setIsLoading(false);
      }
    },
    [patchTrackUrl, pushToast, stop, user.playbackRate, user.volume],
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
