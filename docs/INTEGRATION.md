# Интеграция `@vbonline/player` в новый проект

Документ для разработчика и для AI-агента: пошаговое подключение плеера к **Vite + React 18** хост-приложению.

Пакет на npm: https://www.npmjs.com/package/@vbonline/player

---

## Чеклист для агента (выполнить по порядку)

- [ ] 1. Убедиться: React 18+, Vite 5+, TypeScript
- [ ] 2. `npm install @vbonline/player @tanstack/react-virtual` (+ peers `react`, `react-dom`)
- [ ] 3. Настроить `vite.config.ts` (`optimizeDeps`, `dedupe`) — см. §3
- [ ] 4. Создать `src/player/setup.ts` с `setPlayerConfig()` — см. §4
- [ ] 5. Импортировать setup **до** рендера в `main.tsx`
- [ ] 6. Добавить `<PlayerApp renderHeader={...} renderHero={...} />` на главную страницу
- [ ] 7. Подключить **CSS хоста** (в пакете стилей нет) — см. §8
- [ ] 8. Задать env: `VITE_MEDIA_BASE` **или** `VITE_AUDIO_PROXY_BASE` + Yandex Disk — см. §5–6
- [ ] 9. (Опционально) `public/sw.js` + `features.pwa` — см. §10
- [ ] 10. (Опционально) embed-страница — см. §11
- [ ] 11. Проверить: каталог грузится, audio/video/text открываются, sidebar работает

---

## 1. Что это за пакет

`@vbonline/player` — React-движок мультимедиа-библиотеки:

| Возможность | Описание |
|-------------|----------|
| Каталог | Аудио, видео, тексты; Yandex Disk или свой сервер (`catalog.json`) |
| Плеер | Audio bar, video bar, fullscreen text viewer |
| UX | Sidebar (разделы → папки), плейлисты, лайки, прогресс, shuffle/repeat |
| Офлайн | Скачивание папок/треков (только audio, если `features.offline`) |
| Темы | Skins через `data-skin` на `<html>` |
| PWA | Регистрация SW из хоста |
| Embed | Отдельный мини-плеер для одного трека |

**Важно:** в npm публикуются **исходники TypeScript** (`src/`), не скомпилированный `dist/`. Хост должен уметь обрабатывать `.ts` из `node_modules` (Vite — да).

---

## 2. Установка

```bash
npm install @vbonline/player@latest @tanstack/react-virtual
```

Peer dependencies (должны быть в проекте):

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

---

