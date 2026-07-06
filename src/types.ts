export const GRID_SIZE = 9
export const CENTER = 4

export interface CellData {
  id: string
  row: number
  col: number
  type: 'goal' | 'foundation' | 'daily'
  text: string
  foundationId: string | null
}

export interface ActivityEntry {
  date: string
  cellId: string
  timestamp: number
}

export interface AppData {
  cells: Record<string, CellData>
  activities: ActivityEntry[]
}

export function cellId(row: number, col: number): string {
  return `${row}-${col}`
}

export function isFoundation(row: number, col: number): boolean {
  return (
    Math.abs(row - CENTER) <= 1 &&
    Math.abs(col - CENTER) <= 1 &&
    !(row === CENTER && col === CENTER)
  )
}

export function getCellType(row: number, col: number): CellData['type'] {
  if (row === CENTER && col === CENTER) return 'goal'
  if (isFoundation(row, col)) return 'foundation'
  return 'daily'
}

export function getFoundationBlock(foundationRow: number, foundationCol: number): string[] {
  const ids: string[] = []
  for (let r = foundationRow - 1; r <= foundationRow + 1; r++) {
    for (let c = foundationCol - 1; c <= foundationCol + 1; c++) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        ids.push(cellId(r, c))
      }
    }
  }
  return ids
}

export function getActivitiesByDate(activities: ActivityEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of activities) {
    map.set(entry.date, (map.get(entry.date) ?? 0) + 1)
  }
  return map
}

export function generateDateRange(weeks: number): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDays = weeks * 7
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function getGreenLevel(count: number, max: number): string {
  if (count === 0) return 'var(--activity-none)'
  const ratio = Math.min(count / Math.max(max, 1), 1)
  if (ratio <= 0.25) return 'var(--activity-1)'
  if (ratio <= 0.5) return 'var(--activity-2)'
  if (ratio <= 0.75) return 'var(--activity-3)'
  return 'var(--activity-4)'
}

export function createDefaultCells(): Record<string, CellData> {
  const cells: Record<string, CellData> = {}
  const foundations: [number, number][] = []

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isFoundation(row, col)) foundations.push([row, col])
    }
  }

  function nearestFoundation(row: number, col: number): string {
    let best = foundations[0]
    let bestDist = Infinity
    for (const [fr, fc] of foundations) {
      const dist = Math.abs(row - fr) + Math.abs(col - fc)
      if (dist < bestDist) {
        bestDist = dist
        best = [fr, fc]
      }
    }
    return cellId(best[0], best[1])
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = cellId(row, col)
      const type = getCellType(row, col)
      let text = ''
      if (type === 'goal') text = 'Central Goal'
      else if (type === 'foundation') text = 'Foundation'
      else text = 'Daily action'
      cells[id] = {
        id,
        row,
        col,
        type,
        text,
        foundationId: type === 'daily' ? nearestFoundation(row, col) : null,
      }
    }
  }
  return cells
}

export function createDefaultData(): AppData {
  return { cells: createDefaultCells(), activities: [] }
}
