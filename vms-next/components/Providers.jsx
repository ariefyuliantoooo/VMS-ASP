'use client'

import { Toaster } from 'react-hot-toast'
import AuthProvider from './providers/auth-provider'

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  )
}
