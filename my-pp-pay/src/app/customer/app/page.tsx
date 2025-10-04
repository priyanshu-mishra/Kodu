'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function CustomerAppPage() {
  const [balance] = useState(250.75)
  const [currency] = useState('USDT')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const containerId = 'reader'
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const stopCamera = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop()
        setIsScanning(false)
      }
    } catch {/* ignore */}
  }

  useEffect(() => {
    let cancelled = false
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (cancelled) return
        if (!devices || devices.length === 0) {
          setCameraError('No camera found')
          return
        }
        const cameraId = devices[0].id
        scannerRef.current = new Html5Qrcode(containerId)
        await scannerRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (cancelled) return
            setScanResult(decodedText)
            stopCamera()
          },
          () => {}
        )
        setIsScanning(true)
      } catch (err: any) {
        if (!cancelled) setCameraError('Camera access failed: ' + err.message)
      }
    }

    startScanner()

    return () => {
      cancelled = true
      const stopAndClear = async () => {
        try {
          if (scannerRef.current) {
            try { await scannerRef.current.stop() } catch {}
            try { scannerRef.current.clear() } catch {}
            scannerRef.current = null
          }
        } catch {/* ignore */}
      }
      stopAndClear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Scanner */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Scan QR Code</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
              <div id={containerId} className="aspect-square w-full flex items-center justify-center text-slate-400">
                {!scanResult && !cameraError && <p>{isScanning ? 'Camera active…' : 'Starting camera…'}</p>}
                {cameraError && <p className="text-red-500 text-sm p-4">{cameraError}</p>}
              </div>
            </div>
            {scanResult && (
              <div className="mt-6 p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
                <p className="font-semibold mb-1">Scanned Code:</p>
                <p className="font-mono break-all">{scanResult}</p>
              </div>
            )}
          </div>

          {/* Balance card */}
          <aside className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/80">Available Balance</div>
                <div className="mt-3 text-2xl font-extrabold">{balance.toFixed(2)}</div>
                <div className="text-sm text-white/90">{currency}</div>
              </div>
              <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1v10M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"
                        stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => alert('Send flow (placeholder)')}
                className="w-full py-2 rounded-md bg-white/20 text-white font-medium hover:bg-white/25"
              >
                Send
              </button>
              <button
                onClick={() => alert('Receive flow (placeholder)')}
                className="w-full py-2 rounded-md border border-white/20 text-white font-medium hover:bg-white/10"
              >
                Receive
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
