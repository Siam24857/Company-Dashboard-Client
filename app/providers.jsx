'use client'

import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3600,
          style: {
            background: 'var(--bg-1)',
            color: 'var(--text-0)',
            border: '1px solid var(--stroke)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-neumo)',
            backdropFilter: 'blur(20px)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: '#04070b' } },
          error: { iconTheme: { primary: 'var(--red)', secondary: '#04070b' } },
        }}
      />
    </>
  )
}