import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import type { CellData } from '../types'

interface GridCellProps {
  cell: CellData
  size?: 'normal' | 'large'
  onDailyClick?: (cell: CellData) => void
  onFoundationClick?: (cell: CellData) => void
  onTextChange?: (id: string, text: string) => void
  isExpandedCenter?: boolean
  layoutId?: string
}

export function GridCell({
  cell,
  size = 'normal',
  onDailyClick,
  onFoundationClick,
  onTextChange,
  isExpandedCenter = false,
  layoutId,
}: GridCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(cell.text)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(cell.text)
  }, [cell.text])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleClick = useCallback(() => {
    if (editing) return
    if (cell.type === 'daily') {
      onDailyClick?.(cell)
    } else if (cell.type === 'foundation') {
      onFoundationClick?.(cell)
    }
  }, [cell, editing, onDailyClick, onFoundationClick])

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      setEditing(true)
    },
    [],
  )

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

  return (
    <div
      className={`grid-cell ${typeClass} grid-cell--${size} ${isExpandedCenter ? 'cell--expanded-center' : ''}`}
      data-cell-id={cell.id}
      data-layout-id={layoutId}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={
        cell.type === 'daily'
          ? 'Click to log · Double-click to edit'
          : cell.type === 'foundation'
            ? 'Click to expand · Double-click to edit'
            : 'Double-click to edit'
      }
    >
      {editing ? (
        <textarea
          ref={inputRef}
          className="cell-input"
          value={draft}
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
