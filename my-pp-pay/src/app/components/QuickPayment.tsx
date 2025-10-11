// src/components/QuickPayment.tsx
export default function QuickPayment() {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-bold">Quick Payment Request</h4>
  
        <label className="block mt-4 text-sm text-slate-600">Amount ($)</label>
        <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
  
        <label className="block mt-4 text-sm text-slate-600">Description (Optional)</label>
        <textarea className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="What is this payment for?" />
  
        <button className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold">
          Generate QR Code
        </button>
      </div>
    )
  }
  