import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'src/styles/globals.css'
import type { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
<<<<<<< HEAD
=======
import { ThirdwebProvider } from "thirdweb/react";

>>>>>>> 4371de95b79e90035fc559eede690bfd84ab07c9

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
<<<<<<< HEAD
  title: 'Kodu Dashboard',
=======
  title: 'Dashboard',
>>>>>>> 4371de95b79e90035fc559eede690bfd84ab07c9
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans">
<<<<<<< HEAD
        <div className="flex">
=======
        <ThirdwebProvider>
          <div className="flex">
>>>>>>> 4371de95b79e90035fc559eede690bfd84ab07c9
          <Sidebar />
          <div className="flex-1 min-h-screen">
          <Topbar />
          <main className="px-8 py-8">{children}</main>   {/* 👈 this renders the page */}
        </div>
<<<<<<< HEAD
        </div>
=======
        </div></ThirdwebProvider>
>>>>>>> 4371de95b79e90035fc559eede690bfd84ab07c9
      </body>
    </html>
  )
}
