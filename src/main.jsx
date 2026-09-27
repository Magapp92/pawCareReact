/* Punto de entrada de la web: importamos React, los estilos globales y la App */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.jsx'

/* Montamos la App dentro del div#root del index.html; StrictMode avisa en desarrollo de malas prácticas */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
