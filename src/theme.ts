export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'kiri-theme'

export const THEME_WINDOW_COLORS = {
  light: {
    background: '#ebe0cc',
    overlay: '#f7f0e3',
    symbols: '#3a2c1e',
  },
  dark: {
    background: '#1a1410',
    overlay: '#241c16',
    symbols: '#e8dcc8',
  },
} as const

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }
  return 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function initTheme(): void {
  applyTheme(getStoredTheme())
}
