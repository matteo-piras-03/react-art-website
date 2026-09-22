import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './assets/components/App.jsx'
import { HelmetProvider } from "react-helmet-async"

createRoot(document.getElementById('root')).render(
    <HelmetProvider>
        <StrictMode>
            <App />
        </StrictMode>
    </HelmetProvider>
)