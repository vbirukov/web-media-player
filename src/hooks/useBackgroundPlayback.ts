import { useEffect, type RefObject } from "react";

function syncMediaSessionPlaying() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
}

/** Держит воспроизведение при блокировке экрана / уходе вкладки в фон. */
export function useBackgroundPlayback(
  media: HTMLMediaElement | null,
  playbackIntentRef: RefObject<boolean>,
) {
  useEffect(() => {
    if (!media) return;

    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const tryResume = () => {
      if (!playbackIntentRef.current || !media.paused || media.ended) return;
      syncMediaSessionPlaying();
      void media.play().catch(() => {});
    };

    const scheduleRetries = () => {
      clearTimeout(retryTimer);
      tryResume();
      retryTimer = setTimeout(tryResume, 400);
      setTimeout(tryResume, 1200);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") scheduleRetries();
    };

    const onPageHide = () => scheduleRetries();

    const onPause = () => {
      if (document.visibilityState === "hidden" && playbackIntentRef.current) {
        scheduleRetries();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    media.addEventListener("pause", onPause);

    return () => {
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      media.removeEventListener("pause", onPause);
    };
  }, [media, playbackIntentRef]);
}

export function configureBackgroundAudioElement(audio: HTMLAudioElement) {
  audio.setAttribute("playsinline", "");
  audio.setAttribute("webkit-playsinline", "");
  audio.setAttribute("x-webkit-airplay", "allow");
  audio.setAttribute("referrerpolicy", "no-referrer");
}

export function configureBackgroundVideoElement(video: HTMLVideoElement) {
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("x-webkit-airplay", "allow");
  video.setAttribute("referrerpolicy", "no-referrer");
}
