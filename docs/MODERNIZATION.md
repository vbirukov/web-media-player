# Modernization: Tailwind CSS + shadcn/ui + Framer Motion + lucide-react

This document describes the modernized styling and component system for `@vbonline/player`.

## Overview

The player has been modernized with:

- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent UI development
- **shadcn/ui**: Beautifully designed, accessible components built on Radix UI
- **Framer Motion**: Production-ready motion library for React animations
- **lucide-react**: Consistent, well-designed icon set

## Benefits

### Before (BEM CSS)
- ❌ Manual spacing calculations
- ❌ Inconsistent design tokens
- ❌ Complex theme maintenance
- ❌ Limited responsive breakpoints
- ❌ No animation system
- ❌ Custom icon management

### After (Modern Stack)
- ✅ Consistent spacing scale (4px grid)
- ✅ Semantic design tokens via CSS variables
- ✅ Easy theme customization
- ✅ Mobile-first responsive design
- ✅ Smooth, purposeful animations
- ✅ 1000+ consistent icons

## Quick Start

### 1. Install Dependencies

```bash
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion lucide-react
npm install tailwindcss-animate
```

### 2. Configure Tailwind

See `tailwind.config.js` and `postcss.config.js` in the project root.

### 3. Import Global Styles

```tsx
// In your app's entry point
import '@vbonline/player/styles/globals.css'
```

### 4. Use Components

```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Play } from 'lucide-react'
import { motion } from 'framer-motion'

<motion.div whileHover={{ scale: 1.05 }}>
  <Card className="p-4">
    <Button variant="ghost" size="icon">
      <Heart className="h-5 w-5" />
    </Button>
  </Card>
</motion.div>
```

## Component Library

### Available shadcn/ui Components

| Component | Usage | Description |
|-----------|-------|-------------|
| Button | `@/components/ui/button` | Accessible button with variants |
| Card | `@/components/ui/card` | Container with header/content/footer |
| Sheet | `@/components/ui/sheet` | Slide-in panel (sidebar, modals) |
| Dialog | `@/components/ui/dialog` | Modal dialog |
| DropdownMenu | `@/components/ui/dropdown-menu` | Context menu |
| Toast | `sonner` | Toast notifications |

### Icon Mapping

Replace custom `Icon` component with lucide-react:

```tsx
// Before
<Icon name="heart" size={20} />

// After
import { Heart } from 'lucide-react'
<Heart className="h-5 w-5" />
```

Common mappings:
- `heart` → `Heart`
- `play` → `Play`
- `pause` → `Pause`
- `close` → `X`
- `chevron-up` → `ChevronUp`
- `download` → `Download`
- `share` → `Share2`

## Animation Patterns

### Page Transitions

```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.div>
```

### List Stagger

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
  >
    {item}
  </motion.div>
))}
```

### Button Feedback

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Sidebar Slide

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25 }}
    >
      {/* Sidebar content */}
    </motion.aside>
  )}
</AnimatePresence>
```

## Theming

Themes are defined via CSS variables in `globals.css`:

```css
[data-skin="rastaman"] {
  --background: 195 20% 7%;
  --foreground: 36 40% 96%;
  --primary: 28 100% 62%;
  /* ... */
}
```

Switch themes by setting `data-skin` on `<html>`:

```tsx
document.documentElement.setAttribute('data-skin', 'jaipur')
```

### Available Themes

- `rastaman` - Dark, warm, earthy tones
- `rastaman-light` - Light, paper-like warmth
- `jaipur` - Royal blues and golds
- `moon-dub` - Deep purples and neons

## Responsive Design

Tailwind's mobile-first approach:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Accessibility

All shadcn/ui components are built on Radix UI primitives, providing:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Reduced motion support

### Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion'

const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1 }}
>
  {/* Content */}
</motion.div>
```

## Migration Examples

See `docs/MIGRATION_GUIDE.md` for detailed component migration examples.

## Performance

### Bundle Size

- Tailwind purges unused classes in production
- Tree-shakeable imports from lucide-react
- Lazy load heavy components with React.lazy

### Optimization Tips

1. Use `React.memo` for expensive components
2. Lazy load modals and sheets
3. Virtualize long lists (@tanstack/react-virtual)
4. Optimize images with lazy loading

## Testing

### Visual Regression

Use tools like Chromatic or Percy to catch visual regressions.

### Accessibility Audit

Run axe DevTools or Lighthouse to verify accessibility.

### Performance

Monitor with Lighthouse:
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [lucide Icons](https://lucide.dev/icons)
- [Radix UI Docs](https://www.radix-ui.com/)

## Support

For questions or issues:
- See `docs/UX_ANALYSIS.md` for UX rationale
- See `docs/MIGRATION_GUIDE.md` for step-by-step migration
- See `docs/INTEGRATION.md` for general integration guide
