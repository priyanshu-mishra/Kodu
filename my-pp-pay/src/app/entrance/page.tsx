'use client'

import { useRouter } from 'next/navigation'
import ChoiceCard from '@/components/ChoiceCard'
import EntranceLayout from '@/entrance_layout'
import { ConnectButton } from 'thirdweb/react'
import { Client } from '@/client'

export default function EntrancePage() {
  const router = useRouter()

  return (
    <EntranceLayout>
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-700 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                K
              </div>
              <ConnectButton 
              client={Client}
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">kodu</h1>
                <p className="text-sm text-slate-500">Choose who you are to get started</p>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <ChoiceCard
              title="Vendor"
              subtitle="Create payment QR codes, manage transactions & settlements"
              gradient="from-indigo-800 via-violet-600 to-violet-400"
              onClick={() => router.push('/vendor')}
              />
            <ChoiceCard
              title="Customer"
              subtitle="Scan QR, send tokens and manage your wallet"
              gradient="from-purple-800 via-fuchsia-600 to-pink-400"
              onClick={() => router.push('/customer')}            />
          </section>

          <footer className="mt-10 text-center text-sm text-slate-400">
            <p>Preview — no backend required. Choose Vendor or Customer to continue.</p>
          </footer>
        </div>
      </main>
    </EntranceLayout>
  )
}
