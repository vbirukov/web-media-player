/**
 * Icon component using lucide-react
 * 
 * This replaces the custom Icon component with lucide-react icons.
 * Provides a consistent API while using the lucide icon library.
 * 
 * Usage:
 * import { Icon } from '@/components/ui/icon'
 * <Icon name="heart" size={20} />
 * 
 * Or use lucide-react directly:
 * import { Heart } from 'lucide-react'
 * <Heart className="h-5 w-5" />
 */

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

type IconName = keyof typeof LucideIcons

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ComponentType<any>
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }
  
  return (
    <LucideIcon
      width={size}
      height={size}
      className={cn('inline-block', className)}
      {...props}
    />
  )
}

// Export common icons for direct import
export {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  X as Close,
  ChevronUp,
  ChevronDown,
  Check,
  Download,
  Share2 as Share,
  ListPlus,
  Loader2 as Loader,
  Sun,
  Moon,
  Menu,
  Search,
  Plus,
  Minus,
  MoreVertical,
  MoreHorizontal,
  Settings,
  Info,
  AlertCircle,
  Clock,
  Calendar,
  Folder,
  FileText,
  Music,
  Video,
  Image,
  Mic,
  Headphones,
  Radio,
  Wifi,
  Battery,
  Smartphone,
  Monitor,
  Tv,
} from 'lucide-react'
