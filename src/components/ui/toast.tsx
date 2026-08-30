/**
 * Toast notifications using Sonner (recommended for shadcn/ui)
 * 
 * Usage:
 * import { toast } from 'sonner'
 * 
 * toast.success('Success!')
 * toast.error('Error!')
 * toast.loading('Loading...')
 * 
 * Install: npm install sonner
 * Add to app: <Toaster /> in root component
 */

// This is a re-export file for convenience
// Actual implementation uses the sonner library
export { toast } from 'sonner'
export { Toaster } from 'sonner'
