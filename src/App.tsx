import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CellData } from './types'
import {
  getCanonicalFoundationId,
  getFoundationCompletionToday,
  getLoggedCellIdsForDate,
  getTodayDateString,
} from './types'
import { useGoalData } from './hooks/useGoalData'
import { useTheme } from './hooks/useTheme'
import { usePreferences } from './hooks/usePreferences'
import { GoalBoard } from './components/GoalBoard'
import { ActivityLogger } from './components/ActivityLogger'
import { TitleBar } from './components/TitleBar'
import { SettingsPanel } from './components/SettingsPanel'
import { Onboarding } from './components/Onboarding'
import './App.css'

function App() {
  const { data, loading, logActivity, updateCellText, undoLastActivity } = useGoalData()
  const { theme, toggleTheme } = useTheme()
  const { preferences, updatePreferences, resetOnboarding, completeOnboarding } =
    usePreferences()
  const [expandedFoundation, setExpandedFoundation] = useState<CellData | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleEditModeChange = useCallback((next: boolean) => {
    setEditMode(next)
  }, [])

  const handleDailyClick = useCallback(
    async (cell: CellData) => {
      await logActivity(cell.id)
      setFlashId(cell.id)
      setTimeout(() => setFlashId(null), 400)
    },
    [logActivity],
  )

  const handleUndo = useCallback(async () => {
    await undoLastActivity()
  }, [undoLastActivity])

  const handleFoundationClick = useCallback(
    (cell: CellData) => {
      if (!data) return
      const canonicalId = getCanonicalFoundationId(cell.row, cell.col)
      if (!canonicalId) return
      const canonical = data.cells[canonicalId]
      setExpandedFoundation((prev) => {
        const prevCanonical = prev
          ? getCanonicalFoundationId(prev.row, prev.col)
          : null
        return prevCanonical === canonicalId ? null : canonical
      })
    },
    [data],
  )

  const handleCloseExpanded = useCallback(() => {
    setExpandedFoundation(null)
  }, [])

  useEffect(() => {
    setExpandedFoundation(null)
  }, [preferences.gridLayout])

  const loggedTodayIds = useMemo(() => {
    if (!data) return new Set<string>()
    return getLoggedCellIdsForDate(data.activities, getTodayDateString())
  }, [data])

  const foundationCompletion = useMemo(() => {
    if (!data) return new Map<string, number>()
    return getFoundationCompletionToday(data.cells, data.activities)
  }, [data])

  if (loading || !data) {
    return (
      <div className="app">
        <TitleBar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className="app-loading">
          <div className="loading-spinner" />
          <p>Loading your goal board…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <TitleBar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className={`flash-indicator ${flashId ? 'flash-indicator--active' : ''}`} />
      <main className="app-scroll">
        <GoalBoard
          cells={data.cells}
          editMode={editMode}
          onEditModeChange={handleEditModeChange}
          onDailyClick={handleDailyClick}
          onFoundationClick={handleFoundationClick}
          onTextChange={updateCellText}
          expandedFoundation={expandedFoundation}
          onCloseExpanded={handleCloseExpanded}
          gridLayout={preferences.gridLayout}
          showQuotes={preferences.showQuotes}
          loggedTodayIds={loggedTodayIds}
          highlightLoggedToday={preferences.highlightLoggedToday}
          foundationCompletion={foundationCompletion}
          showCompletionRings={preferences.showCompletionRings}
          flashId={flashId}
          canUndo={data.activities.length > 0}
          onUndo={handleUndo}
        />
        {preferences.showHeatmap ? (
          <ActivityLogger
            activities={data.activities}
            weeks={preferences.heatmapWeeks}
          />
        ) : null}
      </main>

      <SettingsPanel
        open={settingsOpen}
        preferences={preferences}
        onClose={() => setSettingsOpen(false)}
        onUpdate={updatePreferences}
        onReplayOnboarding={resetOnboarding}
      />

      <Onboarding
        open={!preferences.onboardingComplete}
        onComplete={completeOnboarding}
      />
    </div>
  )
}

export default App
