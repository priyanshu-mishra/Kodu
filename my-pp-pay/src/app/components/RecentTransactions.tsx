// src/components/RecentTransactions.tsx
export default function RecentTransactions() {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <span className="text-slate-400">View all</span>
        </div>
  
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">- $25.50</div>
              <div className="text-xs text-slate-500">Coffee & Pastry — Sep 25 at 3:56 PM</div>
            </div>
            <div className="text-green-600 rounded-full p-2 bg-green-50 text-sm">completed</div>
          </div>
  
          <div className="p-6 rounded-lg bg-white/50 border border-dashed text-center text-slate-400">
            No more transactions
          </div>
        </div>
      </div>
    )
  }
  