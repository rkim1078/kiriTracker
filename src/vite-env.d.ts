export interface KiriAPI {
  loadData: () => Promise<import('./types').AppData>
  saveData: (data: import('./types').AppData) => Promise<boolean>
  logActivity: (cellId: string) => Promise<import('./types').ActivityEntry[]>
  updateCell: (id: string, text: string) => Promise<import('./types').CellData>
  setTheme: (theme: import('./theme').Theme) => Promise<void>
}

declare global {
  interface Window {
    kiri?: KiriAPI
  }
}

export {}
