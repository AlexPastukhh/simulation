import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './shell/styles.css'
import './profiles/single-architecture/styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
