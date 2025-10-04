// src/app/customer/page.tsx
'use client'
import { useRouter } from 'next/navigation'

export default function CustomerPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold">Customer App (Preview)</h1>
          <button onClick={() => router.push('/')} className="text-sm px-3 py-2 rounded bg-slate-100">Back</button>
        </div>

        <div className="rounded-xl p-8 bg-white shadow-lg">
          <p className="text-slate-600">This is a placeholder customer page. When the backend is ready we'll add wallet connect, scanning and payments.</p>
        </div>
      </div>
    </main>
  )
}
