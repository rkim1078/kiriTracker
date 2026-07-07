import { useCallback, useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import type { CellData } from '../types'
import { GRID_SIZE } from '../types'
import { GridCell } from './GridCell'

interface GoalBoardProps {
  cells: Record<string, CellData>
  editMode: boolean
  onEditModeChange: (editMode: boolean) => void
  onDailyClick: (cell: CellData) => void
  onFoundationClick: (cell: CellData) => void
  onTextChange: (id: string, text: string) => void
  expandedFoundation: CellData | null
  onCloseExpanded: () => void
}

export function GoalBoard({
  cells,
  editMode,
  onEditModeChange,
  onDailyClick,
  onFoundationClick,
  onTextChange,
  expandedFoundation,
  onCloseExpanded,
}: GoalBoardProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const originRectRef = useRef<DOMRect | null>(null)

  const handleFoundationClick = useCallback(
    (cell: CellData) => {
      const el = document.querySelector(`[data-cell-id="${cell.id}"]`)
      if (el) {
        originRectRef.current = el.getBoundingClientRect()
      }
      onFoundationClick(cell)
    },
    [onFoundationClick],
  )

  useEffect(() => {
    if (!expandedFoundation) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseExpanded()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expandedFoundation, onCloseExpanded])

  const handleOverlayClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === overlayRef.current) onCloseExpanded()
    },
    [onCloseExpanded],
  )

  const rows = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => cells[`${row}-${col}`]),
  )

  const expandedCells = expandedFoundation
    ? Array.from({ length: 3 }, (_, i) => {
        const r = expandedFoundation.row - 1 + i
        return Array.from({ length: 3 }, (_, j) => {
          const c = expandedFoundation.col - 1 + j
          return cells[`${r}-${c}`]
        })
      })
    : null

  return (
    <>
      <section className={`goal-board ${editMode ? 'goal-board--edit-mode' : ''}`}>
        <h1 className="app-title">Harada Goal Board</h1>

        <div className="mode-toggle" role="group" aria-label="Board mode">
          <button
            type="button"
            className={`mode-toggle__btn ${!editMode ? 'mode-toggle__btn--active' : ''}`}
            onClick={() => onEditModeChange(false)}
          >
            Track
          </button>
          <button
            type="button"
            className={`mode-toggle__btn ${editMode ? 'mode-toggle__btn--active' : ''}`}
            onClick={() => onEditModeChange(true)}
          >
            Edit
          </button>
        </div>

        <p className="app-subtitle">
          {editMode
            ? 'Click any square to edit its label'
            : 'Click daily squares to log actions · Click foundations to focus'}
        </p>
        <div className="harada-grid">
          {rows.map((rowCells, rowIdx) => (
            <div key={rowIdx} className="harada-row">
              {rowCells.map(
                (cell) =>
                  cell && (
                    <GridCell
                      key={cell.id}
                      cell={cell}
                      editMode={editMode}
                      onDailyClick={onDailyClick}
                      onFoundationClick={handleFoundationClick}
                      onTextChange={onTextChange}
                      layoutId={cell.id}
                    />
                  ),
              )}
            </div>
          ))}
        </div>
      </section>

      {!editMode && expandedFoundation && expandedCells && (
        <div
          ref={overlayRef}
          className="foundational-overlay"
          onClick={handleOverlayClick}
        >
          <div
            className="foundational-panel"
            style={
              originRectRef.current
                ? ({
                    '--origin-x': `${originRectRef.current.left + originRectRef.current.width / 2}px`,
                    '--origin-y': `${originRectRef.current.top + originRectRef.current.height / 2}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            <div className="foundational-grid">
              {expandedCells.map((rowCells, rowIdx) => (
                <div key={rowIdx} className="foundational-row">
                  {rowCells.map(
                    (cell) =>
                      cell && (
                        <div
                          key={cell.id}
                          data-cell-id={cell.id}
                          className="foundational-cell-wrap"
                        >
                          <GridCell
                            cell={cell}
                            size="large"
                            isExpandedCenter={cell.id === expandedFoundation.id}
                            onDailyClick={onDailyClick}
                            onFoundationClick={(c) => {
                              if (c.id === expandedFoundation.id) {
                                onCloseExpanded()
                              } else {
                                onFoundationClick(c)
                              }
                            }}
                            onTextChange={onTextChange}
                          />
                        </div>
                      ),
                  )}
                </div>
              ))}
            </div>
            <p className="foundational-hint">
              Press Esc or click outside to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
