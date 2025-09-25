"use client";
import { useState } from "react";
import { TOKENS } from "@/lib/constants"; // Adjust to your data file
import { ChevronDown } from "lucide-react";

function tokenPillButton(dropdown, setDropdown, value, list, onChange) {
  return (
    <button
      onClick={() => setDropdown(!dropdown)}
      className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full relative"
      style={{ minWidth: 90, minHeight: 44, border: "none" }}
      type="button"
    >
      <img src={value.logo} alt={value.name} width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 mr-2 rounded-full" />
      {value.symbol}
      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" /></svg>
      {dropdown && (
        <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
          {list.map(item => (
            <div key={item.symbol} onClick={() => { onChange(item); setDropdown(false); }} className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl">
              <img src={item.logo} alt={item.name} width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
              <span className="font-semibold">{item.symbol}</span>
              <span className="text-gray-400 text-xs">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

export default function SendCrypto() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [fromAmount, setFromAmount] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);

  const inputStyle = { boxShadow: "none", appearance: "textfield" as const };

  // Replace with your SDK send logic!
  function handleSend(e) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFromAmount("");
      setAddress("");
      alert("Transfer Successful!");
    }, 1200);
  }

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="uppercase font-normal text-base sm:text-sm tracking-wide text-[#96a954] font-bold border-b-2 border-[#96a954] px-2 pb-1">
          SEND CRYPTO
        </span>
      </div>
      <div className="relative flex flex-col items-center gap-2">
        <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              {tokenPillButton(showFromDropdown, setShowFromDropdown, fromToken, TOKENS, setFromToken)}
            </div>
            <span className="ml-auto text-xs sm:text-sm text-white font-medium">token</span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="0.00"
              value={fromAmount}
              onChange={e => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value); }}
              className="bg-transparent border-none outline-none text-lg sm:text-4xl font-bold text-white px-0 focus:ring-0 w-2/3"
              style={inputStyle}
              autoComplete="off"
              required
            />
            <div className="flex flex-col items-end ml-auto">
              <span className="text-xs text-white mb-0.5">balance</span>
              <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 z-20" style={{ top: 124, transform: "translateX(-50%)" }}>
          <span className="p-4 sm:p-5 rounded-full bg-[#232628] border-8 border-[#14161b] text-[#96a954] shadow-xl flex items-center" style={{ boxShadow: "0 4px 24px #23262880" }}>
            <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8" />
          </span>
        </div>
        <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
          <label className="block text-gray-400 text-sm mb-1 font-medium">Recipient Wallet Address</label>
          <input
            type="text"
            placeholder="Paste wallet address"
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-lg font-bold text-white px-0 py-2 rounded focus:ring-2 focus:ring-[#96a954]"
            style={inputStyle}
            autoComplete="off"
          />
          <div className="flex flex-col items-end ml-auto mt-2">
            <span className="text-xs text-white mb-0.5">balance</span>
            <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
          </div>
        </div>
        <form className="flex flex-col mt-2 w-full" onSubmit={handleSend}>
          <button
            className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg sm:text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-6"
            type="submit"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Crypto"}
          </button>
        </form>
      </div>
    </div>
  );
}
