'use client'

import { useRouter } from 'next/navigation'

export default function CustomerBalancePage() {
  const router = useRouter()
  const balance = 250.75
  const currency = 'USDT'

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-extrabold text-indigo-700">Customer Balance</h1>
          <p className="text-sm text-slate-500 mt-1">Your current balance and quick actions</p>
        </header>

        <section className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-xs text-slate-400">Available Balance</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-800">
              {balance.toFixed(2)} {currency}
            </div>
            <div className="text-sm text-slate-500 mt-1">Last updated just now</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/customer/app')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow"
            >
              Open Scanner
            </button>
            <button
              onClick={() => alert('Top-up flow (placeholder)')}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
            >
              Top up
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
