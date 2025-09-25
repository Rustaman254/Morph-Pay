"use client";
import { PlusCircle } from "lucide-react";

export default function DepositModal({
  show,
  onClose
}: {
  show: boolean;
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-[#232628] rounded-2xl w-full max-w-sm p-8 flex flex-col items-center shadow-xl relative">
        <button
          className="absolute top-4 right-4 text-[#96a954] hover:text-white text-2xl"
          onClick={onClose}
        >×</button>
        <PlusCircle className="w-10 h-10 text-[#96a954] mb-3" />
        <h2 className="text-[#96a954] font-bold text-2xl mb-2">Deposit Crypto</h2>
        <p className="text-white text-center text-base mb-4">
          Choose a provider to buy crypto with card or transfer.
        </p>
        <div className="w-full flex flex-col gap-4">
          <button className="bg-[#96a954] text-[#232628] p-3 rounded-full font-bold text-lg hover:bg-[#96a954]/80">
            Buy with MoonPay
          </button>
          <button className="bg-[#96a954] text-[#232628] p-3 rounded-full font-bold text-lg hover:bg-[#96a954]/80">
            Buy with Transak
          </button>
        </div>
        <span className="text-xs text-[#aaa] mt-6 block text-center">
          Funds will be deposited to your wallet address
        </span>
      </div>
    </div>
  );
}
