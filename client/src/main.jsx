import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <WhatsAppButton />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1b3a1f',
                  color: '#fff',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: { iconTheme: { primary: '#5da462', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
