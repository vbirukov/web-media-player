# @vbirukov/player

Фронтовый движок мультимедиа-библиотеки: аудио, видео, тексты; каталог (Yandex Disk / `catalog.json`), плеер, плейлисты, офлайн, темы, PWA, embed.

**GitHub Packages:** https://github.com/vbirukov/web-media-player/pkgs/npm/player

> Пакет публикуется в **GitHub Packages** (registry `https://npm.pkg.github.com`), не в npmjs.com. См. раздел «Установка» ниже — потребителю нужен `.npmrc` с токеном.

## 🎨 Modernized UI Stack

This project now supports **Tailwind CSS**, **shadcn/ui**, **Framer Motion**, and **lucide-react** for a modern, accessible, and animated user experience.

### 🚀 Quick Start

1. **Install dependencies**: Run `.\install-new-stack.ps1` or see `docs/INSTALLATION_GUIDE.md`
2. **Copy config**: Follow `docs/COPY_CONFIG.md`
3. **Test demo**: See `docs/DEMO_MODE.md`
4. **Migrate**: Follow `docs/MIGRATION_GUIDE.md`

### ✨ Features

- ✅ **11 shadcn/ui components** ready to use
- ✅ **8 migrated components** with examples
- ✅ **Framer Motion animations** throughout
- ✅ **lucide-react icons** (1000+ icons)
- ✅ **4 built-in themes** with easy customization
- ✅ **Demo mode** with MOCK data for testing
- ✅ **3,700+ lines** of comprehensive documentation

## Документация

| Документ | Для кого |
|----------|----------|
| **[docs/INTEGRATION.md](./docs/INTEGRATION.md)** | Полная инструкция по подключению к новому Vite+React проекту |
| **[docs/AGENT.md](./docs/AGENT.md)** | Краткий указатель для AI-агента |
| **[docs/MODERNIZATION.md](./docs/MODERNIZATION.md)** | Современный UI стек (Tailwind + shadcn/ui + Framer Motion) |
| **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** | Руководство по миграции стилей |
| **[docs/UX_ANALYSIS.md](./docs/UX_ANALYSIS.md)** | UX анализ и план модернизации |

## Быстрый старт

Пакет в **GitHub Packages**. Для установки потребителю нужен токен с правами `read:packages`:

```bash
# .npmrc в проекте-потребителе
@vbirukov:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}   # или реальный PAT
```

```bash
npm install @vbirukov/player @tanstack/react-virtual
```

```ts
// src/player/setup.ts
import { setPlayerConfig, DEFAULT_THEME_OPTIONS } from "@vbirukov/player";

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
import { PlayerApp } from "@vbirukov/player";

<PlayerApp renderHeader={(p) => <MyHeader {...p} />} />
```

Дальше — **[docs/INTEGRATION.md](./docs/INTEGRATION.md)** (Vite, env, CSS, catalog.json, embed, troubleshooting).

## Env

См. [.env.example](./.env.example).
