export const GRID_SIZE = 9
export const CENTER = 4

/*
Center refers to central goal at [4, 4]
Foundational squares refer to the 8 squares surrounding the central goal
  Each foundational square corresponds to one of the centers in the outer 8 3x3 regions
  Outer center  | Canonical foundational square
  [1,1]         | [3,3]
  [1,4]         | [3,4]
  [1,7]         | [3,5]
  [4,1]         | [4,3]
  [4,7]         | [4,5]
  [7,1]         | [5,3]
  [7,4]         | [5,4]
  [7,7]         | [5,5]
  Outer centers share the same content as their canonical foundational square
Each outer center is surrounded by 8 daily actions
*/

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

const OUTER_CENTER_TO_CANONICAL: Record<string, string> = {
  '1-1': '3-3',
  '1-4': '3-4',
  '1-7': '3-5',
  '4-1': '4-3',
  '4-7': '4-5',
  '7-1': '5-3',
  '7-4': '5-4',
  '7-7': '5-5',
}

const OUTER_BLOCK_CENTERS = new Set(Object.keys(OUTER_CENTER_TO_CANONICAL))

export function cellId(row: number, col: number): string {
  return `${row}-${col}`
}

export function isCenterRingFoundation(row: number, col: number): boolean {
  return (
    Math.abs(row - CENTER) <= 1 &&
    Math.abs(col - CENTER) <= 1 &&
    !(row === CENTER && col === CENTER)
  )
}

export function isOuterBlockCenter(row: number, col: number): boolean {
  return OUTER_BLOCK_CENTERS.has(cellId(row, col))
}

export function isFoundation(row: number, col: number): boolean {
  return isCenterRingFoundation(row, col) || isOuterBlockCenter(row, col)
}

export function getCellType(row: number, col: number): CellData['type'] {
  if (row === CENTER && col === CENTER) return 'goal'
  if (isFoundation(row, col)) return 'foundation'
  return 'daily'
}

export function getCanonicalFoundationId(row: number, col: number): string | null {
  const id = cellId(row, col)
  if (isCenterRingFoundation(row, col)) return id
  if (isOuterBlockCenter(row, col)) return OUTER_CENTER_TO_CANONICAL[id]
  return null
}

export function getBlockForFoundation(
  foundationRow: number,
  foundationCol: number,
): { blockRow: number; blockCol: number } {
  const canonicalId = getCanonicalFoundationId(foundationRow, foundationCol)
  const [fr, fc] = canonicalId
    ? canonicalId.split('-').map(Number)
    : [foundationRow, foundationCol]
  const blockRow = fr === CENTER ? 1 : fr < CENTER ? 0 : 2
  const blockCol = fc === CENTER ? 1 : fc < CENTER ? 0 : 2
  return { blockRow, blockCol }
}

export function getFoundationForBlock(
  blockRow: number,
  blockCol: number,
): string {
  const foundationRow = blockRow === 0 ? 3 : blockRow === 2 ? 5 : 4
  const foundationCol = blockCol === 0 ? 3 : blockCol === 2 ? 5 : 4
  return cellId(foundationRow, foundationCol)
}

export function getRegionCenterId(
  foundationRow: number,
  foundationCol: number,
): string {
  const { blockRow, blockCol } = getBlockForFoundation(foundationRow, foundationCol)
  return cellId(blockRow * 3 + 1, blockCol * 3 + 1)
}

/** The 3×3 foundational region with its foundation at the physical block center. */
export function getFoundationalRegionGrid(
  foundationRow: number,
  foundationCol: number,
  cells: Record<string, CellData>,
): (CellData | undefined)[][] {
  const { blockRow, blockCol } = getBlockForFoundation(foundationRow, foundationCol)
  const startRow = blockRow * 3
  const startCol = blockCol * 3

  return Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => cells[cellId(startRow + r, startCol + c)]),
  )
}

export function getFoundationBlock(foundationRow: number, foundationCol: number): string[] {
  const { blockRow, blockCol } = getBlockForFoundation(foundationRow, foundationCol)
  const ids: string[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ids.push(cellId(blockRow * 3 + r, blockCol * 3 + c))
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

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Distinct cell IDs logged on a given date. */
export function getLoggedCellIdsForDate(
  activities: ActivityEntry[],
  date: string,
): Set<string> {
  const ids = new Set<string>()
  for (const entry of activities) {
    if (entry.date === date) ids.add(entry.cellId)
  }
  return ids
}

/**
 * For each canonical foundation, fraction of its 8 daily cells logged today.
 * Outer-block center ids share the same progress as their canonical foundation.
 */
export function getFoundationCompletionToday(
  cells: Record<string, CellData>,
  activities: ActivityEntry[],
  date: string = getTodayDateString(),
): Map<string, number> {
  const logged = getLoggedCellIdsForDate(activities, date)
  const progress = new Map<string, number>()

  for (const cell of Object.values(cells)) {
    if (!isCenterRingFoundation(cell.row, cell.col)) continue
    const regionIds = getFoundationBlock(cell.row, cell.col)
    const dailyIds = regionIds.filter((id) => cells[id]?.type === 'daily')
    if (dailyIds.length === 0) {
      progress.set(cell.id, 0)
      continue
    }
    const done = dailyIds.filter((id) => logged.has(id)).length
    progress.set(cell.id, done / dailyIds.length)
  }

  for (const [outerId, canonicalId] of Object.entries(OUTER_CENTER_TO_CANONICAL)) {
    progress.set(outerId, progress.get(canonicalId) ?? 0)
  }

  return progress
}

/** Center ring: goal + 8 foundations (for simplified layout). */
export function getSimplifiedGridCells(
  cells: Record<string, CellData>,
): (CellData | undefined)[][] {
  return Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => {
      const row = CENTER - 1 + r
      const col = CENTER - 1 + c
      return cells[cellId(row, col)]
    }),
  )
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

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = cellId(row, col)
      const type = getCellType(row, col)
      let text = ''
      if (type === 'goal') text = 'Central Goal'
      else if (type === 'foundation') text = 'Foundation'
      else text = 'Daily action'

      let foundationId: string | null = null
      if (type === 'daily') {
        const blockRow = Math.floor(row / 3)
        const blockCol = Math.floor(col / 3)
        foundationId =
          blockRow === 1 && blockCol === 1
            ? null
            : getFoundationForBlock(blockRow, blockCol)
      } else if (type === 'foundation') {
        foundationId = getCanonicalFoundationId(row, col)
      }

      cells[id] = {
        id,
        row,
        col,
        type,
        text,
        foundationId,
      }
    }
  }
  return cells
}

export function createDefaultData(): AppData {
  return { cells: createDefaultCells(), activities: [] }
}
