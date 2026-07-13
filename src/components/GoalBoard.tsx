import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import type { CellData } from '../types'
import type { GridLayout } from '../preferences'
import {
  GRID_SIZE,
  getCanonicalFoundationId,
  getFoundationalRegionGrid,
  getRegionCenterId,
  getSimplifiedGridCells,
} from '../types'
import { getRandomQuote } from '../data/quotes'
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
  gridLayout: GridLayout
  showQuotes: boolean
  loggedTodayIds: Set<string>
  highlightLoggedToday: boolean
  foundationCompletion: Map<string, number>
  showCompletionRings: boolean
  flashId: string | null
  canUndo: boolean
  onUndo: () => void
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
  gridLayout,
  showQuotes,
  loggedTodayIds,
  highlightLoggedToday,
  foundationCompletion,
  showCompletionRings,
  flashId,
  canUndo,
  onUndo,
}: GoalBoardProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const originRectRef = useRef<DOMRect | null>(null)
  const [quote, setQuote] = useState(getRandomQuote)

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

  const fullRows = useMemo(
    () =>
      Array.from({ length: GRID_SIZE }, (_, row) =>
        Array.from({ length: GRID_SIZE }, (_, col) => cells[`${row}-${col}`]),
      ),
    [cells],
  )

  const simplifiedRows = useMemo(() => getSimplifiedGridCells(cells), [cells])
  const rows = gridLayout === 'simplified' ? simplifiedRows : fullRows

  const expandedCells = expandedFoundation
    ? getFoundationalRegionGrid(
        expandedFoundation.row,
        expandedFoundation.col,
        cells,
      )
    : null

  const regionCenterId = expandedFoundation
    ? getRegionCenterId(expandedFoundation.row, expandedFoundation.col)
    : null

  const modeHint = editMode
    ? 'Click any square to edit its label'
    : gridLayout === 'simplified'
      ? 'Click a foundation to open its daily actions · Click a daily square to log'
      : 'Click daily squares to log actions · Click foundations to focus their region'

  const cellProps = (cell: CellData) => {
    const canonicalId = getCanonicalFoundationId(cell.row, cell.col)
    const progress =
      showCompletionRings && cell.type === 'foundation' && canonicalId
        ? (foundationCompletion.get(cell.id) ?? foundationCompletion.get(canonicalId) ?? 0)
        : null

    return {
      loggedToday:
        highlightLoggedToday && cell.type === 'daily' && loggedTodayIds.has(cell.id),
      completionProgress: progress != null && progress > 0 ? progress : null,
      flash: flashId === cell.id,
    }
  }

  return (
    <>
      <section
        className={`goal-board ${editMode ? 'goal-board--edit-mode' : ''} ${
          gridLayout === 'simplified' ? 'goal-board--simplified' : ''
        }`}
      >
        {showQuotes ? (
          <blockquote className="app-quote">
            <p className="app-quote__text">{quote.text}</p>
            <footer className="app-quote__author">— {quote.author}</footer>
            <button
              type="button"
              className="app-quote__refresh"
              onClick={() => setQuote(getRandomQuote())}
              aria-label="Show another quote"
              title="Another quote"
            >
              Another quote
            </button>
          </blockquote>
        ) : null}

        <div className="board-toolbar">
          <div className="mode-toggle" role="group" aria-label="Board mode">
            <button
              type="button"
              className={`mode-toggle__btn ${!editMode ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => onEditModeChange(false)}
              aria-pressed={!editMode}
              title="Log actions and open foundations"
            >
              Track
            </button>
            <button
              type="button"
              className={`mode-toggle__btn ${editMode ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => onEditModeChange(true)}
              aria-pressed={editMode}
              title="Edit square labels"
            >
              Edit
            </button>
          </div>

          {canUndo ? (
            <button
              type="button"
              className="undo-btn"
              onClick={onUndo}
              title="Undo last logged action"
              aria-label="Undo last logged action"
            >
              Undo log
            </button>
          ) : null}
        </div>

        <p className="app-subtitle" role="status">
          <span className="mode-badge">{editMode ? 'Editing' : 'Tracking'}</span>
          {modeHint}
        </p>

        {gridLayout === 'simplified' ? (
          <p className="layout-badge">Simplified view · 8 foundations around your goal</p>
        ) : null}

        <div
          className={`harada-grid ${gridLayout === 'simplified' ? 'harada-grid--simplified' : ''}`}
          role="grid"
          aria-label={
            gridLayout === 'simplified'
              ? 'Simplified Harada board'
              : 'Full Harada 9 by 9 board'
          }
        >
          {rows.map((rowCells, rowIdx) => (
            <div key={rowIdx} className="harada-row" role="row">
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
                      {...cellProps(cell)}
                    />
                  ),
              )}
            </div>
          ))}
        </div>
      </section>

      {expandedFoundation && expandedCells && (
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
                            editMode={editMode}
                            isExpandedCenter={cell.id === regionCenterId}
                            onDailyClick={onDailyClick}
                            onFoundationClick={(c) => {
                              const clicked = getCanonicalFoundationId(c.row, c.col)
                              const expanded = expandedFoundation
                                ? getCanonicalFoundationId(
                                    expandedFoundation.row,
                                    expandedFoundation.col,
                                  )
                                : null
                              if (clicked && clicked === expanded) {
                                onCloseExpanded()
                              }
                            }}
                            onTextChange={onTextChange}
                            {...cellProps(cell)}
                          />
                        </div>
                      ),
                  )}
                </div>
              ))}
            </div>
            <p className="foundational-hint">
              {editMode
                ? 'Edit labels · Press Esc or click outside to close'
                : 'Foundational region · Click a daily action to log · Esc or click outside to close'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
