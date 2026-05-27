# @vbonline/player

Фронтовый движок мультимедиа-библиотеки: аудио, видео, тексты; каталог (Yandex Disk / `catalog.json`), плеер, плейлисты, офлайн, темы, PWA, embed.

**npm:** https://www.npmjs.com/package/@vbonline/player

## Документация

| Документ | Для кого |
|----------|----------|
| **[docs/INTEGRATION.md](./docs/INTEGRATION.md)** | Полная инструкция по подключению к новому Vite+React проекту |
| **[docs/AGENT.md](./docs/AGENT.md)** | Краткий указатель для AI-агента |

## Быстрый старт

```bash
npm install @vbonline/player @tanstack/react-virtual
```

```ts
// src/player/setup.ts
import { setPlayerConfig, DEFAULT_THEME_OPTIONS } from "@vbonline/player";

setPlayerConfig({
  branding: {
    appTitle: "Моя библиотека",
    siteName: "Моя библиотека",
    siteDescription: "Аудио, видео и тексты.",
  },
  sidebar: {
    brand: { title: "Моя библиотека", logoSrc: "/logo.svg" },
  },
  storage: {
    user: "my-app-user-v1",
    catalogRefresh: "my-app-catalog-refresh-v1",
    catalogCache: "my-app-catalog-cache-v1",
  },
  catalog: {
    publicDiskKey: "https://disk.yandex.ru/d/XXXX",
    apiRoot: "https://cloud-api.yandex.net/v1/disk/public/resources",
  },
  features: { offline: true, pwa: true, share: true, video: true, text: true },
  getFallbackCatalog: () => ({
    sourceTitle: "",
    tracks: [],
    folders: [],
    sections: [],
    loaded: false,
  }),
  themeOptions: DEFAULT_THEME_OPTIONS,
});
```

```tsx
// main.tsx — import "./player/setup" первым
// App.tsx
import { PlayerApp } from "@vbonline/player";

<PlayerApp renderHeader={(p) => <MyHeader {...p} />} />
```

Дальше — **[docs/INTEGRATION.md](./docs/INTEGRATION.md)** (Vite, env, CSS, catalog.json, embed, troubleshooting).

## Env

См. [.env.example](./.env.example).
