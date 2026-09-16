import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installIpadUndoGestureGuard } from './shared/preventIpadUndoGesture'

async function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    const granted = await navigator.storage.persist()
    if (!granted) {
      console.warn('[PWA] Persistent storage not granted')
    }
  }
}

installIpadUndoGestureGuard()
requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



