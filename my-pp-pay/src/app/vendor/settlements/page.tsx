// src/app/vendor/settlements/page.tsx
'use client'

import { useMemo, useState } from 'react'

type Tx = {
  id: string
  customer: string
  amount: number
  currency: string
  date: string // ISO
  note?: string
}

type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed'
type SettlementBatch = {
  id: string
  from: string
  to: string
  txCount: number
  totalAmount: number
  fee: number
  netAmount: number
  createdAt: string
  settledAt?: string
  bankReference?: string
  status: BatchStatus
  txHash?: string
  transactions: Tx[]
}

const SAMPLE: SettlementBatch[] = [
  {
    id: 'SET-20251006-03',
    from: '2025-10-06T14:00:00Z',
    to: '2025-10-06T18:00:00Z',
    txCount: 42,
    totalAmount: 1240.5,
    fee: 2.1,
    netAmount: 1238.4,
    createdAt: '2025-10-06T18:05:00Z',
    settledAt: '2025-10-06T18:15:00Z',
    bankReference: 'BNK-938474',
    status: 'completed',
    txHash: '0x8af4...c9d2',
    transactions: [
      { id: 'T-1001', customer: 'Aylin Kaya', amount: 120.0, currency: 'USDT', date: '2025-10-06T11:22:00Z', note: 'Lunch' },
      { id: 'T-1000', customer: 'Jonas Müller', amount: 58.5, currency: 'USDT', date: '2025-10-06T10:04:00Z' },
      { id: 'T-0999', customer: 'Sofia Rossi', amount: 42.0, currency: 'USDT', date: '2025-10-05T18:31:00Z' },
    ],
  },
  {
    id: 'SET-20251006-02',
    from: '2025-10-06T10:00:00Z',
    to: '2025-10-06T14:00:00Z',
    txCount: 37,
    totalAmount: 940.2,
    fee: 1.8,
    netAmount: 938.4,
    createdAt: '2025-10-06T14:05:00Z',
    settledAt: undefined,
    bankReference: undefined,
    status: 'processing',
    txHash: undefined,
    transactions: [
      { id: 'T-0987', customer: 'Liam Smith', amount: 250.0, currency: 'USDT', date: '2025-10-06T13:00:00Z' },
      { id: 'T-0986', customer: 'Maya Chen', amount: 12.5, currency: 'USDT', date: '2025-10-06T12:30:00Z' },
    ],
  },
  {
    id: 'SET-20251006-01',
    from: '2025-10-06T06:00:00Z',
    to: '2025-10-06T10:00:00Z',
    txCount: 21,
    totalAmount: 520.75,
    fee: 1.1,
    netAmount: 519.65,
    createdAt: '2025-10-06T10:05:00Z',
    settledAt: undefined,
    bankReference: undefined,
    status: 'pending',
    txHash: undefined,
    transactions: [
      { id: 'T-0950', customer: 'Seda Yılmaz', amount: 18.0, currency: 'USDT', date: '2025-10-06T09:50:00Z' },
    ],
  },
]

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function timeFmt(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function VendorSettlementsPage() {
  const [batches, setBatches] = useState<SettlementBatch[]>(SAMPLE)
  const [selected, setSelected] = useState<SettlementBatch | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all')

  const totals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todaySettled = batches
      .filter((b) => b.settledAt?.slice(0, 10) === today)
      .reduce((s, b) => s + b.netAmount, 0)
    const pending = batches.filter((b) => b.status === 'pending' || b.status === 'processing').length
    const lastHash = batches.find((b) => b.status === 'completed')?.txHash ?? '—'
    const weekTotal = batches.slice(0, 7).reduce((s, b) => s + b.netAmount, 0)
    return { todaySettled, pending, lastHash, weekTotal }
  }, [batches])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return batches.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (!q) return true
      return (
        b.id.toLowerCase().includes(q) ||
        (b.bankReference ?? '').toLowerCase().includes(q) ||
        (b.txHash ?? '').toLowerCase().includes(q)
      )
    })
  }, [batches, query, statusFilter])

  // Export a whole batch as CSV
  const downloadBatchCsv = (batch: SettlementBatch) => {
    const headers = ['txId', 'customer', 'amount', 'currency', 'date', 'note']
    const rows = batch.transactions.map((t) =>
      [t.id, t.customer, t.amount.toFixed(2), t.currency, t.date, t.note ?? ''].map((c) => `"${String(c).replace(/"/g, '""')}"`)
    )
    const csv = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${batch.id}-transactions.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export settlements summary CSV
  const exportAllCsv = () => {
    const headers = ['batchId', 'from', 'to', 'txCount', 'totalAmount', 'fee', 'netAmount', 'status', 'createdAt', 'settledAt', 'bankReference', 'txHash']
    const rows = filtered.map((b) =>
      [
        b.id,
        b.from,
        b.to,
        b.txCount,
        b.totalAmount.toFixed(2),
        b.fee.toFixed(2),
        b.netAmount.toFixed(2),
        b.status,
        b.createdAt,
        b.settledAt ?? '',
        b.bankReference ?? '',
        b.txHash ?? '',
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`)
    )
    const csv = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settlements-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper to view on explorer (mock)
  const openExplorer = (hash?: string) => {
    if (!hash) {
      alert('No blockchain hash available for this batch yet.')
      return
    }
    // open a placeholder explorer URL: replace with real polygonscan when available
    window.open(`https://mumbai.polygonscan.com/tx/${hash}`, '_blank')
  }

  // Small status badge
  const StatusBadge = ({ s }: { s: BatchStatus }) => {
    const cls =
      s === 'completed' ? 'bg-green-100 text-green-800' :
      s === 'processing' ? 'bg-amber-100 text-amber-800' :
      s === 'pending' ? 'bg-slate-100 text-slate-800' :
      'bg-red-100 text-rose-800'
    return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{s}</span>
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700">Settlements</h1>
            <p className="text-sm text-slate-500 mt-1">
              We run 3 settlement batches per day. Here you can review each batch, download statements and view blockchain proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <button onClick={exportAllCsv} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700">
                Export settlements CSV
              </button>
              <button onClick={() => alert('Request manual payout (placeholder)')} className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">
                Request manual payout
              </button>
            </div>

            <div className="sm:hidden">
              <button onClick={exportAllCsv} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 to-green-400 text-white shadow">
            <div className="text-xs font-semibold opacity-90">Today's Settled</div>
            <div className="mt-3 text-2xl font-extrabold">${fmt(totals.todaySettled)}</div>
            <div className="text-xs opacity-90 mt-1">Net payouts completed today</div>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-amber-300 text-white shadow">
            <div className="text-xs font-semibold opacity-90">Pending Payouts</div>
            <div className="mt-3 text-2xl font-extrabold">{totals.pending}</div>
            <div className="text-xs opacity-90 mt-1">Batches awaiting processing</div>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow">
            <div className="text-xs font-semibold opacity-90">Last Settlement Hash</div>
            <div className="mt-3 text-sm font-mono break-words">{totals.lastHash}</div>
            <div className="text-xs opacity-90 mt-1">Click to view on explorer</div>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow">
            <div className="text-xs font-semibold opacity-90">Total (week)</div>
            <div className="mt-3 text-2xl font-extrabold">${fmt(totals.weekTotal)}</div>
            <div className="text-xs opacity-90 mt-1">Net settled this week</div>
          </div>
        </section>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              placeholder="Search by batch id, txHash or bank reference"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-transparent outline-none text-sm">
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Settlement list */}
        <section className="bg-white rounded-2xl shadow divide-y divide-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50">
            <div className="col-span-3 text-xs text-slate-500">Batch</div>
            <div className="col-span-3 text-xs text-slate-500">Period</div>
            <div className="col-span-2 text-xs text-slate-500">Tx / Total</div>
            <div className="col-span-2 text-xs text-slate-500">Net Payout</div>
            <div className="col-span-2 text-xs text-slate-500 text-right">Status / Actions</div>
          </div>

          <div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No settlement batches match your filters.</div>
            )}

            {filtered.map((b) => (
              <div key={b.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition">
                <div className="col-span-3">
                  <div className="text-sm font-medium text-slate-800">{b.id}</div>
                  <div className="text-xs text-slate-400 mt-1">Created {timeFmt(b.createdAt)}</div>
                </div>

                <div className="col-span-3">
                  <div className="text-sm">{timeFmt(b.from)} —</div>
                  <div className="text-sm">{timeFmt(b.to)}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm font-semibold">{b.txCount} tx</div>
                  <div className="text-xs text-slate-400 mt-1">${fmt(b.totalAmount)}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm font-semibold">${fmt(b.netAmount)}</div>
                  <div className="text-xs text-slate-400 mt-1">Fee ${fmt(b.fee)}</div>
                </div>

                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <StatusBadge s={b.status} />
                    <button
                      onClick={() => setSelected(b)}
                      className="px-3 py-1 rounded-md bg-white border border-slate-200 text-sm shadow hover:bg-slate-50"
                    >
                      View details
                    </button>

                    <button
                      onClick={() => downloadBatchCsv(b)}
                      className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700"
                    >
                      Download CSV
                    </button>

                    <button
                      onClick={() => openExplorer(b.txHash)}
                      className="px-3 py-1 rounded-md border border-slate-200 bg-white text-sm shadow hover:bg-slate-50"
                    >
                      View on Explorer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Selected batch modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Settlement</div>
                  <div className="text-lg font-semibold text-slate-800">{selected.id}</div>
                  <div className="text-xs text-slate-500 mt-1">Created {timeFmt(selected.createdAt)}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Status</div>
                  <div className="mt-1">
                    <StatusBadge s={selected.status} />
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Net: <span className="font-medium">${fmt(selected.netAmount)}</span></div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Period</div>
                      <div className="text-sm font-medium">{timeFmt(selected.from)} — {timeFmt(selected.to)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tx Count</div>
                      <div className="text-sm font-semibold">{selected.txCount}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Blockchain Proof</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="font-mono text-sm truncate">{selected.txHash ?? 'Not yet posted'}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openExplorer(selected.txHash)} className="px-3 py-1 rounded-md border border-slate-200 text-sm bg-white">Open explorer</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Bank Reference</div>
                  <div className="mt-2 text-sm font-mono">{selected.bankReference ?? 'Not assigned'}</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Transaction Breakdown</div>
                  <div className="mt-3 divide-y divide-slate-100">
                    {selected.transactions.map((t) => (
                      <div key={t.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">{t.customer}</div>
                          <div className="text-xs text-slate-400 mt-1 font-mono">{t.id} • {new Date(t.date).toLocaleString()}</div>
                          {t.note && <div className="text-xs text-slate-400 mt-1">{t.note}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{fmt(t.amount)} {t.currency}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Totals</div>
                  <div className="mt-2 text-lg font-semibold">${fmt(selected.totalAmount)}</div>
                  <div className="text-xs text-slate-400 mt-1">Fee ${fmt(selected.fee)} • Net ${fmt(selected.netAmount)}</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Timeline</div>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-slate-500">Created <div className="font-mono text-sm mt-1">{timeFmt(selected.createdAt)}</div></div>
                    <div className="text-xs text-slate-500">Settled <div className="font-mono text-sm mt-1">{timeFmt(selected.settledAt)}</div></div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Actions</div>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={() => downloadBatchCsv(selected)} className="w-full px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Download statement</button>
                    <button onClick={() => openExplorer(selected.txHash)} className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">View on explorer</button>
                    <button onClick={() => alert('Mark as paid (placeholder)')} className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm">Mark as paid (admin)</button>
                  </div>
                </div>
              </aside>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border border-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
