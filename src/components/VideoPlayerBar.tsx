import { useEffect } from "react";
import type { Track } from "../types/catalog";
import { IconButton, PlayPauseIcon } from "./IconButton";
import { Icon } from "./icons/Icon";

type Props = {
  currentTrack: Track | null;
  bindVideoRef: (el: HTMLVideoElement | null) => void;
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
};

export function VideoPlayerBar({
  currentTrack,
  bindVideoRef,
  isPlaying,
  isLoading,
  onTogglePlay,
  onClose,
}: Props) {
  useEffect(() => {
    document.documentElement.classList.toggle(
      "has-video-player",
      Boolean(currentTrack),
    );
    return () => {
      document.documentElement.classList.remove("has-video-player");
    };
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <div className="video-player-bar" role="region" aria-label="Видеоплеер">
      <div className="video-player-bar__stage">
        <video
          ref={bindVideoRef}
          className="video-player-bar__video"
          playsInline
          controls={false}
          preload="metadata"
        />
      </div>
      <div className="video-player-bar__meta">
        <div className="video-player-bar__info">
          <span className="pill pill--kind">Видео</span>
          <h3 className="video-player-bar__title">{currentTrack.title}</h3>
          <p className="video-player-bar__folder">{currentTrack.folder}</p>
        </div>
        <div className="video-player-bar__actions row-actions">
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
          <button
            type="button"
            className="ghost round"
            onClick={onClose}
            aria-label="Закрыть видео"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
