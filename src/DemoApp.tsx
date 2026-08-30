/**
 * Demo App - Standalone demo with MOCK data
 * Run this to test the player without backend
 */

import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { setPlayerConfig, DEFAULT_THEME_OPTIONS } from './playerConfig'
import { PlayerApp } from './PlayerApp'
import { DEMO_MODE, loadDemoCatalog } from './lib/demoConfig'

// Configure player for demo mode
setPlayerConfig({
  appName: 'demo-player',
  
  storage: {
    user: 'demo-user-state-v1',
    catalogRefresh: 'demo-catalog-refresh-v1',
    catalogCache: 'demo-catalog-cache-v1',
    skin: 'demo-skin-v1',
    appearance: 'demo-appearance-v1',
    heroCollapsed: 'demo-hero-collapsed-v1',
    splashSeen: 'demo-splash-seen-v1',
  },

  catalog: {
    // Use mock data instead of real API
    publicDiskKey: 'https://disk.yandex.ru/d/DEMO',
    apiRoot: 'https://cloud-api.yandex.net/v1/disk/public/resources',
  },

  features: {
    offline: false, // Disable offline in demo
    pwa: false,     // Disable PWA in demo
    share: true,
    video: true,
    text: true,
  },

  getFallbackCatalog: () => ({
    sourceTitle: 'Демо библиотека',
    sections: [],
    folders: [],
    tracks: [],
    loaded: false,
  }),

  themeOptions: DEFAULT_THEME_OPTIONS,

  branding: {
    appTitle: 'Демо Плеер',
    siteName: 'Демо Плеер — Тестовая библиотека',
    siteDescription: 'Демонстрация возможностей медиа плеера с MOCK данными.',
    shareAttribution: 'Демо Плеер',
    mediaSessionAlbum: 'Демо библиотека',
    embedOpenLabel: 'Открыть в демо',
    embedNotFound: 'Запись не найдена',
    splashAriaLabel: 'Демо Плеер',
    itemLabel: 'запись',
    itemLabelGenitivePlural: 'записей',
    catalogShareTitle: 'Демо каталог',
  },
  
  sidebar: {
    brand: {
      title: 'Демо Плеер',
      logoSrc: null, // No logo in demo
    },
    themes: {
      show: true,
      label: 'Тема оформления',
    },
  },
})

// Simple header component for demo
function DemoHeader({ onOpenNav, skin, onSkinChange }: any) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <button
        onClick={onOpenNav}
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Открыть меню"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      <h1 className="text-xl font-bold">Демо Плеер</h1>
      
      <select
        value={skin}
        onChange={(e) => onSkinChange(e.target.value)}
        className="px-3 py-1.5 rounded border bg-background"
      >
        <option value="rastaman">Rastaman</option>
        <option value="rastaman-light">Rastaman Light</option>
        <option value="jaipur">Jaipur</option>
        <option value="moon-dub">Moon Dub</option>
      </select>
    </header>
  )
}

// Demo app wrapper
function DemoApp() {
  useEffect(() => {
    console.log('🎮 Demo mode enabled')
    console.log('📦 Loading MOCK data...')
    
    // Load demo catalog
    loadDemoCatalog().then(catalog => {
      console.log('✅ Catalog loaded:', catalog.tracks.length, 'tracks')
    })
  }, [])

  return (
    <PlayerApp
      renderHeader={(props) => <DemoHeader {...props} />}
    />
  )
}

// Mount demo app if running standalone
if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root')
  if (rootElement && !window.__REACT_ROOT__) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <DemoApp />
      </React.StrictMode>
    )
    window.__REACT_ROOT__ = root
  }
}

export { DemoApp }
