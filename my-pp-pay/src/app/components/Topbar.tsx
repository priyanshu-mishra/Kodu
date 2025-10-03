// src/components/Topbar.tsx
export default function Topbar() {
    return (
      <header className="flex items-center justify-between px-8 py-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" fill="white"/></svg>
          </div>
          <div>
            <div className="text-lg font-extrabold">kodu Wallet</div>
            <div className="text-sm text-slate-500">Emma Wilson</div>
          </div>
        </div>
  
        <div className="text-right">
          <div className="text-2xl font-extrabold">$699.00</div>
          <div className="text-xs text-slate-500">Available Balance</div>
        </div>
      </header>
    )
  }
  