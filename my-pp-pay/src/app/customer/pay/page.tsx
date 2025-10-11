"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ConnectButton, useActiveAccount, useSendTransaction } from "thirdweb/react";
import { fetchPaymentRequestById, confirmPaymentOnServer } from "/lib/api";
import { prepareContractCall } from "thirdweb";
import { ethers } from "ethers";

const KODU_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KODU_TOKEN_ADDRESS || "";
const KODU_DECIMALS = 18; // adjust if different

// 1 KODU = 1 EUR
function convertEurToKoduUnits(eur: number) {
  return ethers.utils.parseUnits(eur.toString(), KODU_DECIMALS);
}

export default function CustomerPayPage() {
  const search = useSearchParams();
  const reqId = search.get("req");
  const [paymentRequest, setPaymentRequest] = useState<any | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  // NEW Thirdweb hook
  const account = useActiveAccount(); // { address, chain, ... }
  const { mutateAsync: sendTx } = useSendTransaction();

  // Fetch payment request from Supabase via our server route
  useEffect(() => {
    if (!reqId) return;
    (async () => {
      try {
        const req = await fetchPaymentRequestById(reqId);
        setPaymentRequest(req);
      } catch (e) {
        console.error("Failed to fetch payment request", e);
      }
    })();
  }, [reqId]);

  async function handlePay() {
    if (!account) {
      alert("Connect wallet first");
      return;
    }
    if (!paymentRequest) {
      alert("No payment request loaded");
      return;
    }

    const amountEur = Number(paymentRequest.amount_eur);
    if (isNaN(amountEur) || amountEur <= 0) {
      alert("Invalid amount");
      return;
    }

    setIsPaying(true);

    try {
      const value = convertEurToKoduUnits(amountEur);

      // Build ERC-20 transfer call
      const txCall = prepareContractCall({
        contract: {
          address: KODU_TOKEN_ADDRESS,
          abi: [
            "function transfer(address to, uint256 value) public returns (bool)"
          ],
        },
        method: "transfer",
        params: [paymentRequest.vendor_address, value],
      });

      // Send it
      const receipt = await sendTx(txCall);

      const txHash = receipt?.transactionHash ?? receipt?.hash ?? "unknown";

      // Tell our backend that the payment is complete
      await confirmPaymentOnServer({
        reqId: paymentRequest.id,
        txHash,
        payerAddress: account.address,
        amount_eur: amountEur,
      });

      alert("Payment sent and recorded!");
      router.push("/customer/paid");
    } catch (err: any) {
      console.error("Payment failed", err);
      alert(`Payment failed: ${err?.message || "unknown error"}`);
    } finally {
      setIsPaying(false);
    }
  }

  if (!reqId) {
    return <div className="p-6">Missing payment request ID</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-2xl p-6 shadow">
        <h1 className="text-xl font-semibold">Pay Vendor</h1>

        {!paymentRequest ? (
          <div className="mt-4">Loading payment request…</div>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Vendor:{" "}
              <code className="break-all">
                {paymentRequest.vendor_address}
              </code>
            </p>
            <p className="mt-1 text-lg font-bold">
              {paymentRequest.amount_eur} EUR
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {paymentRequest.description}
            </p>

            <div className="mt-4">
              <ConnectButton client={{ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! }} />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="flex-1 py-2 rounded-md bg-indigo-600 text-white font-semibold shadow disabled:opacity-60"
              >
                {isPaying ? "Sending…" : "Send KODU"}
              </button>
              <button
                onClick={() => router.back()}
                className="py-2 px-3 rounded-md border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
