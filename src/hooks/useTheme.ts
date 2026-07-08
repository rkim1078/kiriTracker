import { useCallback, useEffect, useState } from 'react'
import {
  type Theme,
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
} from '../theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    window.kiri?.setTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, toggleTheme }
}
