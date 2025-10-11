// src/app/entrance_layout.tsx
import type { ReactNode } from 'react'
import 'src/styles/globals.css'

export default function EntranceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 text-foreground font-sans">
      {children}
    </div>
  )
}
