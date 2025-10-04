// src/app/vendor/login/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function VendorLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    // simulate instant login for now
    setTimeout(() => {
      setLoading(false)
      router.push('/vendor') // go to vendor dashboard placeholder
    }, 500)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold">Vendor Login</h1>
          <p className="text-sm text-slate-500">Sign in to manage your vendor dashboard</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <label className="block text-sm font-medium text-slate-600">Email</label>
          <input className="mt-2 mb-4 w-full px-3 py-2 border rounded-lg" placeholder="vendor@example.com" />

          <label className="block text-sm font-medium text-slate-600">Password</label>
          <input type="password" className="mt-2 mb-6 w-full px-3 py-2 border rounded-lg" placeholder="••••••••" />

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow"
            aria-busy={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-4 text-center text-sm text-slate-500">
            <button onClick={() => router.push('/')} className="underline">Back to choose</button>
          </div>
        </div>
      </div>
    </main>
  )
}
