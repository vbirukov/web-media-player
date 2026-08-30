# 📖 Usage Guide - Modern UI Stack

This guide shows you how to use the new Tailwind CSS + shadcn/ui + Framer Motion + lucide-react stack in your application.

## Quick Start

### 1. Import Components

```tsx
// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

// Icons
import { Heart, Play, Pause } from 'lucide-react'

// Animations
import { motion, AnimatePresence } from 'framer-motion'

// Utilities
import { cn } from "@/lib/utils"
```

### 2. Use Tailwind Classes

```tsx
<div className="p-4 rounded-lg bg-card border shadow-sm">
  <h2 className="text-xl font-bold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

### 3. Add Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  className="bg-card p-4 rounded-lg"
>
  Animated content
</motion.div>
```

---

## Component Examples

### Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon only</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Heart className="h-5 w-5" />
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Dialog (Modal)

```tsx
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <h2>Dialog Title</h2>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### Sheet (Slide-in Panel)

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sidebar</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <h2>Sidebar Content</h2>
  </SheetContent>
</Sheet>
```

### Slider

```tsx
import { Slider } from "@/components/ui/slider"

const [value, setValue] = useState([50])

<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
  className="w-full"
/>
```

### Switch

```tsx
import { Switch } from "@/components/ui/switch"

const [enabled, setEnabled] = useState(false)

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Skeleton (Loading State)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-20 w-full rounded-lg" />
```

### Progress

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={66} className="w-full" />
```

---

## Icon Usage

### Direct from lucide-react (Recommended)

```tsx
import { Heart, Play, Pause, Share2 } from 'lucide-react'

<Heart className="h-5 w-5 text-red-500" />
<Play className="h-6 w-6" />
<Pause className="h-6 w-6" />
```

### Using Icon wrapper (Backward compatibility)

```tsx
import { Icon } from '@/components/ui/icon'

<Icon name="heart" size={20} className="text-red-500" />
```

---

## Animation Patterns

### Page Transition

```tsx
import { PageTransition } from '@/components/PageTransition'

<PageTransition>
  {/* Page content */}
</PageTransition>
```

### List Stagger

```tsx
import { StaggeredList } from '@/components/PageTransition'

<StaggeredList>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</StaggeredList>
```

### Hover Effects

```tsx
import { ScaleOnHover } from '@/components/PageTransition'

<ScaleOnHover>
  <Card>Hover me!</Card>
</ScaleOnHover>
```

### Conditional Rendering with Animation

```tsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Theme Switching

```tsx
import { useAppTheme } from '@/hooks/useAppTheme'

function ThemeSwitcher() {
  const { skin, setSkin } = useAppTheme()
  
  return (
    <select 
      value={skin} 
      onChange={(e) => setSkin(e.target.value as AppSkin)}
    >
      <option value="rastaman">Rastaman</option>
      <option value="jaipur">Jaipur</option>
      <option value="moon-dub">Moon Dub</option>
    </select>
  )
}
```

---

## Responsive Design

Tailwind uses mobile-first breakpoints:

```tsx
<div className="
  grid 
  grid-cols-1       /* Mobile */
  sm:grid-cols-2    /* 640px+ */
  md:grid-cols-3    /* 768px+ */
  lg:grid-cols-4    /* 1024px+ */
  gap-4
">
  {/* Cards */}
</div>
```

---

## Common Patterns

### Loading State

```tsx
import { Skeleton } from "@/components/ui/skeleton"

function TrackList({ loading, tracks }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }
  
  return tracks.map(track => <TrackCard track={track} />)
}
```

### Empty State

```tsx
{tracks.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">No tracks found</p>
  </div>
) : (
  <TrackList tracks={tracks} />
)}
```

### Error State

```tsx
if (error) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
      <p>Error: {error.message}</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  )
}
```

---

## Accessibility

All shadcn/ui components are accessible by default:

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus management
- ✅ Screen reader support

### Custom ARIA Labels

```tsx
<Button aria-label="Like this track">
  <Heart className="h-5 w-5" />
</Button>
```

### Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion'

const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Performance Tips

### 1. Memoize Expensive Components

```tsx
import { memo } from 'react'

const TrackCard = memo(({ track }) => {
  // Component logic
})
```

### 2. Lazy Load Heavy Components

```tsx
import { lazy, Suspense } from 'react'

const NowPlayingSheet = lazy(() => import('./NowPlayingSheet'))

<Suspense fallback={<Skeleton className="h-screen" />}>
  <NowPlayingSheet />
</Suspense>
```

### 3. Use React.memo for Lists

```tsx
const TrackList = memo(({ tracks }) => {
  return tracks.map(track => <TrackCard key={track.id} track={track} />)
})
```

---

## Migration Checklist

For each component you migrate:

- [ ] Replace BEM classes with Tailwind utilities
- [ ] Replace custom buttons with shadcn/ui Button
- [ ] Replace custom icons with lucide-react
- [ ] Add Framer Motion animations
- [ ] Test responsive behavior
- [ ] Verify accessibility
- [ ] Check dark mode support
- [ ] Test theme switching

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/docs
- **Framer Motion**: https://www.framer.com/motion/introduction
- **lucide Icons**: https://lucide.dev/icons
- **Radix UI**: https://www.radix-ui.com/docs

---

## Need Help?

See these documents for more details:
- `docs/MIGRATION_GUIDE.md` - Step-by-step migration
- `docs/MODERNIZATION.md` - Overview of the new stack
- `docs/UX_ANALYSIS.md` - UX rationale and strategy
