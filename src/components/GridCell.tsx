import { useCallback, useEffect, useRef, useState } from 'react'
import type { CellData } from '../types'

const ROLE_LABELS: Record<CellData['type'], string> = {
  goal: 'Central goal',
  foundation: 'Foundation',
  daily: 'Daily action',
}

interface GridCellProps {
  cell: CellData
  size?: 'normal' | 'large'
  editMode?: boolean
  onDailyClick?: (cell: CellData) => void
  onFoundationClick?: (cell: CellData) => void
  onTextChange?: (id: string, text: string) => void
  isExpandedCenter?: boolean
  layoutId?: string
  loggedToday?: boolean
  completionProgress?: number | null
  flash?: boolean
}

export function GridCell({
  cell,
  size = 'normal',
  editMode = false,
  onDailyClick,
  onFoundationClick,
  onTextChange,
  isExpandedCenter = false,
  layoutId,
  loggedToday = false,
  completionProgress = null,
  flash = false,
}: GridCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(cell.text)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(cell.text)
  }, [cell.text])

  useEffect(() => {
    if (!editMode) setEditing(false)
  }, [editMode])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleActivate = useCallback(() => {
    if (editing) return
    if (editMode) {
      setEditing(true)
      return
    }
    if (cell.type === 'daily') {
      onDailyClick?.(cell)
    } else if (cell.type === 'foundation') {
      onFoundationClick?.(cell)
    } else if (cell.type === 'goal') {
      // Goal is informational in Track mode
    }
  }, [cell, editing, editMode, onDailyClick, onFoundationClick])

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft.trim() !== cell.text) {
      onTextChange?.(cell.id, draft.trim() || cell.text)
    }
  }, [cell.id, cell.text, draft, onTextChange])

  const typeClass =
    cell.type === 'goal'
      ? 'cell--goal'
      : cell.type === 'foundation'
        ? 'cell--foundation'
        : 'cell--daily'

  const interactive =
    editMode || cell.type === 'daily' || cell.type === 'foundation'

  const title = editMode
    ? `Edit ${ROLE_LABELS[cell.type].toLowerCase()}`
    : cell.type === 'daily'
      ? loggedToday
        ? 'Logged today · Click to log again'
        : 'Click to log action'
      : cell.type === 'foundation'
        ? 'Click to open foundational region'
        : ROLE_LABELS.goal

  const ariaLabel = `${ROLE_LABELS[cell.type]}: ${cell.text}`

  const className = [
    'grid-cell',
    typeClass,
    `grid-cell--${size}`,
    isExpandedCenter ? 'cell--expanded-center' : '',
    editMode ? 'grid-cell--edit-mode' : '',
    loggedToday ? 'cell--logged-today' : '',
    flash ? 'cell--flash' : '',
    interactive ? 'grid-cell--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      data-cell-id={cell.id}
      data-layout-id={layoutId}
      data-cell-type={cell.type}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      title={title}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (!interactive || editing) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
    >
      {completionProgress != null && completionProgress > 0 ? (
        <span
          className="cell-completion-ring"
          style={{
            background: `conic-gradient(var(--daily-logged) ${completionProgress * 100}%, transparent 0)`,
          }}
          aria-hidden="true"
        />
      ) : null}
      {editing ? (
        <textarea
          ref={inputRef}
          className="cell-input"
          value={draft}
          aria-label={`Edit ${ROLE_LABELS[cell.type].toLowerCase()}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commitEdit()
            }
            if (e.key === 'Escape') {
              setDraft(cell.text)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="cell-label">{cell.text}</span>
      )}
    </div>
  )
}
