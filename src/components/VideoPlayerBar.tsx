import { useEffect, useState } from "react";
import type { Track } from "../types/catalog";
import { IconButton, PlayPauseIcon } from "./IconButton";
import { Icon } from "./icons/Icon";
import { fmtTime } from "../lib/format";

type Props = {
  currentTrack: Track | null;
  bindVideoRef: (el: HTMLVideoElement | null) => void;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onSeekTo: (sec: number) => void;
  onVolumeChange: (value: number) => void;
  onShare: () => void;
  onClose: () => void;
};

type VideoPanelMode = "dock" | "large" | "center";

export function VideoPlayerBar({
  currentTrack,
  bindVideoRef,
  isPlaying,
  isLoading,
  volume,
  onTogglePlay,
  onPrev,
  onNext,
  onSeekBack,
  onSeekForward,
  onSeekTo,
  onVolumeChange,
  onShare,
  onClose,
}: Props) {
  const [mode, setMode] = useState<VideoPanelMode>("dock");
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedRatio, setBufferedRatio] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "has-video-player",
      Boolean(currentTrack),
    );
    return () => {
      document.documentElement.classList.remove("has-video-player");
      document.documentElement.classList.remove("video-player-mode-large");
      document.documentElement.classList.remove("video-player-mode-center");
    };
  }, [currentTrack]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "video-player-mode-large",
      Boolean(currentTrack) && mode === "large",
    );
    document.documentElement.classList.toggle(
      "video-player-mode-center",
      Boolean(currentTrack) && mode === "center",
    );
    return () => {
      document.documentElement.classList.remove("video-player-mode-large");
      document.documentElement.classList.remove("video-player-mode-center");
    };
  }, [currentTrack, mode]);

  useEffect(() => {
    if (!currentTrack) setMode("dock");
  }, [currentTrack]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setCompact(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoEl;
    if (!video) return;
    const sync = () => {
      const d = Number.isFinite(video.duration) ? video.duration : 0;
      setDuration(d > 0 ? d : 0);
      setPosition(Math.max(0, video.currentTime || 0));
      if (d > 0 && video.buffered.length > 0) {
        const end = video.buffered.end(video.buffered.length - 1) || 0;
        setBufferedRatio(Math.max(0, Math.min(1, end / d)));
      } else {
        setBufferedRatio(0);
      }
    };
    sync();
    video.addEventListener("timeupdate", sync);
    video.addEventListener("progress", sync);
    video.addEventListener("durationchange", sync);
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("seeked", sync);
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("progress", sync);
      video.removeEventListener("durationchange", sync);
      video.removeEventListener("loadedmetadata", sync);
      video.removeEventListener("seeked", sync);
    };
  }, [videoEl, currentTrack?.id]);

  if (!currentTrack) return null;

  const requestFullscreen = async () => {
    const container = document.querySelector<HTMLElement>(".video-player-bar");
    if (!container) return;
    if (document.fullscreenElement === container) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    await container.requestFullscreen().catch(() => {});
  };

  return (
    <div
      className={`video-player-bar video-player-bar--${mode}${compact ? " is-compact" : ""}`}
      role="region"
      aria-label="Видеоплеер"
    >
      <div className="video-player-bar__stage">
        <video
          ref={(el) => {
            bindVideoRef(el);
            setVideoEl(el);
          }}
          className="video-player-bar__video"
          playsInline
          controls={false}
          preload="metadata"
        />
      </div>
      <div className="video-player-bar__timeline">
        <span>{fmtTime(position)}</span>
        <div className="video-player-bar__timeline-track">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(position, duration || position)}
            onChange={(e) => onSeekTo(Number(e.target.value))}
            aria-label="Позиция видео"
          />
          <div className="video-player-bar__timeline-rail" aria-hidden>
            <div
              className="video-player-bar__timeline-buffered"
              style={{ width: `${bufferedRatio * 100}%` }}
            />
            <div
              className="video-player-bar__timeline-played"
              style={{
                width: `${duration > 0 ? Math.max(0, Math.min(1, position / duration)) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <span>{fmtTime(duration)}</span>
      </div>
      <div className="video-player-bar__meta">
        <div className="video-player-bar__info">
          <h3 className="video-player-bar__title">{currentTrack.title}</h3>
          {!compact ? <p className="video-player-bar__folder">{currentTrack.folder}</p> : null}
          <div className="video-player-bar__volume">
            <span>Громкость</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Громкость видео"
            />
          </div>
        </div>
        <div className="video-player-bar__actions row-actions">
          <IconButton
            size="md"
            onClick={onPrev}
            aria-label="Предыдущее видео"
            title="Предыдущее"
          >
            <Icon name="skip-back" size={20} />
          </IconButton>
          <IconButton
            size="md"
            onClick={onSeekBack}
            aria-label="Перемотать назад на 10 секунд"
            title="-10 секунд"
          >
            <span className="video-player-bar__seek">-10</span>
          </IconButton>
          <IconButton
            variant="primary"
            size="md"
            onClick={() => void onTogglePlay()}
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            <PlayPauseIcon
              playing={isPlaying}
              busy={isLoading}
              iconSize={22}
            />
          </IconButton>
          <IconButton
            size="md"
            onClick={onSeekForward}
            aria-label="Перемотать вперед на 10 секунд"
            title="+10 секунд"
          >
            <span className="video-player-bar__seek">+10</span>
          </IconButton>
          <IconButton
            size="md"
            onClick={onNext}
            aria-label="Следующее видео"
            title="Следующее"
          >
            <Icon name="skip-forward" size={20} />
          </IconButton>
          <IconButton size="md" onClick={onShare} aria-label="Поделиться видео" title="Поделиться">
            <Icon name="share" size={20} />
          </IconButton>
          <button
            type="button"
            className="ghost round video-player-bar__mode-btn"
            onClick={() => setCompact((prev) => !prev)}
            aria-label={compact ? "Обычный режим плеера" : "Компактный режим плеера"}
            title={compact ? "Обычный" : "Компактный"}
          >
            <Icon name="compact" size={18} />
          </button>
          <button
            type="button"
            className="ghost round video-player-bar__mode-btn video-player-bar__advanced"
            onClick={() => setMode((prev) => (prev === "large" ? "dock" : "large"))}
            aria-label="Увеличить окно видео"
            title={mode === "large" ? "Обычный размер" : "Увеличить"}
          >
            {mode === "large" ? "1x" : "2x"}
          </button>
          <button
            type="button"
            className="ghost round video-player-bar__mode-btn video-player-bar__advanced"
            onClick={() => setMode((prev) => (prev === "center" ? "dock" : "center"))}
            aria-label="Разместить видео по центру"
            title="По центру"
          >
            <Icon name="center" size={18} />
          </button>
          <button
            type="button"
            className="ghost round video-player-bar__mode-btn video-player-bar__advanced"
            onClick={() => void requestFullscreen()}
            aria-label="На весь экран"
            title="Fullscreen"
          >
            <Icon name="fullscreen" size={18} />
          </button>
          <button
            type="button"
            className="ghost round"
            onClick={onClose}
            aria-label="Закрыть плеер"
            title="Закрыть и остановить"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
