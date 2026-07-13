export type Accent = 'warm' | 'forest' | 'slate' | 'rose'
export type Density = 'compact' | 'comfortable' | 'large'
export type TextScale = 'small' | 'medium' | 'large'
export type HeatmapWeeks = 13 | 26 | 52
export type GridLayout = 'full' | 'simplified'

export interface UserPreferences {
  accent: Accent
  density: Density
  textScale: TextScale
  heatmapWeeks: HeatmapWeeks
  showHeatmap: boolean
  showQuotes: boolean
  highlightLoggedToday: boolean
  showCompletionRings: boolean
  gridLayout: GridLayout
  onboardingComplete: boolean
}

export const PREFS_STORAGE_KEY = 'kiri-preferences'

export const DEFAULT_PREFERENCES: UserPreferences = {
  accent: 'warm',
  density: 'comfortable',
  textScale: 'medium',
  heatmapWeeks: 52,
  showHeatmap: true,
  showQuotes: true,
  highlightLoggedToday: true,
  showCompletionRings: true,
  gridLayout: 'full',
  onboardingComplete: false,
}

export const ACCENT_OPTIONS: { value: Accent; label: string }[] = [
  { value: 'warm', label: 'Warm parchment' },
  { value: 'forest', label: 'Forest' },
  { value: 'slate', label: 'Slate' },
  { value: 'rose', label: 'Rose clay' },
]

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'large', label: 'Large' },
]

export const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export const HEATMAP_WEEK_OPTIONS: { value: HeatmapWeeks; label: string }[] = [
  { value: 13, label: '3 months' },
  { value: 26, label: '6 months' },
  { value: 52, label: '12 months' },
]

export const GRID_LAYOUT_OPTIONS: { value: GridLayout; label: string; hint: string }[] = [
  {
    value: 'full',
    label: 'Full 9×9',
    hint: 'All daily actions visible on the board',
  },
  {
    value: 'simplified',
    label: 'Simplified',
    hint: 'Goal + foundations only; open a foundation for its daily actions',
  },
]

function isAccent(v: unknown): v is Accent {
  return v === 'warm' || v === 'forest' || v === 'slate' || v === 'rose'
}

function isDensity(v: unknown): v is Density {
  return v === 'compact' || v === 'comfortable' || v === 'large'
}

function isTextScale(v: unknown): v is TextScale {
  return v === 'small' || v === 'medium' || v === 'large'
}

function isHeatmapWeeks(v: unknown): v is HeatmapWeeks {
  return v === 13 || v === 26 || v === 52
}

function isGridLayout(v: unknown): v is GridLayout {
  return v === 'full' || v === 'simplified'
}

export function getStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PREFERENCES }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return {
      accent: isAccent(parsed.accent) ? parsed.accent : DEFAULT_PREFERENCES.accent,
      density: isDensity(parsed.density) ? parsed.density : DEFAULT_PREFERENCES.density,
      textScale: isTextScale(parsed.textScale)
        ? parsed.textScale
        : DEFAULT_PREFERENCES.textScale,
      heatmapWeeks: isHeatmapWeeks(parsed.heatmapWeeks)
        ? parsed.heatmapWeeks
        : DEFAULT_PREFERENCES.heatmapWeeks,
      showHeatmap:
        typeof parsed.showHeatmap === 'boolean'
          ? parsed.showHeatmap
          : DEFAULT_PREFERENCES.showHeatmap,
      showQuotes:
        typeof parsed.showQuotes === 'boolean'
          ? parsed.showQuotes
          : DEFAULT_PREFERENCES.showQuotes,
      highlightLoggedToday:
        typeof parsed.highlightLoggedToday === 'boolean'
          ? parsed.highlightLoggedToday
          : DEFAULT_PREFERENCES.highlightLoggedToday,
      showCompletionRings:
        typeof parsed.showCompletionRings === 'boolean'
          ? parsed.showCompletionRings
          : DEFAULT_PREFERENCES.showCompletionRings,
      gridLayout: isGridLayout(parsed.gridLayout)
        ? parsed.gridLayout
        : DEFAULT_PREFERENCES.gridLayout,
      onboardingComplete:
        typeof parsed.onboardingComplete === 'boolean'
          ? parsed.onboardingComplete
          : DEFAULT_PREFERENCES.onboardingComplete,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function applyPreferences(prefs: UserPreferences): void {
  const root = document.documentElement
  root.setAttribute('data-accent', prefs.accent)
  root.setAttribute('data-density', prefs.density)
  root.setAttribute('data-text-scale', prefs.textScale)
  root.setAttribute('data-grid-layout', prefs.gridLayout)
}

export function initPreferences(): UserPreferences {
  const prefs = getStoredPreferences()
  applyPreferences(prefs)
  return prefs
}
