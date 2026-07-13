import { useCallback, useEffect, useState } from 'react'
import {
  type AppData,
  type ActivityEntry,
  createDefaultData,
  getCanonicalFoundationId,
} from '../types'

const STORAGE_KEY = 'kiri-tracker-data'

function loadFromLocalStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      const defaults = createDefaultData()
      for (const id of Object.keys(defaults.cells)) {
        if (!parsed.cells[id]) {
          parsed.cells[id] = defaults.cells[id]
        } else {
          parsed.cells[id] = {
            ...defaults.cells[id],
            ...parsed.cells[id],
            type: defaults.cells[id].type,
            row: defaults.cells[id].row,
            col: defaults.cells[id].col,
            foundationId: defaults.cells[id].foundationId,
          }
        }
      }
      parsed.activities = parsed.activities ?? []
      return parsed
    }
  } catch {
    // ignore
  }
  return createDefaultData()
}

function saveToLocalStorage(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useGoalData() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (window.kiri) {
        const loaded = await window.kiri.loadData()
        setData(loaded)
      } else {
        setData(loadFromLocalStorage())
      }
      setLoading(false)
    }
    load()
  }, [])

  const persist = useCallback(async (next: AppData) => {
    setData(next)
    if (window.kiri) {
      await window.kiri.saveData(next)
    } else {
      saveToLocalStorage(next)
    }
  }, [])

  const logActivity = useCallback(
    async (cellId: string) => {
      if (!data) return
      const today = new Date().toISOString().slice(0, 10)
      const entry: ActivityEntry = {
        date: today,
        cellId,
        timestamp: Date.now(),
      }
      const next: AppData = {
        ...data,
        activities: [...data.activities, entry],
      }
      await persist(next)
    },
    [data, persist],
  )

  const updateCellText = useCallback(
    async (id: string, text: string) => {
      if (!data || !data.cells[id]) return
      const cell = data.cells[id]
      const nextCells = { ...data.cells, [id]: { ...cell, text } }

      const canonicalId =
        cell.type === 'foundation'
          ? getCanonicalFoundationId(cell.row, cell.col)
          : null

      if (canonicalId) {
        for (const key of Object.keys(nextCells)) {
          const c = nextCells[key]
          if (
            c.type === 'foundation' &&
            getCanonicalFoundationId(c.row, c.col) === canonicalId
          ) {
            nextCells[key] = { ...c, text }
          }
        }
      }

      const next: AppData = { ...data, cells: nextCells }
      await persist(next)
    },
    [data, persist],
  )

  const undoLastActivity = useCallback(async () => {
    if (!data || data.activities.length === 0) return false
    const next: AppData = {
      ...data,
      activities: data.activities.slice(0, -1),
    }
    await persist(next)
    return true
  }, [data, persist])

  return { data, loading, logActivity, updateCellText, undoLastActivity }
}
