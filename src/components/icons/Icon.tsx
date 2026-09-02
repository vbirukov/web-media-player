import type { SVGAttributes } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  Shuffle,
  Repeat,
  Repeat1,
  Repeat2,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  LoaderCircle,
  Heart,
  Star,
  Monitor,
  Share2,
  Download,
  Code2,
  Music,
  Folder,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ListPlus,
  LayoutGrid,
  Rows3,
  Leaf,
  Sparkles,
  Cloud,
  Minimize2,
  Focus,
  Maximize,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "menu"
  | "close"
  | "sun"
  | "moon"
  | "shuffle"
  | "repeat"
  | "repeat-one"
  | "repeat-off"
  | "skip-back"
  | "skip-forward"
  | "play"
  | "pause"
  | "loader"
  | "heart"
  | "heart-outline"
  | "star"
  | "star-outline"
  | "wake"
  | "share"
  | "download"
  | "code"
  | "music"
  | "folder"
  | "check"
  | "chevron-up"
  | "chevron-down"
  | "chevron-right"
  | "list-plus"
  | "layout-grid"
  | "layout-rows"
  | "leaf"
  | "sun-portal"
  | "cloud"
  | "compact"
  | "center"
  | "fullscreen";

type Props = SVGAttributes<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

/**
 * Маппинг имени на lucide-иконку. Часть имён залита вариантом
 * (filled), поэтому храним пару { Icon, filled }.
 */
const icons: Record<IconName, { Icon: LucideIcon; filled?: boolean }> = {
  menu: { Icon: Menu },
  close: { Icon: X },
  sun: { Icon: Sun },
  moon: { Icon: Moon },
  shuffle: { Icon: Shuffle },
  repeat: { Icon: Repeat },
  "repeat-one": { Icon: Repeat1 },
  "repeat-off": { Icon: Repeat2 },
  "skip-back": { Icon: SkipBack },
  "skip-forward": { Icon: SkipForward },
  play: { Icon: Play, filled: true },
  pause: { Icon: Pause, filled: true },
  loader: { Icon: LoaderCircle },
  heart: { Icon: Heart, filled: true },
  "heart-outline": { Icon: Heart },
  star: { Icon: Star, filled: true },
  "star-outline": { Icon: Star },
  wake: { Icon: Monitor },
  share: { Icon: Share2 },
  download: { Icon: Download },
  code: { Icon: Code2 },
  music: { Icon: Music },
  folder: { Icon: Folder },
  check: { Icon: Check },
  "chevron-up": { Icon: ChevronUp },
  "chevron-down": { Icon: ChevronDown },
  "chevron-right": { Icon: ChevronRight },
  "list-plus": { Icon: ListPlus },
  "layout-grid": { Icon: LayoutGrid },
  "layout-rows": { Icon: Rows3 },
  leaf: { Icon: Leaf },
  "sun-portal": { Icon: Sparkles },
  cloud: { Icon: Cloud },
  compact: { Icon: Minimize2 },
  center: { Icon: Focus },
  fullscreen: { Icon: Maximize },
};

export function Icon({ name, size = 20, className, ...rest }: Props) {
  const { Icon: LucideIcon, filled } = icons[name] ?? icons.menu;
  return (
    <LucideIcon
      className={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={rest.strokeWidth ?? 2}
      aria-hidden={rest["aria-hidden"] ?? true}
      {...rest}
    />
  );
}
