'use client'

import { useState } from 'react'

export default function CustomerProfilePage() {
  const [user] = useState({
    name: 'Emma',
    surname: 'Wilson',
    email: 'emma.wilson@example.com',
    wallet: '0xA7b92E1C9D4aE3f2f9bD1c3aEf29D901E',
    joined: 'March 2023',
  })

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account details</p>
        </div>

        {/* Profile card */}
        <section className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center text-4xl font-bold">
              {user.name[0]}
              {user.surname[0]}
            </div>
            <button
              onClick={() => alert('Change profile picture (placeholder)')}
              className="absolute bottom-0 right-0 px-2 py-1 rounded-md bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700"
            >
              Edit
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-sm text-slate-400">Full Name</div>
              <div className="text-lg font-semibold text-slate-800">
                {user.name} {user.surname}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400">Email</div>
              <div className="text-lg font-semibold text-slate-800">{user.email}</div>
            </div>

            <div>
              <div className="text-sm text-slate-400">Wallet Address</div>
              <div className="font-mono text-sm text-slate-700 break-all">
                {user.wallet}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400">Member Since</div>
              <div className="text-lg font-semibold text-slate-800">{user.joined}</div>
            </div>

            <button
              onClick={() => alert('Edit profile functionality (placeholder)')}
              className="mt-6 inline-flex items-center justify-center px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow hover:scale-[1.01] active:scale-95"
            >
              Edit Profile
            </button>
          </div>
        </section>

        {/* Secondary info / preferences */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Preferences</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-700">Notifications</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-indigo-600"
                defaultChecked
                onChange={() => alert('Toggle notifications (placeholder)')}
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-700">Two-factor authentication</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-indigo-600"
                onChange={() => alert('Toggle 2FA (placeholder)')}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Dark Mode</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-indigo-600"
                onChange={() => alert('Toggle dark mode (placeholder)')}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
