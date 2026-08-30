import { motion } from "framer-motion"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Page transition wrapper with fade and slide animation
 * Use this to wrap page content for smooth transitions
 */
export function PageTransition({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered list animation for track lists
 * Each item appears with a slight delay
 */
export function StaggeredList({ children, className }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade in animation for modals and overlays
 */
export function FadeIn({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide up animation for bottom sheets
 */
export function SlideUp({ children, className }: Props) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale animation for cards and buttons
 */
export function ScaleOnHover({ children, className }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
