import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'src/styles/globals.css'
import type { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Kodu Dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-h-screen">
          <Topbar />
          <main className="px-8 py-8">{children}</main>   {/* 👈 this renders the page */}
        </div>
        </div>
      </body>
    </html>
  )
}
