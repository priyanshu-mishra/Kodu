'use client'

import { useMemo, useState } from 'react'

type TxStatus = 'completed' | 'pending' | 'failed' | 'refunded'
type Tx = {
  id: string
  customer: string
  method: string
  amount: number
  currency: string
  fee: number
  net: number
  date: string // ISO
  status: TxStatus
  note?: string
  reference?: string
  cardLast4?: string
}

const SAMPLE_TX: Tx[] = [
  {
    id: 'VTX-20251006-0001',
    customer: 'Aylin Kaya',
    method: 'Wallet (USDT)',
    amount: 120.0,
    currency: 'USDT',
    fee: 1.2,
    net: 118.8,
    date: '2025-10-06T11:22:00Z',
    status: 'completed',
    note: 'Lunch order — Table 4',
    reference: 'ORD-8102',
  },
  {
    id: 'VTX-20251006-0002',
    customer: 'Jonas Müller',
    method: 'Card (Visa)',
    amount: 58.5,
    currency: 'USDT',
    fee: 0.88,
    net: 57.62,
    date: '2025-10-06T10:04:00Z',
    status: 'completed',
    note: 'Office supplies',
    cardLast4: '4242',
  },
  {
    id: 'VTX-20251005-0099',
    customer: 'Sofia Rossi',
    method: 'Wallet (USDT)',
    amount: 42.0,
    currency: 'USDT',
    fee: 0.42,
    net: 41.58,
    date: '2025-10-05T18:31:00Z',
    status: 'pending',
    note: 'Preordered cake',
    reference: 'ORD-8088',
  },
  {
    id: 'VTX-20251004-0088',
    customer: 'Liam Smith',
    method: 'Card (Mastercard)',
    amount: 250.0,
    currency: 'USDT',
    fee: 3.75,
    net: 246.25,
    date: '2025-10-04T14:45:00Z',
    status: 'failed',
    note: 'Membership renewal',
    cardLast4: '1111',
  },
  {
    id: 'VTX-20250930-0050',
    customer: 'Maya Chen',
    method: 'Wallet (USDT)',
    amount: 12.5,
    currency: 'USDT',
    fee: 0.13,
    net: 12.37,
    date: '2025-09-30T09:10:00Z',
    status: 'refunded',
    note: 'Refunded — wrong order',
    reference: 'REF-3001',
  },
]

function fmtCurrency(n: number, currency = 'USDT') {
  // vendor-facing, show currency and number
  return `${n.toFixed(2)} ${currency}`
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function VendorTransactionsPage() {
  const [transactions] = useState<Tx[]>(SAMPLE_TX)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TxStatus>('all')
  const [selected, setSelected] = useState<Tx | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-desc' | 'amount-asc'>('newest')

  // filtered + sorted list
  const list = useMemo(() => {
    let out = transactions.filter((t) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        (t.reference ?? '').toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q)
      )
    })
    if (statusFilter !== 'all') {
      out = out.filter((t) => t.status === statusFilter)
    }

    out.sort((a, b) => {
      if (sortBy === 'newest') return +new Date(b.date) - +new Date(a.date)
      if (sortBy === 'oldest') return +new Date(a.date) - +new Date(b.date)
      if (sortBy === 'amount-desc') return b.amount - a.amount
      return a.amount - b.amount
    })

    return out
  }, [transactions, query, statusFilter, sortBy])

  const exportCsv = () => {
    // simple CSV export
    const headers = [
      'id',
      'customer',
      'method',
      'amount',
      'fee',
      'net',
      'currency',
      'date',
      'status',
      'reference',
      'note',
    ]
    const rows = list.map((t) =>
      [
        t.id,
        t.customer,
        t.method,
        t.amount.toFixed(2),
        t.fee.toFixed(2),
        t.net.toFixed(2),
        t.currency,
        t.date,
        t.status,
        t.reference ?? '',
        (t.note ?? '').replace(/\n/g, ' '),
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`)
    )
    const csv = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendor-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700">Transactions</h1>
            <p className="text-sm text-slate-500 mt-1">Recent payments and activity for your vendor account</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white rounded-md border border-slate-200 px-3 py-2">
              <label className="text-xs text-slate-400 mr-2">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm bg-transparent outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount-desc">Amount (high→low)</option>
                <option value="amount-asc">Amount (low→high)</option>
              </select>
            </div>

            <button
              onClick={exportCsv}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Controls: search + filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              aria-label="Search transactions"
              placeholder="Search by ID, customer, reference, or note"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent outline-none text-sm"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <section className="bg-white rounded-2xl shadow divide-y divide-slate-100 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 items-center px-6 py-3 bg-slate-50">
            <div className="col-span-2 text-xs text-slate-500">Transaction</div>
            <div className="text-xs text-slate-500">Method</div>
            <div className="text-xs text-slate-500">Amount</div>
            <div className="text-xs text-slate-500">Net</div>
            <div className="text-xs text-slate-500 text-right">Status / Date</div>
          </div>

          <div>
            {list.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No transactions found for this filter.</div>
            )}

            {list.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className="w-full text-left px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-slate-50"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
                    {t.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{t.customer}</div>
                    <div className="text-xs text-slate-400 truncate">{t.id} • {t.reference ?? '—'}</div>
                    {t.note && <div className="text-xs text-slate-400 mt-1 truncate">{t.note}</div>}
                  </div>
                </div>

                <div className="text-sm text-slate-600">{t.method}</div>

                <div className="text-sm font-semibold">{fmtCurrency(t.amount, t.currency)}</div>

                <div className="text-sm text-slate-700 font-medium">{fmtCurrency(t.net, t.currency)}</div>

                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 text-sm ${t.status === 'completed' ? 'text-green-600' : t.status === 'pending' ? 'text-amber-600' : t.status === 'failed' ? 'text-red-600' : 'text-indigo-600'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-600' : t.status === 'pending' ? 'bg-amber-500' : t.status === 'failed' ? 'bg-red-600' : 'bg-indigo-600'}`} />
                    <span className="capitalize">{t.status}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{timeAgo(t.date)}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Selected transaction modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Transaction</div>
                <div className="text-lg font-semibold text-slate-800">{selected.customer}</div>
                <div className="text-sm text-slate-500 mt-1">{selected.id}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Status</div>
                <div className={`mt-1 font-semibold ${selected.status === 'completed' ? 'text-green-600' : selected.status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                  {selected.status}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-xs text-slate-400">Amount</div>
                <div className="text-lg font-semibold">{fmtCurrency(selected.amount, selected.currency)}</div>
                <div className="text-xs text-slate-400 mt-1">Fee: {fmtCurrency(selected.fee, selected.currency)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-xs text-slate-400">Net</div>
                <div className="text-lg font-semibold">{fmtCurrency(selected.net, selected.currency)}</div>
                <div className="text-xs text-slate-400 mt-1">{selected.method}{selected.cardLast4 ? ` • •••• ${selected.cardLast4}` : ''}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-xs text-slate-400">Date</div>
                <div className="text-sm font-medium">{timeAgo(selected.date)}</div>
                {selected.reference && <div className="text-xs text-slate-400 mt-1">Ref: {selected.reference}</div>}
              </div>
            </div>

            {selected.note && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50">
                <div className="text-xs text-slate-400">Note</div>
                <div className="text-sm text-slate-700 mt-1">{selected.note}</div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border border-slate-200">Close</button>
              <button onClick={() => alert('Refund flow placeholder')} className="px-4 py-2 rounded-md bg-rose-600 text-white">Refund</button>
              <button onClick={() => alert('More actions placeholder')} className="px-4 py-2 rounded-md bg-indigo-600 text-white">More</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
