import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/tokens.css'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('root element not found')

// vite injects BASE_URL with trailing slash, e.g. "/git-study/".
// react-router basename should not have a trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
