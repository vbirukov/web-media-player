# 🎨 Modern UI Stack - Quick Start Guide

This guide helps you get started with the new Tailwind CSS + shadcn/ui + Framer Motion + lucide-react stack.

## Installation

### 1. Install Dependencies

```bash
# Core dependencies
npm install tailwindcss@latest postcss@latest autoprefixer@latest

# shadcn/ui dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge

# Animations and icons
npm install framer-motion lucide-react tailwindcss-animate

# Toast notifications (optional but recommended)
npm install sonner
```

### 2. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`.

### 3. Update Configuration Files

Replace the contents of `tailwind.config.js` with the provided configuration from this package, or use our pre-configured files.

### 4. Add Global Styles

Create or update your global CSS file:

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other variables from globals.css */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

Import it in your app entry point:

```tsx
// main.tsx or App.tsx
import './styles/globals.css'
```

### 5. Configure Path Aliases (Optional but Recommended)

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

If using Vite, update `vite.config.ts`:

```ts
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## Usage Examples

### Using shadcn/ui Components

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

function MyComponent() {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-2">Hello World</h2>
      <Button variant="default">Click me</Button>
    </Card>
  )
}
```

### Using Icons (lucide-react)

```tsx
import { Heart, Play, Pause } from 'lucide-react'

function IconExample() {
  return (
    <div className="flex gap-2">
      <Heart className="h-5 w-5 text-red-500" />
      <Play className="h-6 w-6" />
      <Pause className="h-6 w-6" />
    </div>
  )
}
```

Or use the compatibility wrapper:

```tsx
import { Icon } from '@/components/ui/icon'

<Icon name="heart" size={20} className="text-red-500" />
```

### Using Framer Motion

```tsx
import { motion } from 'framer-motion'

function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-card p-4 rounded-lg"
    >
      Animated content
    </motion.div>
  )
}
```

### Sidebar with Animation

```tsx
import { AnimatePresence, motion } from 'framer-motion'

function MySidebar({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50"
          >
            {/* Content */}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

function MyComponent() {
  const handleClick = () => {
    toast.success('Success!')
    toast.error('Error!')
    toast.loading('Loading...')
  }
  
  return <button onClick={handleClick}>Show toasts</button>
}

// Don't forget to add Toaster to your app root
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <MyComponent />
      <Toaster />
    </>
  )
}
```

## Theme Switching

Themes are controlled via the `data-skin` attribute on `<html>`:

```tsx
// Set theme
document.documentElement.setAttribute('data-skin', 'jaipur')

// Available themes:
// - rastaman
// - rastaman-light
// - jaipur
// - moon-dub
```

The theme system uses CSS variables defined in `globals.css`, so all Tailwind classes automatically adapt to the current theme.

## Responsive Design

Tailwind uses a mobile-first approach with these breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards adapt to screen size */}
</div>
```

## Migration from Old Components

### Old Icon Component → New

```tsx
// Before
import { Icon } from '@vbonline/player'
<Icon name="heart" size={20} />

// After (Option 1: Direct lucide-react)
import { Heart } from 'lucide-react'
<Heart className="h-5 w-5" />

// After (Option 2: Compatibility wrapper)
import { Icon } from '@/components/ui/icon'
<Icon name="heart" size={20} />
```

### Old BEM Classes → Tailwind

```tsx
// Before
<article className="card card--row">
  <h4 className="card-title">Title</h4>
  <button className="ghost round">Action</button>
</article>

// After
<motion.article
  whileHover={{ scale: 1.02 }}
  className="rounded-xl border bg-card p-4 flex items-center gap-4"
>
  <h4 className="font-semibold text-foreground">Title</h4>
  <Button variant="ghost" size="icon">Action</Button>
</motion.article>
```

## Additional Resources

- **Full Documentation**: See `docs/MODERNIZATION.md`
- **Migration Guide**: See `docs/MIGRATION_GUIDE.md`
- **UX Analysis**: See `docs/UX_ANALYSIS.md`
- **Example Component**: See `docs/EXAMPLE_MIGRATED_TRACKCARD.tsx`

## Need Help?

Check the comprehensive documentation in the `docs/` folder or refer to:
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [lucide Icons](https://lucide.dev/icons)
