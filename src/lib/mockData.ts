/**
 * MOCK data for demo mode
 * Provides sample catalog, tracks, and user data for testing
 */

import type { Catalog, Track } from '../types/catalog'
import type { UserState } from '../types/user'

/**
 * Образцы медиа для демо — публично доступные и стабильные URL,
 * чтобы треки реально проигрывались без backend.
 */
const DEMO_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-'
const DEMO_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/'

// data:-URI даёт текстам контент без backend (fetch() работает с data: URL).
function textDataUri(markdown: string): string {
  return `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`
}

export const mockTracks: Track[] = [
  // Audio tracks
  {
    id: 'audio-1',
    title: 'Введение в медитацию',
    fileName: 'meditation-intro.mp3',
    folder: 'Основы медитации',
    folderPath: '/Практика/Основы медитации',
    path: '/Практика/Основы медитации/meditation-intro.mp3',
    section: 'Практика',
    kind: 'audio',
    mimeType: 'audio/mp3',
    url: `${DEMO_AUDIO}1.mp3`,
  },
  {
    id: 'audio-2',
    title: 'Дыхательные практики',
    fileName: 'breathing.mp3',
    folder: 'Основы медитации',
    folderPath: '/Практика/Основы медитации',
    path: '/Практика/Основы медитации/breathing.mp3',
    section: 'Практика',
    kind: 'audio',
    mimeType: 'audio/mp3',
    url: `${DEMO_AUDIO}2.mp3`,
  },
  {
    id: 'audio-3',
    title: 'Утренняя медитация',
    fileName: 'morning-meditation.mp3',
    folder: 'Ежедневные практики',
    folderPath: '/Практика/Ежедневные практики',
    path: '/Практика/Ежедневные практики/morning-meditation.mp3',
    section: 'Практика',
    kind: 'audio',
    mimeType: 'audio/mp3',
    url: `${DEMO_AUDIO}3.mp3`,
  },
  {
    id: 'audio-4',
    title: 'Вечерняя релаксация',
    fileName: 'evening-relax.mp3',
    folder: 'Ежедневные практики',
    folderPath: '/Практика/Ежедневные практики',
    path: '/Практика/Ежедневные практики/evening-relax.mp3',
    section: 'Практика',
    kind: 'audio',
    mimeType: 'audio/mp3',
    url: `${DEMO_AUDIO}4.mp3`,
  },
  {
    id: 'audio-5',
    title: 'Глубокая концентрация',
    fileName: 'deep-focus.mp3',
    folder: 'Продвинутые техники',
    folderPath: '/Практика/Продвинутые техники',
    path: '/Практика/Продвинутые техники/deep-focus.mp3',
    section: 'Практика',
    kind: 'audio',
    mimeType: 'audio/mp3',
    url: `${DEMO_AUDIO}5.mp3`,
  },

  // Video tracks
  {
    id: 'video-1',
    title: 'Йога для начинающих',
    fileName: 'yoga-beginners.mp4',
    folder: 'Йога',
    folderPath: '/Видео/Йога',
    path: '/Видео/Йога/yoga-beginners.mp4',
    section: 'Видео',
    kind: 'video',
    mimeType: 'video/mp4',
    url: `${DEMO_VIDEO}BigBuckBunny.mp4`,
  },
  {
    id: 'video-2',
    title: 'Растяжка всего тела',
    fileName: 'full-stretch.mp4',
    folder: 'Йога',
    folderPath: '/Видео/Йога',
    path: '/Видео/Йога/full-stretch.mp4',
    section: 'Видео',
    kind: 'video',
    mimeType: 'video/mp4',
    url: `${DEMO_VIDEO}ElephantsDream.mp4`,
  },
  {
    id: 'video-3',
    title: 'Медитация с визуализацией',
    fileName: 'visualization.mp4',
    folder: 'Медитации',
    folderPath: '/Видео/Медитации',
    path: '/Видео/Медитации/visualization.mp4',
    section: 'Видео',
    kind: 'video',
    mimeType: 'video/mp4',
    url: `${DEMO_VIDEO}ForBiggerBlazes.mp4`,
  },

  // Text tracks
  {
    id: 'text-1',
    title: 'Основы осознанности',
    fileName: 'mindfulness-basics.md',
    folder: 'Теория',
    folderPath: '/Статьи/Теория',
    path: '/Статьи/Теория/mindfulness-basics.md',
    section: 'Статьи',
    kind: 'text',
    url: textDataUri(`# Основы осознанности

Осознанность — это способность быть полностью присутствующим в текущем моменте.

## Ключевые принципы

1. **Внимание к настоящему** — фокус на том, что происходит сейчас
2. **Безоценочность** — наблюдение без критики
3. **Принятие** — позволение вещам быть такими, какие они есть

## Практика

Начните с 5 минут в день. Сядьте удобно, закройте глаза и наблюдайте за дыханием.`),
  },
  {
    id: 'text-2',
    title: 'Научные исследования медитации',
    fileName: 'research.md',
    folder: 'Теория',
    folderPath: '/Статьи/Теория',
    path: '/Статьи/Теория/research.md',
    section: 'Статьи',
    kind: 'text',
    url: textDataUri(`# Научные исследования медитации

Многочисленные исследования подтверждают пользу медитации.

## Основные выводы

- Снижение стресса на 40%
- Улучшение концентрации
- Лучший сон
- Снижение тревожности

## Источники

- Harvard Medical School, 2023
- Journal of Mindfulness, 2024`),
  },
  {
    id: 'text-3',
    title: 'Руководство по дыханию',
    fileName: 'breathing-guide.md',
    folder: 'Практические руководства',
    folderPath: '/Статьи/Практические руководства',
    path: '/Статьи/Практические руководства/breathing-guide.md',
    section: 'Статьи',
    kind: 'text',
    url: textDataUri(`# Руководство по дыханию

Правильное дыхание — основа всех медитативных практик.

## Техника 4-7-8

1. Вдох через нос (4 секунды)
2. Задержка дыхания (7 секунд)
3. Выдох через рот (8 секунд)

Повторите 4 цикла.`),
  },
]

