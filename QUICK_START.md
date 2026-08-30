# 🚀 Quick Start - Modern UI Stack

## Установка (5 минут)

```bash
# 1. Установить зависимости
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion lucide-react tailwindcss-animate sonner

# 2. Инициализировать Tailwind
npx tailwindcss init -p
```

## Настройка (2 минуты)

Скопируйте эти файлы из `@vbonline/player`:
- `tailwind.config.js`
- `postcss.config.js`
- `src/styles/globals.css`
- `src/lib/utils.ts`
- `src/components/ui/*` (все компоненты)

## Использование (примеры)

### Кнопка
```tsx
import { Button } from "@/components/ui/button"
<Button variant="default">Click me</Button>
```

### Иконка
```tsx
import { Heart } from 'lucide-react'
<Heart className="h-5 w-5 text-red-500" />
```

### Анимация
```tsx
import { motion } from 'framer-motion'
<motion.div whileHover={{ scale: 1.05 }}>Content</motion.div>
```

### Тема
```tsx
document.documentElement.setAttribute('data-skin', 'jaipur')
```

## Документация

- **Полный гид**: `docs/USAGE_GUIDE.md`
- **Миграция**: `docs/MIGRATION_GUIDE.md`
- **Примеры**: `docs/EXAMPLE_MIGRATED_TRACKCARD.tsx`

## Готово! 🎉

Теперь вы можете использовать современный стек в вашем приложении.
