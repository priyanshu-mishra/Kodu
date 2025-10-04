// src/components/TransactionCard.tsx
'use client'

import React from 'react'

export type Tx = {
  id: string
  date: string // ISO
  vendor: string
  description?: string
  amount: number
  currency?: string
  direction: 'in' | 'out'
  status?: 'Completed' | 'Pending' | 'Failed'
}

type Props = {
  tx: Tx
  onClick?: (tx: Tx) => void
}

export default function TransactionCard({ tx, onClick }: Props) {
  const isOut = tx.direction === 'out'
  const sign = isOut ? '-' : '+'
  const amountColor = isOut ? 'text-red-600' : 'text-green-600'

  return (
    <button
      onClick={() => onClick?.(tx)}
      className="w-full text-left bg-white hover:shadow-md transition-shadow rounded-xl p-4 flex items-center gap-4 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      <div className="flex-none w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center font-semibold">
        {tx.vendor.split(' ').map(w => w[0] ?? '').slice(0,2).join('')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="truncate">
            <div className="text-sm font-semibold text-slate-800 truncate">{tx.vendor}</div>
            <div className="text-xs text-slate-400 truncate">{tx.description ?? tx.date}</div>
          </div>

          <div className="text-right ml-2">
            <div className={`text-sm font-semibold ${amountColor}`}>
              {sign} {Math.abs(tx.amount).toFixed(2)} {tx.currency ?? 'USDT'}
            </div>
            <div className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </button>
  )
}
