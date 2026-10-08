import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// App.css contiene Tailwind y el sistema de diseño del Bodegón (colores, botones, tarjetas).
// Antes se importaba index.css (estilos de ejemplo de Vite) que centraba y achicaba todo.
import './App.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
