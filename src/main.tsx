import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from './theme'
import { initPreferences } from './preferences'
import App from './App'
import './index.css'

initTheme()
initPreferences()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
