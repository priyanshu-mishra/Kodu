// src/components/ScanCard.tsx
export default function ScanCard() {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-violet-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Scan to Pay</div>
            <div className="text-xl font-bold mt-2">Point your camera at the vendor's QR code</div>
          </div>
          <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">🔲</div>
        </div>
  
        <div className="mt-6 bg-white/10 rounded-md p-4 flex justify-center">
          <button className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold">Open Camera</button>
        </div>
      </div>
    )
  }
  