import type { Theme } from '../theme'

interface TitleBarProps {
  theme: Theme
  onToggleTheme: () => void
  onOpenSettings: () => void
}

export function TitleBar({ theme, onToggleTheme, onOpenSettings }: TitleBarProps) {
  return (
    <header className="title-bar">
      <span className="title-bar__title">Kiri Tracker</span>
      <div className="title-bar__actions">
        <button
          type="button"
          className="title-bar__btn"
          onClick={onOpenSettings}
          aria-label="Open settings"
          title="Settings"
        >
          ⚙
        </button>
        <button
          type="button"
          className="title-bar__btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? '☾' : '☀'}
        </button>
      </div>
    </header>
  )
}
