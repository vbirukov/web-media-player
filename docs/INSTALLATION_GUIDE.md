# 📦 Installation Guide - Установка зависимостей

## Проблема с npm cache

Если вы видите ошибку `EPERM: operation not permitted` при установке, это проблема с правами доступа к npm cache на Windows.

## Решение 1: Очистка cache (рекомендуется)

```bash
# Запустите PowerShell от имени Администратора
npm cache clean --force

# Затем установите зависимости
npm install
```

## Решение 2: Изменение директории cache

```bash
# Создайте новую директорию для cache
mkdir C:\npm-cache

# Настройте npm использовать её
npm config set cache C:\npm-cache

# Установите зависимости
npm install
```

## Решение 3: Использование yarn вместо npm

```bash
# Установите yarn
npm install -g yarn

# Используйте yarn для установки
yarn install
```

## Решение 4: Ручная установка (если ничего не помогает)

Создайте файл `install-deps.ps1`:

```powershell
# Отключить проверку cache
$env:npm_config_cache = "$env:TEMP\npm-cache"

# Установить зависимости
npm install --no-optional
```

Запустите:
```powershell
.\install-deps.ps1
```

---

## Необходимые зависимости

### Core dependencies

```json
{
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

### shadcn/ui dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-progress": "^1.x",
    "@radix-ui/react-slider": "^1.x",
    "@radix-ui/react-slot": "^1.x",
    "@radix-ui/react-switch": "^1.x",
    "class-variance-authority": "^0.7",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

### Animations and Icons

```json
{
  "dependencies": {
    "framer-motion": "^10.x",
    "lucide-react": "^0.x",
    "tailwindcss-animate": "^1.x"
  }
}
```

### Toast notifications

```json
{
  "dependencies": {
    "sonner": "^1.x"
  }
}
```

---

## Полная команда установки

```bash
# Одним命令ом (npm)
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion lucide-react tailwindcss-animate sonner
```

Или используйте yarn:

```bash
yarn add tailwindcss postcss autoprefixer -D
yarn add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch
yarn add class-variance-authority clsx tailwind-merge
yarn add framer-motion lucide-react tailwindcss-animate sonner
```

---

## Проверка установки

После установки проверьте:

```bash
# Проверьте установленные пакеты
npm list tailwindcss
npm list framer-motion
npm list lucide-react

# Или
yarn list --pattern tailwindcss
```

---

## Troubleshooting

### Ошибка: "Cannot find module 'tailwindcss'"

**Решение:**
```bash
npm install tailwindcss --save-dev
```

### Ошибка: "Module not found: Can't resolve 'framer-motion'"

**Решение:**
```bash
npm install framer-motion
```

### Ошибка: "EPERM" на Windows

См. раздел "Проблема с npm cache" выше.

### Конфликт версий React

Убедитесь что используете React 18+:
```bash
npm install react@^18 react-dom@^18
```

---

## Следующие шаги

После успешной установки:

1. ✅ Перейдите к копированию конфигурации (`docs/COPY_CONFIG.md`)
2. ✅ Начните миграцию компонентов (`docs/MIGRATION_GUIDE.md`)
3. ✅ Протестируйте приложение (`docs/DEMO_MODE.md`)
