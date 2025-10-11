'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from "qrcode";
import { createPaymentRequestOnServer } from "backend/src/lib/api.ts";

type Tx = {
  id: string
  vendor: string
  amount: number
  currency?: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  note?: string
}

export default function VendorDashboardPage() {
  const router = useRouter()
  const [txModal, setTxModal] = useState<Tx | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  // mock data (last 4 transactions)
  const transactions: Tx[] = [
    { id: 'T-1001', vendor: 'Cafe Nero', amount: 12.5, currency: 'USDT', date: 'Oct 4, 2025 — 10:12', status: 'completed', note: 'Coffee and pastry' },
    { id: 'T-1000', vendor: 'Bakery Plus', amount: 8.75, currency: 'USDT', date: 'Oct 4, 2025 — 09:02', status: 'completed', note: 'Bread order' },
    { id: 'T-0999', vendor: 'Office Supplies', amount: 45.0, currency: 'USDT', date: 'Oct 3, 2025 — 16:40', status: 'pending', note: 'Printer ink' },
    { id: 'T-0998', vendor: 'Market Stall', amount: 23.2, currency: 'USDT', date: 'Oct 3, 2025 — 11:22', status: 'completed', note: 'Groceries' },
  ]

  // KPI values (mock)
  const balance = 12450.32
  const percentChange = 4.7 // %
  const todaysEarnings = 320.15
  const totalTransactions = 1289
  const pendingRequests = 3

  // Generate a QR payload and data URL using the 'qrcode' package (client-side)
  // const generateQr = async () => {
  //   setQrError(null)
  //   setQrDataUrl(null)
  //   setIsGenerating(true)

  //   try {
  //     // dynamic import to avoid SSR issues
  //     const QRCode = await import('qrcode')
  //     // Build a compact payload (JSON string)
  //     const payload = {
  //       type: 'payment_request',
  //       amount: amount || null,
  //       description: description || null,
  //       currency: 'USDT',
  //       createdAt: new Date().toISOString(),
  //       // optional: you can include vendor id / reference here
  //     }
  //     const payloadString = JSON.stringify(payload)

  //     // options: scale controls size; margin controls white border
  //     const dataUrl = await QRCode.toDataURL(payloadString, { errorCorrectionLevel: 'M', margin: 2, scale: 8 })
  //     setQrDataUrl(dataUrl)
  //   } catch (err: any) {
  //     console.error('QR generation failed', err)
  //     setQrError('Failed to generate QR code. Try again.')
  //   } finally {
  //     setIsGenerating(false)
  //   }
  // }

  // const downloadQr = () => {
  //   if (!qrDataUrl) return
  //   const link = document.createElement('a')
  //   link.href = qrDataUrl
  //   link.download = `payment-qr-${Date.now()}.png`
  //   document.body.appendChild(link)
  //   link.click()
  //   link.remove()
  // }






// inside VendorDashboardPage component


const generateQr = async () => {
  setQrError(null);
  setQrDataUrl(null);
  setIsGenerating(true);

  try {
    if (!address) {
      setQrError("Connect your wallet before generating a QR.");
      setIsGenerating(false);
      return;
    }

    // call server to create a payment_request
    const { payment_request, paymentLink } = await createPaymentRequestOnServer({
      vendor_address: address,
      amount_eur: Number(amount),
      description,
      vendor_id: null,
    });

    // paymentLink is something like: https://yourdomain/customer/pay?req=<uuid>
    // Convert link to dataUrl (image) and show QR
    const dataUrl = await QRCode.toDataURL(paymentLink, { errorCorrectionLevel: "M", margin: 2, scale: 8 });
    setQrDataUrl(dataUrl);

    // optionally store payment_request locally or show the id
    // setLastPaymentRequest(payment_request)
  } catch (err: any) {
    console.error("createPaymentRequest failed", err);
    setQrError(err?.message || "Failed to create payment request");
  } finally {
    setIsGenerating(false);
  }
};








  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700">Vendor Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of balances, activity and quick actions</p>
          </div>
        </header>

        {/* Top KPI panels */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Balance */}
          <div className="rounded-2xl p-5 shadow-md bg-gradient-to-br from-indigo-700 to-violet-600 text-white">
            <div className="text-xs uppercase opacity-90">Current Balance</div>

            {/* balance amount */}
            <div className="mt-3 text-2xl font-extrabold tracking-tight">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* % change directly below (small) */}
            <div className={`text-sm mt-1 ${percentChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {percentChange >= 0 ? '+' : ''}
              {percentChange}%
            </div>

            <div className="text-xs opacity-80 mt-2">Available</div>
          </div>

          {/* Today's Earnings */}
          <div className="rounded-2xl p-5 shadow-md bg-gradient-to-br from-emerald-600 to-emerald-400 text-white">
            <div className="text-xs uppercase opacity-90">Today's Earnings</div>
            <div className="mt-3 text-2xl font-extrabold">
              ${todaysEarnings.toFixed(2)}
            </div>
            <div className="text-sm opacity-80 mt-2">Revenue from today</div>
          </div>

          {/* Total Transactions */}
          <div className="rounded-2xl p-5 shadow-md bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
            <div className="text-xs uppercase opacity-90">Total Transactions</div>
            <div className="mt-3 text-2xl font-extrabold">
              {totalTransactions}
            </div>
            <div className="text-sm opacity-80 mt-2">All-time processed</div>
          </div>

          {/* Pending Requests */}
          <div className="rounded-2xl p-5 shadow-md bg-gradient-to-br from-rose-600 to-pink-400 text-white">
            <div className="text-xs uppercase opacity-90">Pending Requests</div>
            <div className="mt-3 text-2xl font-extrabold">
              {pendingRequests}
            </div>
            <div className="text-sm opacity-80 mt-2">Awaiting approval</div>
          </div>
        </section>

        {/* Main content: Recent transactions (left) + Quick payment request (right) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent Transactions (left: spans two cols on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
              <div className="text-sm text-slate-500">Last 4 items</div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {transactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTxModal(t)}
                  className="w-full text-left py-4 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                      {t.vendor.split(' ').slice(0,2).map(w => w[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{t.vendor}</div>
                      <div className="text-xs text-slate-500">{t.date}</div>
                      <div className="text-xs text-slate-400 mt-1">{t.note}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold">${t.amount.toFixed(2)}</div>
                    <div className={`text-xs mt-1 ${t.status === 'completed' ? 'text-green-600' : t.status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                      {t.status}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button
                className="text-sm text-indigo-600 font-semibold hover:underline"
                onClick={() => router.push('/vendor/transactions')}
              >
                View all transactions →
              </button>
            </div>
          </div>

          {/* Quick Payment Request (right) */}
          <aside className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800">Quick Payment Request</h3>
            <p className="text-sm text-slate-500 mt-1">Enter an amount and description, then generate a QR code.</p>

            <div className="mt-4 space-y-3">
              <label className="text-xs text-slate-600">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25.00"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />

              <label className="text-xs text-slate-600">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment for order #1234"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />

              <button
                onClick={generateQr}
                disabled={isGenerating}
                className="w-full mt-2 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow disabled:opacity-60"
              >
                {isGenerating ? 'Generating…' : 'Generate QR Code'}
              </button>

              <div className="mt-4 p-3 rounded-md border border-slate-100 bg-slate-50 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">QR code preview</div>
                  {qrDataUrl && (
                    <button onClick={downloadQr} className="text-xs text-indigo-600 hover:underline">Download</button>
                  )}
                </div>

                <div className="mt-3 w-full h-44 rounded-md bg-white/60 flex items-center justify-center text-slate-500">
                  {qrError && <div className="text-red-500">{qrError}</div>}

                  {!qrDataUrl && !qrError && (
                    <div className="text-sm text-slate-400">No QR generated yet</div>
                  )}

                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Generated QR" className="max-h-40 max-w-full" />
                  )}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* Transaction modal */}
      {txModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTxModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500">Transaction</div>
                <div className="text-lg font-semibold text-slate-800">{txModal.vendor}</div>
                <div className="text-sm text-slate-600 mt-1">{txModal.date}</div>
              </div>
              <button className="text-slate-400" onClick={() => setTxModal(null)}>✕</button>
            </div>

            <div className="mt-4">
              <div className="text-sm text-slate-700 font-semibold">Amount</div>
              <div className="text-xl text-slate-800">${txModal.amount.toFixed(2)}</div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              <div><span className="font-semibold">ID:</span> {txModal.id}</div>
              <div className="mt-2"><span className="font-semibold">Status:</span> {txModal.status}</div>
              {txModal.note && <div className="mt-2"><span className="font-semibold">Note:</span> {txModal.note}</div>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setTxModal(null)} className="px-4 py-2 rounded-md border border-slate-200">Close</button>
              <button onClick={() => alert('Open detail view (placeholder)')} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Details</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}