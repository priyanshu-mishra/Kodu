// src/components/ChoiceCard.tsx
'use client'

import React from 'react'

type Props = {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  gradient?: string // tailwind gradient classes e.g. "from-indigo-800 via-violet-600 to-violet-400"
  onClick?: () => void
}

export default function ChoiceCard({ title, subtitle, icon, gradient = 'from-indigo-800 to-violet-400', onClick }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
      className={`relative cursor-pointer select-none overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] active:scale-[0.99] outline-none ring-0 focus:ring-4 focus:ring-white/20`}
      aria-label={title}
    >
      {/* subtle shine */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_200px_at_80%_10%,rgba(255,255,255,0.06),transparent)] mix-blend-screen" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-white">
            {icon}
          </div>

          <div>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-white/90 max-w-prose">{subtitle}</p>}
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 bg-white/10 py-2 px-4 rounded-full text-white text-sm font-medium shadow-sm hover:bg-white/15">
            <span>Get started</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
