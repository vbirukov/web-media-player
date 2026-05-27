# Инструкция для AI-агента

При подключении `@vbonline/player` к проекту пользователя **обязательно** открой и выполни:

**[INTEGRATION.md](./INTEGRATION.md)**

## Краткие правила

1. Пакет публикует **TypeScript source** — нужен Vite + `optimizeDeps.include: ["@vbonline/player"]`.
2. `setPlayerConfig()` — **до** любого `PlayerApp` / `EmbedApp`, отдельный файл `src/player/setup.ts`.
3. **CSS не в пакете** — хост должен иметь stylesheet с классами из INTEGRATION.md §8.
4. Медиа: `VITE_MEDIA_BASE` (catalog.json) **или** Yandex Disk + `VITE_AUDIO_PROXY_BASE`.
5. `storage.*` ключи — **уникальны** для каждого приложения.
6. Peers: `react`, `react-dom`, `@tanstack/react-virtual`.
7. Не добавляй path-alias на локальный клон, если пользователь просит npm — используй `@vbonline/player`.

## Не делать

- Не пропускать `setPlayerConfig` и не встраивать config внутрь React state без необходимости.
- Не ожидать стили из `node_modules/@vbonline/player` — их нет.
- Не коммитить npm tokens / `.npmrc` с `_authToken`.

## После интеграции проверить

- `npm run build` проходит
- Sidebar открывается, каталог не пустой (или осознанный fallback)
- Клик по audio → нижний player bar
- Клик по video → video bar
- Клик по text → fullscreen viewer