export const mockCatalog: Catalog = {
  sourceTitle: 'Демо библиотека',
  sections: ['Практика', 'Видео', 'Статьи'],
  folders: [
    'Основы медитации',
    'Ежедневные практики',
    'Продвинутые техники',
    'Йога',
    'Медитации',
    'Теория',
    'Практические руководства',
  ],
  tracks: mockTracks,
  loaded: true,
}

export const mockUserState: UserState = {
  lastTrackId: null,
  likes: {},
  playlists: [
    {
      id: 'playlist-1',
      name: 'Избранное',
      trackIds: [],
      system: false,
    },
  ],
  progress: {},
  shuffle: false,
  repeatMode: 'off',
  volume: 0.7,
  playbackRate: 1,
  wakeLock: false,
  feedListenFilter: 'all',
  feedLayout: 'tiles',
}

// Helper to get mock content for text files
export function getMockTextContent(trackId: string): string {
  const contents: Record<string, string> = {
    'text-1': `# Основы осознанности

Осознанность — это способность быть полностью присутствующим в текущем моменте.

## Ключевые принципы

1. **Внимание к настоящему** - фокус на том, что происходит сейчас
2. **Безоценочность** - наблюдение без критики
3. **Принятие** - позволение вещам быть такими, какие они есть

## Практика

Начните с 5 минут в день. Сядьте удобно, закройте глаза и наблюдайте за дыханием.`,
    
    'text-2': `# Научные исследования медитации

Многочисленные исследования подтверждают пользу медитации.

## Основные findings

- Снижение стресса на 40%
- Улучшение концентрации
- Лучший сон
- Снижение тревожности

## Источники

Harvard Medical School, 2023
Journal of Mindfulness, 2024`,
    
    'text-3': `# Руководство по дыханию

Правильное дыхание — основа всех медитативных практик.

## Техника 4-7-8

1. Вдох через нос (4 секунды)
2. Задержка дыхания (7 секунд)
3. Выдох через рот (8 секунд)

Повторите 4 цикла.`,
  }
  
  return contents[trackId] || '# Content not found'
}
