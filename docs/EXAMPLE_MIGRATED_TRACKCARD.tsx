/**
 * Example: Fully Migrated TrackCard Component
 * 
 * This demonstrates the complete migration from BEM CSS to:
 * - Tailwind CSS utility classes
 * - shadcn/ui components (Button, Card)
 * - Framer Motion animations
 * - lucide-react icons
 * 
 * Compare with original: src/components/TrackCard.tsx
 */

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Play, 
  Pause, 
  Download, 
  Check, 
  Loader2,
  MoreVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fmtTime } from "../lib/format";
import { isStubTrack } from "../lib/diskDownload";
import { listenStatus, listenStatusLabel } from "../lib/listenStatus";
import { mediaActionLabel, trackKind } from "../lib/mediaKind";
import { CardPlaylistMenu } from "./CardPlaylistMenu";
import type { Track } from "../types/catalog";
import type { Playlist, Progress } from "../types/user";

export type TrackCardProps = {
  track: Track;
  layout?: "tiles" | "rows";
  showFolderName?: boolean;
  isQueueNext?: boolean;
  progress: Progress;
  isActive: boolean;
  isPlaying: boolean;
  liked: boolean;
  playlistButtons: Playlist[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (id: string) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
  onSelectFolder?: (folder: string) => void;
  isOffline?: boolean;
  isOfflineDownloading?: boolean;
  onOfflineAction?: (track: Track) => void;
};

function CardFolderLink({
  folder,
  className,
  onSelectFolder,
}: {
  folder: string;
  className: string;
  onSelectFolder?: (folder: string) => void;
}) {
  if (!onSelectFolder) {
    return <span className={className}>{folder}</span>;
  }
  return (
    <button
      type="button"
      className={cn(
        "text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelectFolder(folder);
      }}
      aria-label={`Каталог: ${folder}`}
    >
      {folder}
    </button>
  );
}

function TrackCardInner({
  track,
  layout = "tiles",
  showFolderName = false,
  isQueueNext = false,
  progress,
  isActive,
  isPlaying,
  liked,
  playlistButtons,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onSelectFolder,
  isOffline = false,
  isOfflineDownloading = false,
  onOfflineAction,
}: TrackCardProps) {
  const status = listenStatus(progress);
  const [mobileTapPlay, setMobileTapPlay] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 720px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setMobileTapPlay(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const isRow = layout === "rows";
  const stub = isStubTrack(track);
  const kind = trackKind(track);
  const showOffline = Boolean(onOfflineAction) && !stub && kind === "audio";

  const progressBadgeLabel =
    progress.position > 0 ? fmtTime(progress.position) : "···";

  const playLabel = stub
    ? "Подготовлено"
    : mediaActionLabel(kind, isActive && isPlaying);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!mobileTapPlay) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    onPlayTrack(track);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayTrack(track);
  };

  // Status badge component
  const StatusBadge = () => {
    if (isActive) {
      return (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isPlaying 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
          aria-live="polite"
        >
          {isPlaying ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
              Сейчас
            </>
          ) : (
            "Пауза"
          )}
        </motion.span>
      );
    }
    
    if (isQueueNext) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
          Следующий
        </span>
      );
    }
    
    if (status === "completed") {
      return (
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-600"
          title={listenStatusLabel.completed}
          aria-label={listenStatusLabel.completed}
        >
          <Check className="h-3 w-3" />
        </span>
      );
    }
    
    return null;
  };

  // Progress badge for in-progress tracks
  const ProgressBadge =
    isActive || status !== "in-progress" ? null : (
      <span
        className={cn(
          "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
          "bg-background/80 backdrop-blur-sm border"
        )}
        title={listenStatusLabel["in-progress"]}
        aria-label={`${listenStatusLabel["in-progress"]}, ${progressBadgeLabel}`}
      >
        {progressBadgeLabel}
      </span>
    );

  // Offline indicator
  const offlinePill = isOffline ? (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600"
      title="Скачано · доступно без сети"
    >
      Офлайн
    </span>
  ) : null;

  return (
    <motion.article
      layout
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card",
        "hover:shadow-lg hover:border-primary/50",
        "transition-all duration-200",
        isRow && "flex items-center gap-4 p-4",
        !isRow && "flex flex-col gap-3 p-4",
        status === "completed" && "border-green-500/50",
        isActive && "ring-2 ring-primary ring-offset-2",
        isOffline && "border-blue-500/50"
      )}
      data-track-id={track.id}
      aria-current={isActive ? "true" : undefined}
      onClick={handleCardClick}
      tabIndex={mobileTapPlay ? 0 : undefined}
      aria-label={`${track.title}, ${track.folder}. ${playLabel}`}
    >
      {/* Background gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        )} 
        aria-hidden
      />

      {/* Progress badge (corner) */}
      {!isRow && ProgressBadge}

      {/* Main content */}
      <div className="relative z-10 flex-1 min-w-0">
        {isRow ? (
          /* Row layout */
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground line-clamp-2 truncate">
                  {track.title}
                </h4>
                <StatusBadge />
                {offlinePill}
              </div>
              
              {showFolderName && (
                <CardFolderLink
                  folder={track.folder}
                  className="block mt-1"
                  onSelectFolder={onSelectFolder}
                />
              )}
            </div>
            
            {/* Actions for row layout */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showOffline && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isOfflineDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOfflineAction?.(track);
                  }}
                  className={cn(
                    "h-8 w-8",
                    isOffline && "text-blue-600"
                  )}
                  aria-label={
                    isOfflineDownloading
                      ? "Скачивание…"
                      : isOffline
                        ? "Удалить офлайн-копию"
                        : "Скачать для офлайн"
                  }
                >
                  {isOfflineDownloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleLike(track.id)}
                className={cn(
                  "h-8 w-8",
                  liked && "text-red-500 hover:text-red-600"
                )}
                aria-label={liked ? "Убрать лайк" : "Лайк"}
              >
                <motion.div
                  animate={liked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                </motion.div>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handlePlayClick}
                className="gap-2"
                aria-label={playLabel}
              >
                {isActive && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{playLabel}</span>
              </Button>
              
              <CardPlaylistMenu
                trackId={track.id}
                playlists={playlistButtons}
                onSelect={onAddToPlaylist}
              />
            </div>
          </div>
        ) : (
          /* Tile layout */
          <div className="flex flex-col gap-3">
            {/* Kind badge and folder */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                kind === "audio" && "bg-purple-500/20 text-purple-600",
                kind === "video" && "bg-blue-500/20 text-blue-600",
                kind === "text" && "bg-green-500/20 text-green-600"
              )}>
                {kind === "audio" ? "Аудио" : kind === "video" ? "Видео" : "Текст"}
              </span>
              
              {showFolderName && (
                <CardFolderLink
                  folder={track.folder}
                  className=""
                  onSelectFolder={onSelectFolder}
                />
              )}
              
              <StatusBadge />
              {offlinePill}
            </div>
            
            {/* Title */}
            <h4 className="font-semibold text-foreground line-clamp-2">
              {track.title}
            </h4>
            
            {/* Actions for tile layout */}
            <div className="flex items-center gap-2 mt-auto">
              {showOffline && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isOfflineDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOfflineAction?.(track);
                  }}
                  className={cn(
                    "h-8 w-8",
                    isOffline && "text-blue-600"
                  )}
                  aria-label={
                    isOfflineDownloading
                      ? "Скачивание…"
                      : isOffline
                        ? "Удалить офлайн-копию"
                        : "Скачать для офлайн"
                  }
                >
                  {isOfflineDownloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isOffline ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleLike(track.id)}
                className={cn(
                  "h-8 w-8",
                  liked && "text-red-500 hover:text-red-600"
                )}
                aria-label={liked ? "Убрать лайк" : "Лайк"}
              >
                <motion.div
                  animate={liked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                </motion.div>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handlePlayClick}
                className="gap-2 flex-1"
                aria-label={playLabel}
              >
                {isActive && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{playLabel}</span>
              </Button>
              
              <CardPlaylistMenu
                trackId={track.id}
                playlists={playlistButtons}
                onSelect={onAddToPlaylist}
              />
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Memoization for performance
function progressEqual(a: Progress, b: Progress) {
  return (
    a.position === b.position &&
    a.duration === b.duration &&
    a.completed === b.completed
  );
}

export const TrackCard = memo(TrackCardInner, (prev, next) => {
  if (prev.track !== next.track) return false;
  if (prev.layout !== next.layout) return false;
  if (prev.showFolderName !== next.showFolderName) return false;
  if (prev.isQueueNext !== next.isQueueNext) return false;
  if (prev.isActive !== next.isActive) return false;
  if (prev.isPlaying !== next.isPlaying) return false;
  if (prev.liked !== next.liked) return false;
  if (prev.isOffline !== next.isOffline) return false;
  if (prev.isOfflineDownloading !== next.isOfflineDownloading) return false;
  if (!progressEqual(prev.progress, next.progress)) return false;
  if (prev.playlistButtons !== next.playlistButtons) return false;
  return (
    prev.onPlayTrack === next.onPlayTrack &&
    prev.onToggleLike === next.onToggleLike &&
    prev.onAddToPlaylist === next.onAddToPlaylist &&
    prev.onSelectFolder === next.onSelectFolder &&
    prev.onOfflineAction === next.onOfflineAction
  );
});
