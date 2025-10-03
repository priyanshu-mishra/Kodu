// src/app/page.tsx
import ScanCard from '@/components/ScanCard'
import KPICards from '@/components/KIPCards'
import RecentTransactions from '@/components/RecentTransactions'
import QuickPayment from '@/components/QuickPayment'

// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
          Tailwind is working ✅
        </h1>
        <p className="text-slate-600">
          Replace this with your dashboard UI.
        </p>
        <button className="mt-6 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          Click me
        </button>
      </div>
    </main>
  )
}

