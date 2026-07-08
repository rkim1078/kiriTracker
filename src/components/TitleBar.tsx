import type { Theme } from '../theme'

interface TitleBarProps {
  theme: Theme
  onToggleTheme: () => void
}

export function TitleBar({ theme, onToggleTheme }: TitleBarProps) {
  return (
    <header className="title-bar">
      <span className="title-bar__title">Kiri Tracker</span>
      <button
        type="button"
        className="title-bar__theme-btn"
        onClick={onToggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {theme === 'light' ? '☾' : '☀'}
      </button>
    </header>
  )
}
