'use client'

import { useRouter } from 'next/navigation'
import ChoiceCard from '@/components/ChoiceCard'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-6xl w-full">
        {/* Header / Branding */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-700 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
              K
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">kodu</h1>
              <p className="text-sm text-slate-500">Seamless peer-to-peer token payments</p>
            </div>
          </div>
        </header>

        {/* Two main panels */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <ChoiceCard
            title="Vendor"
            subtitle="Create payment QR codes, manage transactions & settlements"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="6" width="18" height="12" rx="2" fill="white" />
              </svg>
            }
            gradient="from-indigo-800 via-violet-600 to-violet-400"
            onClick={() => router.push('/vendor')}
          />

          <ChoiceCard
            title="Customer"
            subtitle="Scan QR, send tokens and manage your wallet"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2a2 2 0 0 1 2 2v6a2 2 0 1 1-4 0V4a2 2 0 0 1 2-2z" fill="white"/>
                <rect x="5" y="12" width="14" height="8" rx="2" fill="white"/>
              </svg>
            }
            gradient="from-purple-800 via-fuchsia-600 to-pink-400"
            onClick={() => router.push('/customer')}
          />
        </section>

        {/* Footer note */}
        <footer className="mt-10 text-center text-sm text-slate-400">
          <p>Preview — no backend required. Click either panel to continue.</p>
        </footer>
      </div>
    </main>
  )
}
