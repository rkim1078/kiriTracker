import { contextBridge, ipcRenderer } from 'electron'

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

const api = {
  loadData: (): Promise<AppData> => ipcRenderer.invoke('data:load'),
  saveData: (data: AppData): Promise<boolean> => ipcRenderer.invoke('data:save', data),
  logActivity: (cellId: string): Promise<ActivityEntry[]> =>
    ipcRenderer.invoke('activity:log', cellId),
  updateCell: (id: string, text: string): Promise<CellData> =>
    ipcRenderer.invoke('cell:update', id, text),
  setTheme: (theme: 'light' | 'dark'): Promise<void> =>
    ipcRenderer.invoke('theme:set', theme),
}

contextBridge.exposeInMainWorld('kiri', api)

export type KiriAPI = typeof api
