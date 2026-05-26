# @vbonline/player

Фронтовый движок мультимедиа-библиотеки: аудио, видео, тексты; каталог (Yandex Disk / локальные media), плеер, плейлисты, офлайн, темы, PWA, embed.

## Быстрый старт (в монорепо Gaiduk)

```ts
import { setPlayerConfig, PlayerApp } from "@vbonline/player";

setPlayerConfig({
  storage: { user: "my-app-user-v1", /* ... */ },
  catalog: { publicDiskKey: "...", apiRoot: "..." },
  features: { offline: true, pwa: true, share: true },
  getFallbackCatalog: () => ({
    tracks: [],
    folders: [],
    sections: [],
    loaded: false,
  }),
  features: { offline: true, pwa: true, share: true, video: true, text: true },
  themeOptions: DEFAULT_THEME_OPTIONS,
});

<PlayerApp
  renderHeader={(p) => <MyHeader {...p} />}
  renderHero={(p) => <MyHero {...p} />}
/>
```

## Типы контента

| kind | расширения (Диск / `catalog.json`) |
|------|-------------------------------------|
| audio | mp3, m4a, ogg, wav, … |
| video | mp4, webm, mov, … |
| text | md, txt, html |

В сайдбаре: фильтр по типу + дерево **раздел → папка** (вложенные папки на Диске → раздел = верхний каталог).

Поля в `catalog.json`: `kind`, `section` (опционально).

## Стили хоста

Добавь CSS для новых блоков: `.video-player-bar`, `.text-viewer`, `.media-kind-filter`, `.nav-section-block`, `.pill--kind`.

## Отдельное репо

См. [docs/ENGINE_EXTRACT.md](./docs/ENGINE_EXTRACT.md).