## 3. Vite (`vite.config.ts`)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@vbonline/player", "@tanstack/react-virtual"],
  },
  ssr: {
    noExternal: ["@vbonline/player"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
```

Без этого возможны ошибки резолва или дубли React.

---

## 4. Конфигурация (`setPlayerConfig`)

Создай файл **`src/player/setup.ts`** (путь произвольный, но импорт один раз при старте):

```ts
import {
  setPlayerConfig,
  DEFAULT_THEME_OPTIONS,
} from "@vbonline/player";

setPlayerConfig({
  appName: "my-app",

  storage: {
    user: "my-app-user-state-v1",
    catalogRefresh: "my-app-catalog-refresh-v1",
    catalogCache: "my-app-catalog-cache-v1",
    skin: "my-app-skin-v1",
    appearance: "my-app-appearance-v1",
    heroCollapsed: "my-app-hero-collapsed-v1",
    splashSeen: "my-app-splash-seen-v1",
  },

  catalog: {
    publicDiskKey: "https://disk.yandex.ru/d/XXXXXXXX",
    apiRoot: "https://cloud-api.yandex.net/v1/disk/public/resources",
  },

  features: {
    offline: true,
    pwa: true,
    share: true,
    video: true,
    text: true,
  },

  getFallbackCatalog: () => ({
    sourceTitle: "Библиотека",
    sections: [],
    folders: [],
    tracks: [],
    loaded: false,
  }),

  themeOptions: DEFAULT_THEME_OPTIONS,

  branding: {
    appTitle: "Моя библиотека",
    siteName: "Моя библиотека",
    siteDescription: "Описание для поисковиков и Open Graph.",
  },
  sidebar: {
    brand: { title: "Моя библиотека", logoSrc: "/logo.svg" },
  },
});
```

### Поля `PlayerConfig`

| Поле | Назначение |
|------|------------|
| `storage.*` | Ключи `localStorage` — **уникальны для каждого приложения** |
| `catalog.publicDiskKey` | Публичная ссылка или ключ папки Yandex Disk |
| `catalog.apiRoot` | API Disk: `https://cloud-api.yandex.net/v1/disk/public/resources` |
| `features.offline` | Офлайн-скачивание (audio) |
| `features.pwa` | Регистрация service worker |
| `features.share` | Share API / копирование ссылок |
| `features.video` | `false` — отключить видеоплеер |
| `features.text` | `false` — отключить просмотр текстов |
| `getFallbackCatalog` | Каталог до загрузки / при ошибке |
| `themeOptions` | Список скинов (или свой массив `ThemeMeta`) |

**Ошибка** `[@vbonline/player] Вызови setPlayerConfig()` — setup не импортирован до `<PlayerApp />`.

---

## 5. Точка входа (`main.tsx`)

```tsx
import "./player/setup"; // ← первым, до App
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

## 6. Страница с плеером (`App.tsx`)

```tsx
import { PlayerApp } from "@vbonline/player";
import { MyHeader } from "./components/MyHeader";
import { MyHero } from "./components/MyHero";

export default function App() {
  return (
    <PlayerApp
      renderHeader={(p) => <MyHeader {...p} />}
      renderHero={(p) => <MyHero {...p} />}
    />
  );
}
```

### Слоты

**`renderHeader`** (обязательный) — props:

| Prop | Тип | Назначение |
|------|-----|------------|
| `onOpenNav` | `() => void` | Открыть sidebar |
| `installPrompt` | `BeforeInstallPromptEvent \| null` | PWA install |
| `onInstall` | `() => void` | Вызвать prompt |
| `showIosInstallHint` | `boolean` | Подсказка «Добавить на экран» iOS |
| `onDismissIosHint` | `() => void` | Закрыть подсказку |
| `skin` | `AppSkin` | Текущая тема |
| `onSkinChange` | `(skin) => void` | Смена темы |

**`renderHero`** (опциональный) — props: `catalog`, `collapsed`, `onCollapse`, `onExpand`.

Минимальный header — кнопка меню + вызов `onOpenNav`.

---

## 7. Переменные окружения (`.env`)

Создай `.env` / `.env.production` в **корне хост-проекта**:

### Режим A — свой CDN / сервер (рекомендуется для prod)

```env
VITE_MEDIA_BASE=https://cdn.example.com/media
```

Структура на сервере:

```
/media/
  catalog.json
  Раздел1/
    Урок1/
      lecture.mp4
      notes.md
      audio.mp3
```

При наличии `VITE_MEDIA_BASE` worker сначала грузит `catalog.json`, при ошибке — fallback на Yandex Disk.

### Режим B — только Yandex Disk

```env
VITE_AUDIO_PROXY_BASE=https://your-backend.example.com/audio-proxy
```

Прокси обходит CORS для `downloader.disk.yandex.ru`. Без `VITE_MEDIA_BASE` и без proxy в prod в консоли будет warning — воспроизведение не заработает.

### Дополнительно (опционально)

```env
VITE_SITE_ORIGIN=https://example.com
VITE_YM_COUNTER_ID=12345678
```

| Переменная | Назначение |
|------------|------------|
| `VITE_MEDIA_BASE` | База URL медиа + `catalog.json` |
| `VITE_AUDIO_PROXY_BASE` | Прокси для href с Диска |
| `VITE_SITE_ORIGIN` | Canonical для Open Graph |
| `VITE_YM_COUNTER_ID` | Яндекс.Метрика |

---

## 8. Стили (обязательно на хосте)

В пакете **нет CSS**. Перенеси стили из своего UI-kit или напиши свои под BEM-классы движка.

### Базовая вёрстка (опционально)

```ts
// main.tsx
import "@vbonline/player/layout.css";
```

Файл чинит центрирование `.empty` в `.library-feed-content .cards` и другие layout-мелочи без полного UI-kit.

### Минимальный набор блоков

```
app-shell, main, has-player
sidebar, nav-backdrop, side-section, nav, nav-item
card, card--row, card-title, card-actions, card-play
player-bar, player-transport, player-timeline
video-player-bar, video-player-bar__video
text-viewer, text-viewer__body, text-viewer__pre
media-kind-filter, nav-section-block
pill, pill--kind, pill--kind-audio|video|text
toast, splash-screen
```

### Темы

Движок выставляет на `<html>`:

- `data-skin="rastaman" | "rastaman-light" | "jaipur" | "moon-dub"`
- `data-theme` — appearance (если используется)

CSS хоста должен содержать правила вида `[data-skin="jaipur"] { ... }`.

### Декоративные ассеты

Фоны/постеры тем — **файлы в `public/` хоста**, не в npm-пакете. Пути задаются в CSS хоста.

---

## 9. Формат `catalog.json` (режим `VITE_MEDIA_BASE`)

```json
{
  "sourceTitle": "База знаний",
  "sections": ["Введение", "Практика"],
  "folders": ["Урок 1", "Урок 2"],
  "tracks": [
    {
      "id": "unique-id-1",
      "title": "Лекция",
      "fileName": "lecture.mp4",
      "folder": "Урок 1",
      "folderPath": "/Введение/Урок 1",
      "path": "/Введение/Урок 1/lecture.mp4",
      "section": "Введение",
      "kind": "video",
      "mimeType": "video/mp4"
    },
    {
      "id": "unique-id-2",
      "title": "Конспект",
      "fileName": "notes.md",
      "folder": "Урок 1",
      "folderPath": "/Введение/Урок 1",
      "path": "/Введение/Урок 1/notes.md",
      "section": "Введение",
      "kind": "text"
    },
    {
      "id": "unique-id-3",
      "title": "Подкаст",
      "fileName": "podcast.mp3",
      "folder": "Урок 1",
      "folderPath": "/Введение/Урок 1",
      "path": "/Введение/Урок 1/podcast.mp3",
      "section": "Введение",
      "kind": "audio"
    }
  ]
}
```

### Поля трека (`Track`)

| Поле | Обязательно | Описание |
|------|-------------|----------|
| `id` | да | Уникальный id |
| `title` | да | Заголовок в UI |
| `fileName` | да | Имя файла с расширением |
| `folder` | да | Папка / серия в ленте |
| `folderPath` | да | Путь на диске/CDN |
| `path` | да | Путь для URL (`mediaUrlForPath`) |
| `section` | нет | Раздел в sidebar (верхний уровень) |
| `kind` | нет | `audio` \| `video` \| `text` — иначе по расширению |
| `url` | нет | Прямой URL (иначе строится из `VITE_MEDIA_BASE`) |

### Автоопределение `kind` по расширению

| kind | Расширения |
|------|------------|
| audio | mp3, m4a, ogg, wav, aac, flac |
| video | mp4, webm, mov, m4v, mkv |
| text | md, txt, html, htm, markdown |

---

## 10. Структура Yandex Disk (без catalog.json)

Индекс строится автоматически:

1. **Плоско:** папки в корне публичной ссылки → каждая папка = `folder`, медиафайлы внутри.
2. **Вложенно:** папка верхнего уровня = `section`, подпапки = `folder`, файлы в подпапках.

Поддерживаемые расширения — те же, что в таблице выше.

---

## 11. PWA / Service Worker

Если `features.pwa: true`:

1. Положи **`public/sw.js`** в хост (логика кэширования медиа — ответственность хоста).
2. SW регистрируется как `./sw.js` scope `./` (см. `src/pwa/register.ts`).
3. При обновлении SW показывается баннер «Доступна новая версия».

Без `sw.js` регистрация тихо падает — приложение работает онлайн.

---

## 12. Embed-страница (один трек)

**`embed.html`** + отдельный entry:

```tsx
// src/embed-main.tsx
import "./player/setup";
import React from "react";
import ReactDOM from "react-dom/client";
import { EmbedApp } from "@vbonline/player";

ReactDOM.createRoot(document.getElementById("root")!).render(<EmbedApp />);
```

**`vite.config.ts`:**

```ts
build: {
  rollupOptions: {
    input: {
      main: "index.html",
      embed: "embed.html",
    },
  },
},
```

Query-параметры embed: см. `src/lib/embed.ts` (track id, autoplay, start time).

---

## 13. Deep links (главное приложение)

| URL | Поведение |
|-----|-----------|
| `?track=<id>` | Открыть и играть трек |
| `?track=<id>&t=120` | С позиции 120 сек |
| `?album=<slug>` | Фильтр папки (slug из shareOg) |
| `?catalog=1` | OG каталога |

---

## 14. Публичный API пакета

```ts
// Главное
export { PlayerApp, EmbedApp };
export { setPlayerConfig, getPlayerConfig, storageKey };
export type { PlayerConfig, PlayerFeatures, PlayerStorageKeys, PlayerCatalogSource };

// Темы
export { DEFAULT_THEME_OPTIONS, getThemeOptions, applyDocumentTheme };
export type { AppSkin };

// Типы каталога
export type { Track, Catalog, MediaKind, MediaKindFilter };

// Слоты
export type { PlayerHeaderSlotProps, PlayerHeroSlotProps };

// Subpath (package.json exports)
import something from "@vbonline/player/lib/shareOg";
import { ... } from "@vbonline/player/themes";
```

---

## 15. Типичные ошибки

| Симптом | Решение |
|---------|---------|
| `setPlayerConfig()` | Импорт `./player/setup` в `main.tsx` до App |
| Пустой UI / нет стилей | Подключить CSS хоста (§8) |
| Каталог пустой | Проверить Disk key / `catalog.json` / CORS |
| Audio не играет в prod | Задать `VITE_MEDIA_BASE` или `VITE_AUDIO_PROXY_BASE` |
| Ошибка резолва `.ts` | §3 `optimizeDeps` |
| Invalid hook call | `dedupe` react в vite |
| `403` / `404` npm | 2FA / scope / версия уже опубликована |
| Video/text не открывается | `features.video` / `features.text` не `false` |

---

## 16. Брендинг (`branding`)

Все названия приложения — через config, без хардкода:

```ts
setPlayerConfig({
  branding: {
    appTitle: "База знаний",
    siteName: "База знаний — компания X",
    siteDescription: "Аудио, видео и статьи для команды.",
    shareAttribution: "Компания X",
    mediaSessionAlbum: "База знаний",
    embedOpenLabel: "Открыть в приложении",
    embedNotFound: "Запись не найдена",
    splashAriaLabel: "База знаний",
    itemLabel: "запись",
    itemLabelGenitivePlural: "записей",
    catalogShareTitle: "Каталог",
  },
  sidebar: {
    brand: {
      title: "База знаний", // приоритетнее branding.appTitle в сайдбаре
      logoSrc: "/logo.svg",
    },
  },
});
```

| Поле | Назначение |
|------|------------|
| `appTitle` | Короткое имя (embed, splash, fallback сайдбара) |
| `siteName` | OG / `document.title` |
| `siteDescription` | meta description главной |
| `shareAttribution` | Суффикс в share-текстах |
| `mediaSessionAlbum` | Media Session |
| `embedOpenLabel` | Ссылка в embed |
| `itemLabel` / `itemLabelGenitivePlural` | Подписи в пустых состояниях |

`appName` в config — deprecated, используй `branding.appTitle`.

---

## 17. Кастомизация сайдбара и тем

### Бренд (`.brand`)

```ts
setPlayerConfig({
  // ...
  sidebar: {
    brand: {
      show: true,           // false — скрыть весь блок бренда
      title: "Моя Библиотека",  // строка или "" чтобы скрыть текст
      logoSrc: "/my-logo.svg",  // URL / data-URI; null — скрыть img
      logoAlt: "Логотип",
    },
    themes: {
      show: true,           // false — скрыть переключатель тем
      label: "Оформление",  // подпись над переключателем (опционально)
    },
  },
});
```

| Поле | Тип | По умолчанию |
|------|-----|-------------|
| `sidebar.brand.show` | `boolean` | `true` |
| `sidebar.brand.title` | `string` | `branding.appTitle` или пусто |
| `sidebar.brand.logoSrc` | `string \| null \| undefined` | `/brand/logo.webp` |
| `sidebar.brand.logoAlt` | `string` | `""` |
| `sidebar.themes.show` | `boolean` | `true` |
| `sidebar.themes.label` | `string` | — (нет подписи) |

### Темы — только встроенные (подмножество)

```ts
import { DEFAULT_THEME_OPTIONS } from "@vbonline/player";

// Только 2 темы из 4 встроенных:
themeOptions: DEFAULT_THEME_OPTIONS.filter((t) =>
  ["rastaman", "jaipur"].includes(t.id)
),
```

### Темы — добавить свои

```ts
import { DEFAULT_THEME_OPTIONS, type ThemeMeta } from "@vbonline/player";

const myTheme: ThemeMeta = {
  id: "my-dark",          // произвольная строка
  label: "Моя тёмная",
  shortLabel: "Тёмная",
  description: "Фирменный тёмный стиль",
  mark: "★",              // иконка в кнопке переключателя
  dataTheme: "dark",      // значение data-theme на <html>
  themeColor: "#1a1a2e",  // meta theme-color для браузера
};

setPlayerConfig({
  themeOptions: [...DEFAULT_THEME_OPTIONS, myTheme],
  // ...
});
```

CSS хоста должен содержать стили для `[data-skin="my-dark"]`.

`AppSkin` принимает любую строку — кастомные id в `themeOptions` работают автоматически.

### Только свои темы (без встроенных)

```ts
themeOptions: [
  {
    id: "corp-light",
    label: "Корпоративная светлая",
    shortLabel: "Светлая",
    description: "",
    mark: "○",
    dataTheme: "corp-light",
    themeColor: "#ffffff",
  },
  {
    id: "corp-dark",
    label: "Корпоративная тёмная",
    shortLabel: "Тёмная",
    description: "",
    mark: "●",
    dataTheme: "dark",
    themeColor: "#0d0d0d",
  },
],
```

---

## 18. Обновление пакета

```bash
npm install @vbonline/player@latest
```

Проверь CHANGELOG / версию: `npm view @vbonline/player version`.

После мажорных обновлений — сверить этот документ и `README.md`.

---

## 19. Шаблон для копирования в новый репозиторий

```
my-app/
├── .env
├── index.html
├── embed.html          # опционально
├── public/
│   └── sw.js           # опционально
├── src/
│   ├── main.tsx
│   ├── embed-main.tsx  # опционально
│   ├── player/
│   │   └── setup.ts    # setPlayerConfig
│   ├── App.tsx         # PlayerApp + slots
│   └── styles/
│       └── player.css  # все классы из §8
└── vite.config.ts
```

---

## 20. Промпт для AI-агента (копипаст)

```
Интегрируй @vbonline/player в этот Vite+React проект по docs/INTEGRATION.md
из пакета (или по локальному docs/INTEGRATION.md в репозитории web-media-player).

Сделай: install deps, vite.config optimizeDeps+dedupe, src/player/setup.ts
с уникальными storage keys, импорт setup в main.tsx, App с PlayerApp и
заглушками Header/Hero, .env.example с VITE_MEDIA_BASE, player.css с классами
из §8, README с ссылкой на инструкцию.

Не коммить .env с секретами. catalog.publicDiskKey — placeholder.
```

---

*Версия документа: для `@vbonline/player` ≥ 0.2.x*
