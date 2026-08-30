import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "primary"
  size?: "sm" | "md" | "lg" | "icon"
  active?: boolean
  children: React.ReactNode
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "icon", active, children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          ref={ref}
          variant={variant === "primary" ? "default" : variant}
          size={size === "md" ? "default" : size}
          className={cn(
            "rounded-full",
            active && "bg-primary text-primary-foreground hover:bg-primary/90",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    )
  }
)
IconButton.displayName = "IconButton"

// Play/Pause icon component with animation
export function PlayPauseIcon({
  playing,
  busy,
  iconSize = 22,
}: {
  playing: boolean
  busy: boolean
  iconSize?: number
}) {
  if (busy) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        {/* Loader icon would go here */}
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{ scale: playing ? 0.9 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {playing ? (
        // Pause icon (two bars)
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        // Play icon (triangle)
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )}
    </motion.div>
  )
}
