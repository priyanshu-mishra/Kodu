// src/app/vendor/analytics/page.tsx
'use client'

import { useMemo, useState } from 'react'

type Point = { t: string; value: number } // t: ISO or label
type ItemStat = { id: string; name: string; sold: number; revenue: number; spark: number[] }

const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min))

// Mock time-series (last 30 days)
function makeSeries(days = 30) {
  const series: Point[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    series.push({ t: d.toISOString().slice(0, 10), value: rand(200, 1200) })
  }
  return series
}

const SALES_30 = makeSeries(30)
const SALES_7 = SALES_30.slice(-7)
const SALES_1 = SALES_30.slice(-1)

const TOP_ITEMS: ItemStat[] = [
  { id: 'i1', name: 'Chicken Wrap', sold: 124, revenue: 2480, spark: Array.from({ length: 8 }, () => rand(2, 20)) },
  { id: 'i2', name: 'Turkish Doner', sold: 98, revenue: 3430, spark: Array.from({ length: 8 }, () => rand(1, 24)) },
  { id: 'i3', name: 'Iced Coffee', sold: 86, revenue: 860, spark: Array.from({ length: 8 }, () => rand(1, 18)) },
  { id: 'i4', name: 'Baklava', sold: 44, revenue: 440, spark: Array.from({ length: 8 }, () => rand(0, 12)) },
]

const PAYMENT_BREAKDOWN = [
  { method: 'Wallet (USDT)', pct: 62 },
  { method: 'Card (Visa/Mc)', pct: 28 },
  { method: 'Other', pct: 10 },
]

// tiny CSV export helper
const exportCsv = (rows: string[][], filename = 'analytics.csv') => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Simple SVG line chart (responsive) — returns a small component
function LineChart({ data, height = 120 }: { data: Point[]; height?: number }) {
  const width = Math.max(300, Math.min(900, data.length * 18))
  const values = data.map((d) => d.value)
  const max = Math.max(...values) || 1
  const min = Math.min(...values) || 0

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * (width - 20) + 10
      const y = ((1 - (d.value - min) / (max - min || 1)) * (height - 20)) + 10
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px]">
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* area (approx) */}
      <polyline points={`${points} ${width - 10},${height - 6} 10,${height - 6}`} fill="url(#lg)" stroke="none" />

      {/* line */}
      <polyline points={points} fill="none" stroke="#6d28d9" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* dots */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * (width - 20) + 10
        const y = ((1 - (d.value - min) / (max - min || 1)) * (height - 20)) + 10
        return <circle key={d.t} cx={x} cy={y} r={2.2} fill="#6d28d9" />
      })}
    </svg>
  )
}

// micro-sparkline (bars)
function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values) || 1
  const w = 6
  return (
    <div className="flex items-end gap-1 h-8">
      {values.map((v, i) => (
        <div key={i} style={{ height: `${(v / max) * 100}%` }} className="w-1.5 bg-slate-300 rounded-sm" />
      ))}
    </div>
  )
}

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState<'1d' | '7d' | '30d'>('7d')

  const series = useMemo(() => (range === '1d' ? SALES_1 : range === '7d' ? SALES_7 : SALES_30), [range])

  const revenue = useMemo(() => series.reduce((s, p) => s + p.value, 0), [series])
  const orders = useMemo(() => Math.round(series.reduce((s, p) => s + p.value / 20, 0)), [series])
  const avgOrder = useMemo(() => (orders ? revenue / orders : 0), [revenue, orders])

  // download CSV of chart points
  const handleExportChart = () => {
    const rows = [['date', 'sales'], ...series.map((p) => [p.t, String(p.value)])]
    exportCsv(rows, `sales-${range}.csv`)
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700">Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Sales, traffic and payment insights for your vendor</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md bg-white border border-slate-200 px-2 py-1">
              <button
                onClick={() => setRange('1d')}
                className={`px-3 py-1 text-sm rounded ${range === '1d' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
              >
                Today
              </button>
              <button
                onClick={() => setRange('7d')}
                className={`px-3 py-1 text-sm rounded ${range === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
              >
                7d
              </button>
              <button
                onClick={() => setRange('30d')}
                className={`px-3 py-1 text-sm rounded ${range === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
              >
                30d
              </button>
            </div>

            <button onClick={handleExportChart} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-white shadow">
            <div className="text-xs text-slate-400">Revenue ({range === '1d' ? 'today' : range === '7d' ? 'last 7 days' : 'last 30 days'})</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-800">${revenue.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Net token volume</div>
          </div>

          <div className="rounded-2xl p-4 bg-white shadow">
            <div className="text-xs text-slate-400">Orders</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-800">{orders}</div>
            <div className="text-xs text-slate-400 mt-1">Estimated orders in range</div>
          </div>

          <div className="rounded-2xl p-4 bg-white shadow">
            <div className="text-xs text-slate-400">Avg order</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-800">${avgOrder.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">Average order value</div>
          </div>

          <div className="rounded-2xl p-4 bg-white shadow">
            <div className="text-xs text-slate-400">Token volume</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-800">{(revenue / 1).toFixed(0)} USDT</div>
            <div className="text-xs text-slate-400 mt-1">Payments received</div>
          </div>
        </section>

        {/* main area: chart left, side panels right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Sales over time</h2>
                <p className="text-sm text-slate-400 mt-1">Revenue trend for the selected range</p>
              </div>

              <div className="text-sm text-slate-400">{series.length} points</div>
            </div>

            <div className="mt-4">
              <LineChart data={series} />
            </div>

            {/* small stats row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Peak day</div>
                <div className="mt-1 font-semibold text-slate-800">{series.reduce((a, b) => (b.value > a.value ? b : a)).t}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Lowest day</div>
                <div className="mt-1 font-semibold text-slate-800">{series.reduce((a, b) => (b.value < a.value ? b : a)).t}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Median</div>
                <div className="mt-1 font-semibold text-slate-800">
                  {Math.round(series.map((s) => s.value).sort((a, b) => a - b)[Math.floor(series.length / 2)])}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Std dev</div>
                <div className="mt-1 font-semibold text-slate-800">
                  {Math.round(Math.sqrt(series.map((s) => Math.pow(s.value - revenue / series.length, 2)).reduce((a, b) => a + b, 0) / series.length))}
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl shadow p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Hourly heatmap</h3>
              <p className="text-xs text-slate-400 mt-1">Visual busiest hours (local)</p>

              <div className="mt-3 grid grid-cols-6 gap-1">
                {/* mock 24-hour buckets collapsed to 6 cols */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const v = Math.sin(i / 24 * Math.PI * 2) * 0.5 + 0.6 + Math.random() * 0.3
                  const intensity = Math.min(1, Math.max(0, v))
                  const bg = `rgba(99, 102, 241, ${0.12 + intensity * 0.6})`
                  return (
                    <div key={i} title={`${i}:00`} style={{ background: bg }} className="h-8 rounded" />
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Top items</h3>
              <div className="mt-3 space-y-3">
                {TOP_ITEMS.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{it.name}</div>
                      <div className="text-xs text-slate-400">{it.sold} sold • ${it.revenue}</div>
                    </div>
                    <div className="w-20">
                      <Spark values={it.spark} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Payment methods</h3>
              <div className="mt-3 space-y-2">
                {PAYMENT_BREAKDOWN.map((p) => (
                  <div key={p.method}>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="min-w-0 truncate">{p.method}</div>
                      <div className="ml-2 font-semibold text-slate-800">{p.pct}%</div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-1">
                      <div style={{ width: `${p.pct}%` }} className="h-2 bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
