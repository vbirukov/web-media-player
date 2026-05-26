# Вынос `@haiduk/player` в отдельный git-репозиторий

## 1. Создай репо

```bash
mkdir haiduk-player && cd haiduk-player
git init
```

Скопируй **только** папку `player-engine/` из Gaiduk (корень нового репо = бывший `player-engine/`):

```powershell
# из корня gaiduk
Copy-Item -Recurse player-engine\* C:\path\to\haiduk-player\
```

В корне нового репо должны лежать `package.json`, `src/`, `README.md`, `docs/`.

## 2. Проверь сборку потребителя

В Gaiduk пока alias:

```ts
// vite.config.ts
"@haiduk/player": path.resolve(rootDir, "player-engine/src")
```

После publish замени на npm-зависимость.

## 3. Publish (GitHub Packages или npm)

```bash
cd haiduk-player
npm login
npm publish --access public
# или scope @haiduk: npm publish --access restricted
```

Версия: `0.1.0` → дальше semver.

## 4. Подключи в Gaiduk

```bash
cd gaiduk
npm install @haiduk/player@0.1.0
```

Удали alias из `vite.config.ts` / `tsconfig paths` (Vite резолвит из `node_modules`).

`main.tsx` / `embed.tsx` — без изменений, только импорт из пакета.

## 5. Второй контент-проект

Минимум:

| Файл | Содержимое |
|------|------------|
| `src/app/config.ts` | `setPlayerConfig({ storage, catalog, features, getFallbackCatalog, themeOptions })` |
| `src/App.tsx` | `<PlayerApp renderHeader renderHero />` |
| `main.tsx` | `setPlayerConfig` + `createRoot` |
| `public/sw.js` | shell + audio cache (скопировать паттерн из Gaiduk) |
| CSS | темы из Gaiduk или свои поверх `data-skin` |

Остаётся у хоста: брендинг (hero, header), `fallbackCatalog`, deploy, nginx `/media/`, proxy, oEmbed (опционально).

## 6. Что не входит в пакет

- `LibraryHero`, `MainHeader`, фото автора
- `scripts/deploy.mjs`, nginx, `audio-proxy-server.mjs`
- `generate-share-og.mjs` (можно вынести позже)
- ассеты `public/gaiduk/*`

## 7. Чеклист после выноса

- [ ] `npm run typecheck` в engine
- [ ] `npm run build` в Gaiduk
- [ ] embed.html smoke
- [ ] офлайн / PWA на staging
- [ ] bump `@haiduk/player` в Gaiduk `package.json`
