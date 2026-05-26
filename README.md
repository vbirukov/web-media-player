# @haiduk/player

Фронтовый движок аудио-библиотеки: каталог (Yandex Disk / локальные media), плеер, плейлисты, офлайн, темы, PWA, embed.

## Быстрый старт (в монорепо Gaiduk)

```ts
import { setPlayerConfig, PlayerApp } from "@haiduk/player";

setPlayerConfig({
  storage: { user: "my-app-user-v1", /* ... */ },
  catalog: { publicDiskKey: "...", apiRoot: "..." },
  features: { offline: true, pwa: true, share: true },
  getFallbackCatalog: () => ({ tracks: [], folders: [], loaded: false }),
  themeOptions: DEFAULT_THEME_OPTIONS,
});

<PlayerApp
  renderHeader={(p) => <MyHeader {...p} />}
  renderHero={(p) => <MyHero {...p} />}
/>
```

## Отдельное репо

См. [docs/ENGINE_EXTRACT.md](./docs/ENGINE_EXTRACT.md).
