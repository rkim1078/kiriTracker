import { useCallback, useState } from 'react'
import type { CellData } from './types'
import { getCanonicalFoundationId } from './types'
import { useGoalData } from './hooks/useGoalData'
import { GoalBoard } from './components/GoalBoard'
import { ActivityLogger } from './components/ActivityLogger'
import './App.css'

function App() {
  const { data, loading, logActivity, updateCellText } = useGoalData()
  const [expandedFoundation, setExpandedFoundation] = useState<CellData | null>(
    null,
  )
  const [editMode, setEditMode] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)

  const handleEditModeChange = useCallback((next: boolean) => {
    setEditMode(next)
    if (next) setExpandedFoundation(null)
  }, [])

  const handleDailyClick = useCallback(
    async (cell: CellData) => {
      await logActivity(cell.id)
      setFlashId(cell.id)
      setTimeout(() => setFlashId(null), 400)
    },
    [logActivity],
  )

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

  if (loading || !data) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading your goal board…</p>
      </div>
    )
  }

  return (
    <div className="app">
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
        />
        <ActivityLogger activities={data.activities} />
      </main>
    </div>
  )
}

export default App
