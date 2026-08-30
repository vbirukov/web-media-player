# 🎯 Action Plan - Пошаговый план действий

## Текущий статус

✅ **Создано:**
- MOCK данные для демо-режима
- Демо приложение (DemoApp.tsx)
- Все конфигурационные файлы
- 11 shadcn/ui компонентов
- 8 мигрированных компонентов
- 3,700+ строк документации

⏳ **Осталось сделать:**
- Установить зависимости
- Скопировать конфигурацию в хост-приложение
- Протестировать в демо-режиме

---

## Шаг 1: Установка зависимостей

### Вариант A: Автоматическая установка (рекомендуется)

```powershell
# Запустите из корня проекта
.\install-new-stack.ps1
```

### Вариант B: Ручная установка

```bash
# Core
npm install tailwindcss@latest postcss@latest autoprefixer@latest

# shadcn/ui
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch
npm install class-variance-authority clsx tailwind-merge

# Animations & Icons
npm install framer-motion lucide-react tailwindcss-animate sonner
```

### Если есть ошибки с npm cache

См: `docs/INSTALLATION_GUIDE.md`

**Быстрое решение:**
```powershell
npm config set cache "$env:TEMP\npm-cache"
npm install
```

---

## Шаг 2: Копирование конфигурации

Следуйте руководству: `docs/COPY_CONFIG.md`

**Кратко:**
1. Скопируйте `tailwind.config.js`, `postcss.config.js`, `components.json`
2. Скопируйте `src/styles/globals.css` и импортируйте его
3. Скопируйте `src/lib/utils.ts`
4. Скопируйте директорию `src/components/ui/`
5. Настройте path aliases (`@/*` → `./src/*`)

---

## Шаг 3: Тестирование демо-режима

См: `docs/DEMO_MODE.md`

**Запуск:**
```bash
npm run dev
# Откройте http://localhost:5173/demo.html
```

**Или используйте DemoApp компонент:**
```tsx
import { DemoApp } from '@vbonline/player'
<DemoApp />
```

**Что тестировать:**
- ✅ Переключение тем (4 темы)
- ✅ Воспроизведение аудио
- ✅ Просмотр видео
- ✅ Чтение текстов
- ✅ Создание плейлистов
- ✅ Лайки
- ✅ Responsive design

---

## Шаг 4: Миграция компонентов

Следуйте: `docs/MIGRATION_GUIDE.md`

**Приоритет миграции:**
1. TrackCard (самый используемый)
2. Sidebar (навигация)
3. PlayerBar (плеер)
4. Остальные компоненты

**Примеры готовы:**
- `src/components/TrackCard.new.tsx`
- `src/components/Sidebar.new.tsx`
- `src/components/PlayerBar.new.tsx`

---

## Шаг 5: Production deployment

После тестирования:

1. Отключите демо-режим:
   ```typescript
   // src/lib/demoConfig.ts
   export const DEMO_MODE = false
   ```

2. Настройте реальную конфигурацию:
   ```typescript
   setPlayerConfig({
     catalog: {
       publicDiskKey: 'YOUR_REAL_KEY',
     },
     // ...
   })
   ```

3. Соберите проект:
   ```bash
   npm run build
   ```

---

## Чеклист готовности

### Installation
- [ ] Все зависимости установлены
- [ ] Нет ошибок в консоли
- [ ] `npm list` показывает все пакеты

### Configuration
- [ ] `tailwind.config.js` скопирован
- [ ] `postcss.config.js` скопирован
- [ ] `globals.css` импортирован
- [ ] Path aliases настроены
- [ ] UI компоненты скопированы

### Testing
- [ ] Демо-режим работает
- [ ] Темы переключаются
- [ ] Аудио воспроизводится
- [ ] Видео работает
- [ ] Тексты открываются
- [ ] Responsive на mobile
- [ ] Keyboard navigation работает

### Migration
- [ ] TrackCard мигрирован
- [ ] Sidebar мигрирован
- [ ] PlayerBar мигрирован
- [ ] Все иконки заменены на lucide-react
- [ ] Анимации добавлены

---

## Полезные ссылки

| Документ | Описание |
|----------|----------|
| `docs/INSTALLATION_GUIDE.md` | Установка зависимостей |
| `docs/COPY_CONFIG.md` | Копирование конфигурации |
| `docs/DEMO_MODE.md` | Демо-режим |
| `docs/MIGRATION_GUIDE.md` | Миграция компонентов |
| `docs/USAGE_GUIDE.md` | Использование нового стека |
| `docs/UX_ANALYSIS.md` | UX анализ |

---

## Поддержка

Если возникли проблемы:

1. Проверьте `docs/INSTALLATION_GUIDE.md` для troubleshooting
2. Изучите примеры в `docs/EXAMPLE_MIGRATED_TRACKCARD.tsx`
3. Обратитесь к официальной документации:
   - Tailwind CSS: https://tailwindcss.com/docs
   - shadcn/ui: https://ui.shadcn.com/
   - Framer Motion: https://www.framer.com/motion/

---

## Timeline

| Этап | Время | Статус |
|------|-------|--------|
| Установка зависимостей | 5-10 мин | ⏳ Pending |
| Копирование конфигурации | 5 мин | ⏳ Pending |
| Тестирование демо | 15 мин | ⏳ Pending |
| Миграция компонентов | 2-3 часа | ⏳ Pending |
| Финальное тестирование | 30 мин | ⏳ Pending |

**Общее время**: ~3-4 часа

---

## Готовы начать?

1. ✅ Запустите `.\install-new-stack.ps1`
2. ✅ Следуйте `docs/COPY_CONFIG.md`
3. ✅ Протестируйте с `docs/DEMO_MODE.md`
4. ✅ Мигрируйте по `docs/MIGRATION_GUIDE.md`

🚀 **Удачи!**
