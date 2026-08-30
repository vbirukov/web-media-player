import { useEffect, useState } from 'react'
import type { AppSkin } from '../themes'
import { getPlayerConfig } from '../playerConfig'

/**
 * Hook for managing app theme with new Tailwind CSS system
 * Sets data-skin attribute on <html> and updates meta theme-color
 */
export function useAppTheme() {
  const { themeOptions } = getPlayerConfig()
  const defaultSkin = themeOptions?.[0]?.id || 'rastaman'
  
  const [skin, setSkin] = useState<AppSkin>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-skin')
      if (saved) return saved as AppSkin
    }
    return defaultSkin
  })

  useEffect(() => {
    // Set data-skin attribute on <html>
    document.documentElement.setAttribute('data-skin', skin)
    
    // Save to localStorage
    localStorage.setItem('app-skin', skin)
    
    // Update meta theme-color based on theme
    const themeMeta = themeOptions?.find(t => t.id === skin)
    if (themeMeta?.themeColor) {
      let metaTag = document.querySelector('meta[name="theme-color"]')
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'theme-color')
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', themeMeta.themeColor)
    }
    
    // Also set data-theme for backward compatibility
    if (themeMeta?.dataTheme) {
      document.documentElement.setAttribute('data-theme', themeMeta.dataTheme)
    }
  }, [skin, themeOptions])

  return {
    skin,
    setSkin,
    isJaipur: skin === 'jaipur',
    isRastamanLight: skin === 'rastaman-light',
    isMoonDub: skin === 'moon-dub',
    isRastaman: skin === 'rastaman',
  }
}
