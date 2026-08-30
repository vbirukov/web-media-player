import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  playlistName: string
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function PlaylistModal({
  playlistName,
  onNameChange,
  onClose,
  onSubmit,
}: Props) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!playlistName.trim()) {
      setError("Введите название плейлиста")
      return
    }
    setError(null)
    onSubmit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>Создать плейлист</DialogTitle>
            <DialogDescription>
              Введите название для нового плейлиста
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => {
                onNameChange(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Название плейлиста"
              autoFocus
              className={cn(
                "w-full px-3 py-2 border rounded-md bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                error && "border-destructive"
              )}
            />
            
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              Создать
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Helper for className merging (inline to avoid import issues)
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
