import type { ReactNode } from 'react'
import type { UserPreferences } from '../preferences'
import {
  ACCENT_OPTIONS,
  DENSITY_OPTIONS,
  GRID_LAYOUT_OPTIONS,
  HEATMAP_WEEK_OPTIONS,
  TEXT_SCALE_OPTIONS,
} from '../preferences'

interface SettingsPanelProps {
  open: boolean
  preferences: UserPreferences
  onClose: () => void
  onUpdate: (patch: Partial<UserPreferences>) => void
  onReplayOnboarding: () => void
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="settings-row">
      <div className="settings-row__meta">
        <span className="settings-row__label">{label}</span>
        {hint ? <span className="settings-row__hint">{hint}</span> : null}
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  )
}

export function SettingsPanel({
  open,
  preferences,
  onClose,
  onUpdate,
  onReplayOnboarding,
}: SettingsPanelProps) {
  if (!open) return null

  return (
    <div
      className="settings-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="settings-panel__header">
          <h2 id="settings-title">Settings</h2>
          <button
            type="button"
            className="settings-panel__close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </header>

        <div className="settings-panel__body">
          <section className="settings-section">
            <h3 className="settings-section__title">Appearance</h3>

            <SettingRow label="Accent" hint="Board color palette">
              <select
                className="settings-select"
                value={preferences.accent}
                onChange={(e) =>
                  onUpdate({ accent: e.target.value as UserPreferences['accent'] })
                }
              >
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Density" hint="Grid cell size and spacing">
              <select
                className="settings-select"
                value={preferences.density}
                onChange={(e) =>
                  onUpdate({ density: e.target.value as UserPreferences['density'] })
                }
              >
                {DENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Text size">
              <select
                className="settings-select"
                value={preferences.textScale}
                onChange={(e) =>
                  onUpdate({
                    textScale: e.target.value as UserPreferences['textScale'],
                  })
                }
              >
                {TEXT_SCALE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingRow>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">Board</h3>

            <SettingRow
              label="Grid layout"
              hint={
                GRID_LAYOUT_OPTIONS.find((o) => o.value === preferences.gridLayout)
                  ?.hint
              }
            >
              <select
                className="settings-select"
                value={preferences.gridLayout}
                onChange={(e) =>
                  onUpdate({
                    gridLayout: e.target.value as UserPreferences['gridLayout'],
                  })
                }
              >
                {GRID_LAYOUT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow
              label="Highlight logged today"
              hint="Mark daily squares already logged today"
            >
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferences.highlightLoggedToday}
                  onChange={(e) =>
                    onUpdate({ highlightLoggedToday: e.target.checked })
                  }
                />
                <span>{preferences.highlightLoggedToday ? 'On' : 'Off'}</span>
              </label>
            </SettingRow>

            <SettingRow
              label="Completion rings"
              hint="Ring on foundations with logged daily actions today"
            >
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferences.showCompletionRings}
                  onChange={(e) =>
                    onUpdate({ showCompletionRings: e.target.checked })
                  }
                />
                <span>{preferences.showCompletionRings ? 'On' : 'Off'}</span>
              </label>
            </SettingRow>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">Activity & quotes</h3>

            <SettingRow label="Show activity heatmap">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferences.showHeatmap}
                  onChange={(e) => onUpdate({ showHeatmap: e.target.checked })}
                />
                <span>{preferences.showHeatmap ? 'On' : 'Off'}</span>
              </label>
            </SettingRow>

            <SettingRow label="Heatmap range">
              <select
                className="settings-select"
                value={preferences.heatmapWeeks}
                disabled={!preferences.showHeatmap}
                onChange={(e) =>
                  onUpdate({
                    heatmapWeeks: Number(e.target.value) as UserPreferences['heatmapWeeks'],
                  })
                }
              >
                {HEATMAP_WEEK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Show inspirational quote">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferences.showQuotes}
                  onChange={(e) => onUpdate({ showQuotes: e.target.checked })}
                />
                <span>{preferences.showQuotes ? 'On' : 'Off'}</span>
              </label>
            </SettingRow>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">Help</h3>
            <SettingRow
              label="Onboarding"
              hint="Walk through how the Harada board works"
            >
              <button
                type="button"
                className="settings-action-btn"
                onClick={() => {
                  onReplayOnboarding()
                  onClose()
                }}
              >
                Replay guide
              </button>
            </SettingRow>
          </section>
        </div>
      </div>
    </div>
  )
}
