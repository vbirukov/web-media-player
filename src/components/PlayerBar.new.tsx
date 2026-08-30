import { useEffect, useState, type Dispatch, RefObject, SetStateAction } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, Code, Sun, ChevronUp, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { PLAYBACK_RATES } from "../constants/player"
import type { Track } from "../types/catalog"
import type { UserState } from "../types/user"
import { ymGoal } from "../lib/metrika"
import { copyTrackEmbedCode, shareTrack } from "../lib/shareTrack"
import { NowPlayingSheet } from "./NowPlayingSheet"
import { PlayerTimeline } from "./PlayerTimeline"
import { PlayerTransport } from "./PlayerTransport"
import { TrackCover } from "./TrackCover"

type Props = {
  currentTrack: Track | null
  currentTrackId: string | null
  audioRef: RefObject<HTMLAudioElement | null>
  bindAudioRef: (el: HTMLAudioElement | null) => void
  user: UserState
  setUser: Dispatch<SetStateAction<UserState>>
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
  onShareToast: (message: string) => void
}

export function PlayerBar({
  currentTrack,
  currentTrackId,
  audioRef,
  bindAudioRef,
  user,
  setUser,
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
  onShareToast,
}: Props) {
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false)
  const [barCollapsed, setBarCollapsed] = useState(false)

  useEffect(() => {
    if (!currentTrack) setNowPlayingOpen(false)
  }, [currentTrack?.id])

  useEffect(() => {
    if (!currentTrackId) setBarCollapsed(false)
  }, [currentTrackId])

  useEffect(() => {
    if (isPlaying) setBarCollapsed(false)
  }, [isPlaying])

  useEffect(() => {
    document.documentElement.classList.toggle(
      "player-bar-collapsed",
      Boolean(currentTrackId && barCollapsed)
    )
    return () => {
      document.documentElement.classList.remove("player-bar-collapsed")
    }
  }, [currentTrackId, barCollapsed])

  const liked = currentTrackId ? isLiked(currentTrackId) : false
  const showCollapse = Boolean(currentTrackId) && !barCollapsed

  const currentPositionSec = () => {
    const pos = audioRef.current?.currentTime
    return Number.isFinite(pos) ? pos : undefined
  }

  const handleShare = () => {
    if (!currentTrack) return
    void shareTrack({
      track: currentTrack,
      positionSec: currentPositionSec(),
    }).then((r) => {
      if (r === "copied") onShareToast("Ссылка скопирована")
      if (r === "shared") ymGoal("track_share", { track_id: currentTrack.id })
    })
  }

  const handleEmbedCopy = () => {
    if (!currentTrack) return
    void copyTrackEmbedCode({
      track: currentTrack,
      positionSec: currentPositionSec(),
    }).then((r) => {
      if (r === "copied") {
        onShareToast("Код iframe скопирован")
        ymGoal("track_embed_copy", { track_id: currentTrack.id })
      }
    })
  }

  return (
    <>
      <audio
        ref={bindAudioRef}
        className="fixed w-px h-px opacity-0 pointer-events-none"
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />
      
      <AnimatePresence>
        {currentTrackId && barCollapsed && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg"
            onClick={() => setBarCollapsed(false)}
            aria-label="Показать панель плеера"
          >
            <TrackCover track={currentTrack} size="sm" />
            <div className="text-sm text-left">
              <strong className="block line-clamp-1">{currentTrack?.title}</strong>
              <span className="text-xs opacity-80">На паузе · нажми, чтобы открыть</span>
            </div>
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentTrackId && !barCollapsed && (
          <motion.footer
            layout
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              "border-t shadow-lg"
            )}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
            </div>

            <div className="relative z-10 p-4">
              <div className="flex items-center gap-4 max-w-7xl mx-auto">
                {/* Left: Cover and info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="flex-shrink-0"
                    onClick={() => {
                      if (!currentTrack) return
                      setNowPlayingOpen(true)
                      ymGoal("now_playing_open")
                    }}
                    disabled={!currentTrack}
                    aria-label={currentTrack ? "Открыть сейчас играет" : undefined}
                  >
                    <TrackCover track={currentTrack} size="md" />
                  </motion.button>
                  
                  <div className="min-w-0 flex-1">
                    <strong className="block text-foreground line-clamp-1">
                      {currentTrack?.title ?? "Ничего не выбрано"}
                    </strong>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {currentTrack?.folder ?? "Выберите материал из каталога"}
                    </div>
                  </div>
                </div>

                {/* Center: Controls */}
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleShuffle}
                      className={user.shuffle ? "text-primary" : ""}
                      aria-label="Перемешать"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Предыдущий">
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="default"
                      size="icon"
                      onClick={onTogglePlay}
                      className="h-12 w-12 rounded-full"
                      aria-label={playButtonLabel}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </Button>
                    
                    <Button variant="ghost" size="icon" onClick={onNext} aria-label="Следующий">
                      <SkipForward className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onCycleRepeat}
                      className={user.repeat !== "off" ? "text-primary" : ""}
                      aria-label={repeatLabel}
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <PlayerTimeline
                    audioRef={audioRef}
                    trackId={currentTrackId}
                    onSeek={onSeek}
                  />
                  
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Пробел · воспроизведение · ←→ перемотка · N/P треки
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUser((prev) => ({ ...prev, wakeLock: !prev.wakeLock }))}
                    className={user.wakeLock ? "text-primary" : ""}
                    aria-label={user.wakeLock ? "Экран не гасить: вкл" : "Экран не гасить: выкл"}
                    title="Не давать экрану погаснуть"
                  >
                    <Sun className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => currentTrackId && onToggleLike(currentTrackId)}
                    className={liked ? "text-red-500 hover:text-red-600" : ""}
                    aria-label={liked ? "Убрать лайк" : "Лайк"}
                  >
                    <motion.div
                      animate={liked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                    </motion.div>
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Скорость</span>
                    <select
                      value={user.playbackRate}
                      onChange={(e) => {
                        const rate = Number(e.target.value)
                        if (audioRef.current) audioRef.current.playbackRate = rate
                        setUser((prev) => ({ ...prev, playbackRate: rate }))
                      }}
                      className="text-sm bg-transparent border rounded px-2 py-1"
                    >
                      {PLAYBACK_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}×
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Громкость</span>
                    <Slider
                      value={[user.volume]}
                      onValueChange={([v]) => {
                        if (audioRef.current) audioRef.current.volume = v
                        setUser((prev) => ({ ...prev, volume: v }))
                      }}
                      max={1}
                      step={0.01}
                      className="w-24"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    disabled={!currentTrack}
                    aria-label="Поделиться"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEmbedCopy}
                    disabled={!currentTrack}
                    aria-label="Копировать код для вставки"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  
                  {showCollapse && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setBarCollapsed(true)}
                      aria-label="Свернуть плеер"
                    >
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      <NowPlayingSheet
        open={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        track={currentTrack}
        currentTrackId={currentTrackId}
        audioRef={audioRef}
        user={user}
        isPlaying={isPlaying}
        audioBusy={audioBusy}
        playButtonLabel={playButtonLabel}
        repeatLabel={repeatLabel}
        isLiked={isLiked}
        onToggleLike={onToggleLike}
        onToggleShuffle={onToggleShuffle}
        onCycleRepeat={onCycleRepeat}
        onPrev={onPrev}
        onNext={onNext}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
        onShare={handleShare}
        shareDisabled={!currentTrack}
        onEmbedCopy={handleEmbedCopy}
        embedDisabled={!currentTrack}
      />
    </>
  )
}
