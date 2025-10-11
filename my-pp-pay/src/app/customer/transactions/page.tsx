// src/app/customer/transactions/page.tsx
'use client'

import { useMemo, useState } from 'react'
import TransactionCard, { Tx } from '@/components/TransactionCard'
import TransactionModal from '@/components/TransactionModal'

export default function CustomerTransactionsPage() {
  // mock data — replace with real API later
  const transactions = useMemo<Tx[]>(
    () => [
      {
        id: 'TX-2025-0001',
        date: new Date().toISOString(),
        vendor: "Café Nord",
        description: 'Coffee and croissant',
        amount: 4.5,
        currency: 'USDT',
        direction: 'out',
        status: 'Completed',
      },
      {
        id: 'TX-2025-0002',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        vendor: 'Top-up via Card',
        description: 'Card top-up',
        amount: 50.0,
        currency: 'USDT',
        direction: 'in',
        status: 'Completed',
      },
      {
        id: 'TX-2025-0003',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        vendor: 'Bookstore',
        description: 'Notebook',
        amount: 12.99,
        currency: 'USDT',
        direction: 'out',
        status: 'Pending',
      },
      {
        id: 'TX-2025-0004',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        vendor: 'Gift received',
        description: 'From Jane',
        amount: 10.0,
        currency: 'USDT',
        direction: 'in',
        status: 'Completed',
      },
    ],
    []
  )

  const [selected, setSelected] = useState<Tx | null>(null)

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700">Transactions</h1>
            <p className="text-sm text-slate-500 mt-1">Your recent activity</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded-lg bg-white shadow text-sm font-semibold">Filter</button>
            <button className="px-3 py-2 rounded-lg bg-white shadow text-sm font-semibold">Export</button>
          </div>
        </header>

        <section className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} onClick={() => setSelected(tx)} />
          ))}
        </section>

        <div className="pt-6">
          <button
            onClick={() => alert('Load more (placeholder)')}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold"
          >
            Load more
          </button>
        </div>
      </div>

      <TransactionModal tx={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
