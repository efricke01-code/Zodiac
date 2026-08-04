import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ChartProvider } from './context/ChartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ChartProvider>
        <App />
      </ChartProvider>
    </BrowserRouter>
  </StrictMode>,
)
