import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

const GRID_SIZE = 9
const CENTER = 4

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

function cellId(row: number, col: number): string {
  return `${row}-${col}`
}

function isCenterRingFoundation(row: number, col: number): boolean {
  return (
    Math.abs(row - CENTER) <= 1 &&
    Math.abs(col - CENTER) <= 1 &&
    !(row === CENTER && col === CENTER)
  )
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

function isOuterBlockCenter(row: number, col: number): boolean {
  return cellId(row, col) in OUTER_CENTER_TO_CANONICAL
}

function isFoundation(row: number, col: number): boolean {
  return isCenterRingFoundation(row, col) || isOuterBlockCenter(row, col)
}

function getCanonicalFoundationId(row: number, col: number): string | null {
  const id = cellId(row, col)
  if (isCenterRingFoundation(row, col)) return id
  if (isOuterBlockCenter(row, col)) return OUTER_CENTER_TO_CANONICAL[id]
  return null
}

function getCellType(row: number, col: number): CellData['type'] {
  if (row === CENTER && col === CENTER) return 'goal'
  if (isFoundation(row, col)) return 'foundation'
  return 'daily'
}

function getFoundationForBlock(blockRow: number, blockCol: number): string {
  const foundationRow = blockRow === 0 ? 3 : blockRow === 2 ? 5 : 4
  const foundationCol = blockCol === 0 ? 3 : blockCol === 2 ? 5 : 4
  return cellId(foundationRow, foundationCol)
}

function createDefaultCells(): Record<string, CellData> {
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

function createDefaultData(): AppData {
  return { cells: createDefaultCells(), activities: [] }
}

function getDataPath(): string {
  return path.join(app.getPath('userData'), 'kiri-tracker-data.json')
}

function loadData(): AppData {
  const filePath = getDataPath()
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw) as AppData
      const defaults = createDefaultCells()
      for (const id of Object.keys(defaults)) {
        if (!parsed.cells[id]) {
          parsed.cells[id] = defaults[id]
        } else {
          parsed.cells[id] = {
            ...defaults[id],
            ...parsed.cells[id],
            type: defaults[id].type,
            row: defaults[id].row,
            col: defaults[id].col,
            foundationId: defaults[id].foundationId,
          }
        }
      }
      parsed.activities = parsed.activities ?? []
      return parsed
    }
  } catch {
    // fall through to default
  }
  return createDefaultData()
}

function saveData(data: AppData): void {
  const filePath = getDataPath()
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

let mainWindow: BrowserWindow | null = null
let appData: AppData = createDefaultData()

const TITLE_BAR_HEIGHT = 36

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 900,
    minWidth: 800,
    minHeight: 700,
    title: 'Kiri Tracker',
    backgroundColor: '#ebe0cc',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f7f0e3',
      symbolColor: '#3a2c1e',
      height: TITLE_BAR_HEIGHT,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  appData = loadData()

  ipcMain.handle('data:load', () => appData)

  ipcMain.handle('data:save', (_event, data: AppData) => {
    appData = data
    saveData(data)
    return true
  })

  ipcMain.handle('activity:log', (_event, cellId: string) => {
    const today = new Date().toISOString().slice(0, 10)
    appData.activities.push({
      date: today,
      cellId,
      timestamp: Date.now(),
    })
    saveData(appData)
    return appData.activities
  })

  ipcMain.handle('cell:update', (_event, id: string, text: string) => {
    if (appData.cells[id]) {
      appData.cells[id].text = text
      saveData(appData)
    }
    return appData.cells[id]
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
