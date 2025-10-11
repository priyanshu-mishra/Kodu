"use client";

import { ConnectButton } from "thirdweb/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function LandingPage() {
  const router = useRouter();

  // Called when user connects a wallet
  const handleConnect = () => {
    router.push("/entrance");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 text-center">
        {/* Header / branding */}
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-700 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
            K
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold">kodu</h1>
            <p className="text-sm text-slate-500">
              Sign in to create or connect your wallet
            </p>
          </div>
        </div>

        {/* ConnectButton from thirdweb/react */}
        <div className="space-y-4">
          <ConnectButton
            client={{
              clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!, // ✅ use correct env var
            }}
            theme="light"
            onConnect={handleConnect} // ✅ redirect after connect
          />
          <div className="text-sm text-slate-500">
            After connecting, you’ll be redirected to your dashboard.
          </div>
        </div>
      </div>
    </main>
  );
}
