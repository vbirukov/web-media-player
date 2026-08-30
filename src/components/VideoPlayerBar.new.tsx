import { useEffect, useState, RefObject } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Share2, 
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { fmtTime } from "../lib/format"
import type { Track } from "../types/catalog"

type Props = {
  currentTrack: Track | null
  bindVideoRef: (el: HTMLVideoElement | null) => void
  isPlaying: boolean
  isLoading: boolean
  volume: number
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSeekBack: () => void
  onSeekForward: () => void
  onSeekTo: (sec: number) => void
  onVolumeChange: (volume: number) => void
  onShare: () => void
  onClose: () => void
}

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
  const [isCompact, setIsCompact] = useState(false)
  const [isMuted, setIsMuted] = useState(volume === 0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const videoRef = useState<HTMLVideoElement | null>(null)[1]

  useEffect(() => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(0) / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('progress', updateBuffered)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('progress', updateBuffered)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.footer
          layout
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "border-t shadow-lg",
            isCompact ? "py-2" : "py-3 px-4"
          )}
        >
          <div className="max-w-7xl mx-auto">
            {/* Video Stage */}
            {!isCompact && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 rounded-lg overflow-hidden bg-black"
              >
                <div className="relative aspect-video max-h-[48vh]">
                  <video
                    ref={(el) => {
                      bindVideoRef(el)
                      if (el) videoRef(el)
                    }}
                    className="w-full h-full object-contain"
                    playsInline
                  />
                  
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {currentTrack.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {currentTrack.folder}
                </p>
              </div>

              {/* Center: Timeline and controls */}
              <div className="flex-1 max-w-2xl">
                {/* Timeline */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {fmtTime(currentTime)}
                  </span>
                  
                  <div className="flex-1 relative">
                    <Slider
                      value={[progress]}
                      onValueChange={([v]) => {
                        const time = (v / 100) * duration
                        onSeekTo(time)
                      }}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                    
                    {/* Buffered progress */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-muted-foreground/30 rounded-full pointer-events-none"
                      style={{ width: `${buffered}%` }}
                    />
                  </div>
                  
                  <span className="text-xs text-muted-foreground w-12">
                    {fmtTime(duration)}
                  </span>
                </div>

                {/* Transport controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" onClick={onPrev}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={onSeekBack}>
                    <span className="text-xs font-bold">-10</span>
                  </Button>
                  
                  <Button
                    variant="default"
                    size="icon"
                    onClick={onTogglePlay}
                    className="h-10 w-10 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={onSeekForward}>
                    <span className="text-xs font-bold">+10</span>
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={onNext}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newMuted = !isMuted
                      setIsMuted(newMuted)
                      onVolumeChange(newMuted ? 0 : volume || 0.5)
                    }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  
                  {!isCompact && (
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={([v]) => {
                        setIsMuted(v === 0)
                        onVolumeChange(v)
                      }}
                      max={1}
                      step={0.01}
                      className="w-24"
                    />
                  )}
                </div>

                <Button variant="ghost" size="icon" onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCompact(!isCompact)}
                >
                  {isCompact ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
