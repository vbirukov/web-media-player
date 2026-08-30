import { RefObject } from "react"
import { motion } from "framer-motion"
import { Heart, Share2, Code, X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PLAYBACK_RATES } from "../constants/player"
import type { Track } from "../types/catalog"
import type { UserState } from "../types/user"
import { PlayerTimeline } from "./PlayerTimeline"
import { TrackCover } from "./TrackCover"

type Props = {
  open: boolean
  onClose: () => void
  track: Track | null
  currentTrackId: string | null
  audioRef: RefObject<HTMLAudioElement | null>
  user: UserState
  isPlaying: boolean
  audioBusy: boolean
  playButtonLabel: string
  repeatLabel: string
  isLiked: (id: string) => boolean
  onToggleLike: (id: string) => void
  onToggleShuffle: () => void
  onCycleRepeat: () => void
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onSeek: (value: number) => void
  onShare: () => void
  shareDisabled: boolean
  onEmbedCopy: () => void
  embedDisabled: boolean
}

export function NowPlayingSheet({
  open,
  onClose,
  track,
  currentTrackId,
  audioRef,
  user,
  isPlaying,
  audioBusy,
  playButtonLabel,
  repeatLabel,
  isLiked,
  onToggleLike,
  onToggleShuffle,
  onCycleRepeat,
  onPrev,
  onNext,
  onTogglePlay,
  onSeek,
  onShare,
  shareDisabled,
  onEmbedCopy,
  embedDisabled,
}: Props) {
  const liked = currentTrackId ? isLiked(currentTrackId) : false

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Сейчас играет</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6">
            {/* Large cover and info */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <TrackCover track={track} size="lg" />
                
                {/* Playing indicator */}
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full"
                  />
                )}
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {track?.title ?? "Ничего не выбрано"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {track?.folder ?? ""}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <PlayerTimeline
                audioRef={audioRef}
                trackId={currentTrackId}
                onSeek={onSeek}
              />
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleShuffle}
                className={cn("h-12 w-12", user.shuffle && "text-primary")}
              >
                <Shuffle className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onPrev} className="h-12 w-12">
                <SkipBack className="h-6 w-6" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={onTogglePlay}
                className="h-16 w-16 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={onNext} className="h-12 w-12">
                <SkipForward className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onCycleRepeat}
                className={cn("h-12 w-12", user.repeat !== "off" && "text-primary")}
              >
                <Repeat className="h-6 w-6" />
              </Button>
            </div>

            {/* Secondary controls */}
            <div className="space-y-6">
              {/* Like and actions */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => currentTrackId && onToggleLike(currentTrackId)}
                  className={cn(liked && "text-red-500 hover:text-red-600")}
                >
                  <motion.div
                    animate={liked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                    <span>{liked ? "В избранном" : "Добавить в избранное"}</span>
                  </motion.div>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onShare}
                  disabled={shareDisabled}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Поделиться
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onEmbedCopy}
                  disabled={embedDisabled}
                >
                  <Code className="h-5 w-5 mr-2" />
                  Код для вставки
                </Button>
              </div>

              {/* Playback speed */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">Скорость воспроизведения</span>
                <div className="flex gap-2">
                  {PLAYBACK_RATES.map((rate) => (
                    <Button
                      key={rate}
                      variant={user.playbackRate === rate ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.playbackRate = rate
                        }
                      }}
                    >
                      {rate}×
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">Громкость</span>
                <Slider
                  value={[user.volume]}
                  onValueChange={([v]) => {
                    if (audioRef.current) {
                      audioRef.current.volume = v
                    }
                  }}
                  max={1}
                  step={0.01}
                  className="w-48"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {Math.round(user.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
