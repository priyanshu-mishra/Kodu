// src/components/Sidebar.tsx
export default function Sidebar() {
    return (
      <aside className="w-72 bg-white border-r min-h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">K</div>
          <div>
            <div className="font-bold">kodu</div>
            <div className="text-sm text-indigo-600">Seamless Payments</div>
          </div>
        </div>
  
        <nav className="p-6">
          <h6 className="text-xs text-indigo-500 font-semibold tracking-wide">MAIN NAVIGATION</h6>
          <ul className="mt-3 space-y-2">
            <li className="p-2 rounded-lg bg-indigo-50 text-indigo-700">Vendor Dashboard</li>
            <li className="p-2 rounded-lg hover:bg-slate-100">Customer App</li>
            <li className="p-2 rounded-lg hover:bg-slate-100">Analytics</li>
            <li className="p-2 rounded-lg hover:bg-slate-100">Settlements</li>
          </ul>
  
          <h6 className="text-xs text-indigo-500 font-semibold tracking-wide mt-8">QUICK STATS</h6>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex justify-between"><span>Platform Volume</span><span className="text-indigo-600">$0</span></li>
            <li className="flex justify-between"><span>Active Vendors</span><span className="text-green-500">0</span></li>
            <li className="flex justify-between"><span>Total Users</span><span className="text-purple-600">0</span></li>
          </ul>
        </nav>
  
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">A</div>
            <div>
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-indigo-600">kodu Platform</div>
            </div>
          </div>
        </div>
      </aside>
    )
  }
  