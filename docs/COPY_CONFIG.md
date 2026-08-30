# 📋 Copy Configuration Guide

После установки зависимостей, скопируйте конфигурационные файлы в ваш проект.

## Файлы для копирования

### 1. Конфигурационные файлы (обязательно)

Скопируйте из `@vbonline/player` в корень вашего проекта:

```
tailwind.config.js       → your-project/tailwind.config.js
postcss.config.js        → your-project/postcss.config.js
components.json          → your-project/components.json
```

### 2. Глобальные стили (обязательно)

```
src/styles/globals.css   → your-project/src/styles/globals.css
```

Затем импортируйте в вашем entry point:

```tsx
// src/main.tsx или src/index.tsx
import './styles/globals.css'
```

### 3. Utility функции (обязательно)

```
src/lib/utils.ts         → your-project/src/lib/utils.ts
```

### 4. UI компоненты (обязательно)

Скопируйте всю директорию:

```
src/components/ui/       → your-project/src/components/ui/
```

Это включает:
- button.tsx
- card.tsx
- sheet.tsx
- dialog.tsx
- dropdown-menu.tsx
- icon.tsx
- skeleton.tsx
- progress.tsx
- slider.tsx
- switch.tsx
- toast.tsx

### 5. Анимации и хуки (рекомендуется)

```
src/components/PageTransition.tsx  → your-project/src/components/PageTransition.tsx
src/hooks/useAppTheme.new.ts       → your-project/src/hooks/useAppTheme.ts
```

### 6. Демо данные (опционально, для тестирования)

```
src/lib/mockData.ts      → your-project/src/lib/mockData.ts
src/lib/demoConfig.ts    → your-project/src/lib/demoConfig.ts
src/DemoApp.tsx          → your-project/src/DemoApp.tsx
demo.html                → your-project/demo.html
```

---

## Настройка path aliases

### TypeScript (tsconfig.json)

Добавьте в `compilerOptions`:

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

### Vite (vite.config.ts)

Если используете Vite:

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

### Webpack (webpack.config.js)

Если используете Webpack:

```js
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}
```

---

## Проверка настройки

Создайте тестовый компонент:

```tsx
// src/TestSetup.tsx
import { Button } from "@/components/ui/button"
import { Heart } from 'lucide-react'

export function TestSetup() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Setup Test</h1>
      <Button>
        <Heart className="mr-2 h-4 w-4" />
        Click me
      </Button>
    </div>
  )
}
```

Если компонент рендерится без ошибок — настройка успешна! ✅

---

## Troubleshooting

### Ошибка: "Cannot find module '@/components/ui/button'"

**Решение:** Проверьте настройку path aliases в tsconfig.json и bundler config.

### Ошибка: "Tailwind classes not working"

**Решение:** Убедитесь что:
1. `tailwind.config.js` содержит правильный `content` путь
2. `globals.css` импортирован в entry point
3. PostCSS настроен правильно

### Ошибка: "Module not found: lucide-react"

**Решение:**
```bash
npm install lucide-react
```

---

## Следующие шаги

После копирования конфигурации:

1. ✅ Протестируйте setup с тестовым компонентом
2. ✅ Начните миграцию (`docs/MIGRATION_GUIDE.md`)
3. ✅ Запустите демо режим (`docs/DEMO_MODE.md`)
