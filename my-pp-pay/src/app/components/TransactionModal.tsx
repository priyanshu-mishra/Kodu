// src/components/TransactionModal.tsx
'use client'

import React, { useEffect } from 'react'
import { Tx } from './TransactionCard'

type Props = {
  tx: Tx | null
  onClose: () => void
}

export default function TransactionModal({ tx, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!tx) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="tx-title" className="text-lg font-extrabold text-slate-800">{tx.vendor}</h3>
                <p className="text-sm text-slate-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${tx.direction === 'out' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.direction === 'out' ? '-' : '+'}{Math.abs(tx.amount).toFixed(2)} {tx.currency ?? 'USDT'}
                </div>
                <div className="text-xs text-slate-400 mt-1">{tx.status}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-700">
              <div className="mb-2">
                <div className="text-xs text-slate-400">Transaction ID</div>
                <div className="font-mono text-sm">{tx.id}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-slate-400">Description</div>
                <div>{tx.description ?? '—'}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-slate-400">Payment Method</div>
                <div>QR Payment</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
              >
                Close
              </button>

              <button
                onClick={() => alert('Open transaction details (placeholder)')}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                More details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
