// src/app/customer/login/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CustomerLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    // fake login
    setTimeout(() => {
      setLoading(false)
      router.push('/customer') // go to customer placeholder
    }, 500)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold">Customer Login</h1>
          <p className="text-sm text-slate-500">Sign in to access your wallet</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="mb-4">
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow"
              aria-busy={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet (Preview)'}
            </button>
          </div>

          <div className="text-center text-sm text-slate-500">
            <button onClick={() => router.push('/')} className="underline">Back to choose</button>
          </div>
        </div>
      </div>
    </main>
  )
}
