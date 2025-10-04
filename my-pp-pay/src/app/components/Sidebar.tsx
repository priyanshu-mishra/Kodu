'use client'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import React from 'react'

type Item = {
  id: string
  label: string
  hint?: string
  icon?: React.ReactNode
  onClick?: () => void
}

function NavItem({ item, active }: { item: Item; active?: boolean }) {
  return (
    <button
      onClick={item.onClick ?? (() => {})}
      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition
        ${active ? 'bg-white/10 text-white font-semibold' : 'text-slate-200 hover:bg-white/5'}
        focus:outline-none focus:ring-2 focus:ring-white/20`}
      aria-pressed={active ? 'true' : 'false'}
    >
      <span className="w-6 h-6 flex items-center justify-center opacity-90">{item.icon}</span>
      <div className="flex-1">
        <div className="text-sm">{item.label}</div>
        {item.hint && <div className="text-xs text-slate-400">{item.hint}</div>}
      </div>
    </button>
  )
}

export default function Sidebar() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  // icon placeholders
  const IconDashboard = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" fill="currentColor" />
    </svg>
  )
  const IconAnalytics = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h3v7H5v-7zM10 7h3v12h-3V7zM15 3h3v16h-3V3z" fill="currentColor" />
    </svg>
  )
  const IconSettlements = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2L3 6v6c0 5 3.8 9.7 9 10 5.2-.3 9-5 9-10V6l-9-4z" fill="currentColor" />
    </svg>
  )
  const IconTransactions = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  const IconProfile = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-4 16-4 16 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )

  const vendorMenu: Item[] = [
    {
      id: 'vendor-dashboard',
      label: 'Vendor Dashboard',
      icon: IconDashboard,
      onClick: () => router.push('/vendor'),
    },
    { id: 'analytics', label: 'Analytics', icon: IconAnalytics, onClick: () => alert('Analytics (placeholder)') },
    { id: 'settlements', label: 'Settlements', icon: IconSettlements, onClick: () => alert('Settlements (placeholder)') },
    { id: 'transactions', label: 'Transactions', icon: IconTransactions, onClick: () => alert('Transactions (placeholder)') },
  ]

  const customerMenu: Item[] = [
    {
      id: 'customer-app',
      label: 'Customer App',
      hint: 'Make payments via QR',
      icon: IconDashboard,
      onClick: () => router.push('/customer'),
    },
    { id: 'transactions', label: 'Transactions', icon: IconTransactions, onClick: () => alert('Transactions (placeholder)') },
    { id: 'profile', label: 'Profile', icon: IconProfile, onClick: () => alert('Profile (placeholder)') },
  ]

  const defaultMenu: Item[] = [
    { id: 'home', label: 'Home', icon: IconDashboard },
    { id: 'explore', label: 'Explore', icon: IconAnalytics },
  ]

  // decide which menu to show
  const menu = pathname.startsWith('/vendor')
    ? vendorMenu
    : pathname.startsWith('/customer')
    ? customerMenu
    : defaultMenu

  const activeId =
    pathname.startsWith('/vendor') ? 'vendor-dashboard' :
    pathname.startsWith('/customer') ? 'customer-app' :
    menu[0]?.id

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-indigo-900 to-violet-900 text-white p-4 hidden md:block">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-lg font-bold">K</div>
        <div>
          <div className="text-sm font-semibold">kodu</div>
          <div className="text-xs text-white/70">Seamless payments</div>
        </div>
      </div>

      <nav aria-label="Main navigation" className="space-y-1 px-2">
        <div className="text-xs uppercase text-white/60 px-2 mb-2">Main Navigation</div>
        {menu.map((it) => (
          <NavItem key={it.id} item={it} active={it.id === activeId} />
        ))}
      </nav>

      <div className="mt-8 px-2">
        <div className="text-xs uppercase text-white/60 mb-2">Quick Stats</div>

        <div className="bg-white/5 p-3 rounded-md mb-2">
          <div className="text-xs text-white/60">Platform Volume</div>
          <div className="text-lg font-semibold mt-1">$0</div>
        </div>

        <div className="bg-white/5 p-3 rounded-md mb-2">
          <div className="text-xs text-white/60">Active Vendors</div>
          <div className="text-lg font-semibold mt-1">0</div>
        </div>
      </div>

      <div className="mt-auto px-2 py-4">
        <div className="text-xs text-white/60">Signed in as</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">👤</div>
          <div>
            <div className="text-sm font-medium">Emma Wilson</div>
            <div className="text-xs text-white/60">$699.00 Available</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
