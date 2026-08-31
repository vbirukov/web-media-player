# Migration Guide: BEM CSS → Tailwind CSS + shadcn/ui

This guide helps you migrate the `@vbirukov/player` from custom BEM CSS to modern Tailwind CSS with shadcn/ui components.

## Prerequisites

Before starting, ensure your host application has:
- React 18+
- TypeScript
- Vite 5+ (or similar bundler)

## Step 1: Install Dependencies

```bash
# Core dependencies
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion lucide-react
npm install tailwindcss-animate

# shadcn/ui CLI (optional, for adding components)
npx shadcn-ui@latest init
```

## Step 2: Configure Tailwind

Create or update `tailwind.config.js` in your project root:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@vbirukov/player/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

Create `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 3: Add Global Styles

Create `src/styles/globals.css` and import it in your app entry point:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    /* Dark mode variables */
  }
}

/* Theme-specific variables */
[data-skin="rastaman"] {
  --background: 195 20% 7%;
  --foreground: 36 40% 96%;
  /* ... */
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

Import in your app:

```tsx
// main.tsx
import './styles/globals.css'
```

## Step 4: Update tsconfig.json

Add path aliases for cleaner imports:

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

## Step 5: Replace Icon Component

### Before (Custom Icons)
```tsx
import { Icon } from "@vbirukov/player";

<Icon name="heart" size={20} />
<Icon name="chevron-up" size={14} />
```

### After (lucide-react)
```tsx
import { Heart, ChevronUp } from 'lucide-react';

<Heart className="h-5 w-5" />
<ChevronUp className="h-3.5 w-3.5" />
```

**Icon Mapping:**
| Old Name | Lucide Component |
|----------|------------------|
| heart | Heart |
| heart-outline | Heart (with outline style) |
| play | Play |
| pause | Pause |
| skip-back | SkipBack |
| skip-forward | SkipForward |
| shuffle | Shuffle |
| repeat | Repeat |
| volume | Volume2 |
| volume-mute | VolumeX |
| close | X |
| chevron-up | ChevronUp |
| chevron-down | ChevronDown |
| check | Check |
| download | Download |
| share | Share2 |
| list-plus | ListPlus |
| loader | Loader2 |
| wake | Sun (or Moon) |

## Step 6: Migrate Components

### Example: TrackCard

#### Before
```tsx
<article className={`card ${isRow ? 'card--row' : ''}`}>
  <div className="card-bg">
    <div className="card-bg__shade" />
  </div>
  <h4 className="card-title">{track.title}</h4>
  <button className="ghost round">
    <Icon name="heart" size={20} />
  </button>
</article>
```

#### After
```tsx
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

<motion.article
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className={cn(
    "relative overflow-hidden rounded-xl border bg-card p-4",
    "hover:shadow-lg hover:border-primary/50",
    "transition-all duration-200",
    isRow && "flex items-center gap-4"
  )}
>
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  
  <h4 className="font-semibold text-foreground line-clamp-2">
    {track.title}
  </h4>
  
  <button
    onClick={() => onToggleLike(track.id)}
    className={cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-full",
      "hover:bg-accent transition-colors",
      liked && "text-red-500"
    )}
  >
    <Heart className={cn("h-5 w-5", liked && "fill-current")} />
  </button>
</motion.article>
```

### Key Changes:
1. **BEM classes** → **Tailwind utility classes**
2. **Custom Icon** → **lucide-react components**
3. **Static element** → **motion.element** for animations
4. **Manual spacing** → **Tailwind spacing scale** (p-4, gap-4, etc.)
5. **CSS variables** → **Tailwind theme tokens** (bg-card, text-foreground)

## Step 7: Add shadcn/ui Components

Install components as needed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

### Example: Using shadcn/ui Button

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="sm">
  Play
</Button>

<Button variant="ghost" size="icon">
  <Heart className="h-5 w-5" />
</Button>
```

## Step 8: Add Framer Motion Animations

### Sidebar Animation

```tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {navOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50 shadow-xl"
      >
        {/* Content */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

### List Item Stagger

```tsx
<tracks.map((track, index) => (
  <motion.div
    key={track.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <TrackCard track={track} />
  </motion.div>
))}
```

## Step 9: Theme Switching

Themes now work via CSS variables. Update the `useAppTheme` hook:

```tsx
import { useEffect } from 'react';

export function useAppTheme() {
  const [skin, setSkin] = useState<AppSkin>('rastaman');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    
    // Update meta theme-color
    const themeColors: Record<AppSkin, string> = {
      'rastaman': '#0C1115',
      'rastaman-light': '#F3E0BC',
      'jaipur': '#1e3a8a',
      'moon-dub': '#0f172a',
    };
    
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themeColors[skin]);
  }, [skin]);
  
  return { skin, setSkin };
}
```

## Step 10: Remove Old CSS

After migrating all components:

1. Delete `src/styles/layout.css`
2. Remove any remaining BEM class references
3. Update exports in `package.json` if needed

## Testing Checklist

- [ ] All components render correctly
- [ ] Theme switching works
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces elements correctly
- [ ] Animations are smooth (60fps)
- [ ] Reduced motion preference respected
- [ ] Bundle size acceptable

## Troubleshooting

### Issue: Styles not applying
**Solution**: Ensure Tailwind is scanning the correct paths in `content` array.

### Issue: Icons not showing
**Solution**: Import specific icons from `lucide-react`, not using a generic Icon component.

### Issue: Animations not working
**Solution**: Wrap components in `<AnimatePresence>` when conditionally rendering.

### Issue: Theme variables not updating
**Solution**: Ensure `data-skin` attribute is set on `<html>` element, not `<body>`.

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [lucide-react Icons](https://lucide.dev/icons)

## Support

For issues or questions, refer to:
- Original documentation: `docs/INTEGRATION.md`
- UX Analysis: `docs/UX_ANALYSIS.md`
