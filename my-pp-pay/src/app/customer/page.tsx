// src/app/customer/page.tsx
'use client'

import { useState } from 'react'

export default function CustomerAppPage() {
  const [balance] = useState(250.75) // made-up balance
  const [currency] = useState('USDT')
  const [scanning, setScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const handleScan = () => {
    if (scanning) return
    setScanning(true)
    setLastScanned(null)

    // simulate a short scan delay
    setTimeout(() => {
      const code = `pay:kodu:0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`
      setLastScanned(code)
      setScanning(false)
    }, 1000)
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700">Customer App</h1>
            <p className="text-sm text-slate-500 mt-1">Make payments via QR</p>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="text-xs text-slate-500">Available Balance</div>
            <div className="px-3 py-2 rounded-lg bg-white shadow text-sm font-semibold">
              {balance.toFixed(2)} {currency}
            </div>
          </div>
        </div>

        {/* Main grid: QR panel + Balance card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* QR Scan panel (large) */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Scan QR Code</h2>
              <p className="text-sm text-slate-400">Point your camera at a vendor's QR</p>
            </div>

            <div className="mt-6">
              {/* QR frame placeholder */}
              <div className="w-full h-80 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                <svg className="w-20 h-20 mb-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <div className="text-center">
                  <div className="font-medium text-slate-600">QR Scanner Placeholder</div>
                  <div className="text-sm text-slate-400 mt-1">This area will access your camera in the real app</div>
                </div>
              </div>

              {/* actions + result */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                <button
                  onClick={handleScan}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow hover:scale-[1.01] active:scale-95"
                >
                  {scanning ? 'Scanning…' : 'Scan QR'}
                </button>

                <button
                  onClick={() => alert('Open manual payment flow (placeholder)')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
                >
                  Enter code manually
                </button>

                <div className="mt-3 sm:mt-0 text-sm text-slate-500">
                  {lastScanned ? (
                    <div>
                      <div className="text-xs text-slate-400">Last scanned</div>
                      <div className="mt-1 font-mono text-sm text-slate-700">{lastScanned}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">No recent scans</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Balance card (right column) */}
          <aside className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/80">Available Balance</div>
                <div className="mt-3 text-2xl font-extrabold">{balance.toFixed(2)}</div>
                <div className="text-sm text-white/90">{currency}</div>
              </div>

              <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 1v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => alert('Send flow (placeholder)')}
                className="w-full py-2 rounded-md bg-white/20 backdrop-blur-sm text-white font-medium"
              >
                Send
              </button>

              <button
                onClick={() => alert('Receive flow (placeholder)')}
                className="w-full py-2 rounded-md border border-white/20 text-white font-medium"
              >
                Receive
              </button>
            </div>

            <div className="mt-6 text-xs text-white/80">
              <div>Last activity</div>
              <div className="mt-2 text-sm">No recent transactions</div>
            </div>
          </aside>
        </div>

        {/* Recent activity / transactions (placeholder) */}
        <section className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <p className="text-sm text-slate-400 mt-1">This will show recent payments and receipts.</p>

          <div className="mt-4 space-y-3">
            {/* placeholder rows */}
            {[
              { id: 'TX-01', label: 'Coffee at Café', amount: '- 4.50 USDT', status: 'Completed' },
              { id: 'TX-02', label: 'Top-up', amount: '+ 50.00 USDT', status: 'Completed' },
              { id: 'TX-03', label: 'Gift', amount: '- 10.00 USDT', status: 'Pending' }
            ].map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-md border border-slate-100">
                <div>
                  <div className="text-sm font-medium">{tx.label}</div>
                  <div className="text-xs text-slate-400">{tx.id} • {tx.status}</div>
                </div>
                <div className={`text-sm font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-700'}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
