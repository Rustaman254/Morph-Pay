"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ArrowDownUp } from "lucide-react";

// Dummy data
const TOKENS = [
  { symbol: "ETH", name: "Ethereum", logo: "/ethereum-eth-logo.png", balance: 2.543 },
  { symbol: "USDT", name: "Tether USD", logo: "/tether-usdt-logo.png", balance: 403.44 },
  { symbol: "BNB", name: "Binance Coin", logo: "/binance-coin-bnb-logo.png", balance: 5.32 },
];
const COUNTRIES = [
  { name: "Kenya", code: "KE", currency: "KES", flag: "/kenya.svg", rate: 160, networks: ["Mpesa", "Airtel Money", "Telkom"] },
  { name: "Nigeria", code: "NG", currency: "NGN", flag: "/nigeria.svg", rate: 950, networks: ["MTN", "Airtel", "Glo", "9mobile"] },
  { name: "USA", code: "US", currency: "USD", flag: "/usa.svg", rate: 1, networks: ["T-Mobile", "AT&T", "Verizon"] },
  { name: "Tanzania", code: "TZ", currency: "TZS", flag: "/tanzania.svg", rate: 2500, networks: ["Vodacom", "Airtel", "Tigo", "Halotel"] },
  { name: "Uganda", code: "UG", currency: "UGX", flag: "/uganda.svg", rate: 3800, networks: ["MTN", "Airtel", "Africell"] }
];
const TOKEN_TO_USD = { ETH: 2000, USDT: 1, BNB: 310 };
const MARKET_RATES = {
  "ETH:USDT": 2000,
  "USDT:ETH": 1 / 2000,
  "ETH:BNB": 6.28,
  "BNB:ETH": 1 / 6.28,
  "USDT:BNB": 0.00314,
  "BNB:USDT": 318,
};

type Mode = "swap" | "send";

export default function BuySellSend({ mode = "swap" }: { mode?: Mode }) {
  const [tab, setTab] = useState<"BUY" | "SELL" | "fiat" | "crypto">(mode === "swap" ? "BUY" : "fiat");
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [fromAmount, setFromAmount] = useState("");
  const [sending, setSending] = useState(false);

  // Swap-specific
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const key = `${fromToken.symbol}:${toToken.symbol}`;
  const marketRate = MARKET_RATES[key] || 1;
  const toAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
      ? (parseFloat(fromAmount) * marketRate).toFixed(6)
      : "0";

  // Send-specific
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [network, setNetwork] = useState(country.networks[0]);
  const [recipient, setRecipient] = useState("");
  const [address, setAddress] = useState("");
  useEffect(() => { setNetwork(country.networks[0]); }, [country]);
  const tokenUsd = TOKEN_TO_USD[fromToken.symbol] || 1;
  const outputUsd = fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
    ? parseFloat(fromAmount) * tokenUsd
    : 0;
  const outputFiat = outputUsd * country.rate;
  const inputStyle = { boxShadow: "none", appearance: "textfield" as any };

  function handleSwapShuffle() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setShowFromDropdown(false);
    setShowToDropdown(false);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFromAmount("");
      setRecipient("");
      setAddress("");
      alert(mode === "swap" ? "Swap complete!" : "Transfer Successful!");
    }, 1200);
  }

  const pillButton = (dropdown: boolean, setDropdown: (v: boolean) => void, value: any, list: any[], onChange: (item: any) => void) => (
    <button
      onClick={() => setDropdown(!dropdown)}
      className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full"
      style={{ minWidth: 90, minHeight: 44, border: "none" }}
      type="button"
    >
      {"logo" in value && <img src={value.logo || value.flag} alt="" className="w-7 h-7 sm:w-8 sm:h-8 mr-2 rounded-full" />}
      {"symbol" in value ? value.symbol : value.name}
      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
      </svg>
      {dropdown && <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
        {list.map(item => (
          <div key={item.symbol || item.code}
            onClick={() => { onChange(item); setDropdown(false); }}
            className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
          >
            {"logo" in item && <img src={item.logo || item.flag} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />}
            <span className="font-semibold">{item.symbol || item.name}</span>
            <span className="text-gray-400 text-xs">{item.name || item.currency}</span>
          </div>
        ))}
      </div>}
    </button>
  );

  return (
    <div className="w-full flex justify-center mt-4 px-2 sm:px-4 md:px-0">
      <div className="w-full max-w-[430px] sm:max-w-lg md:max-w-2xl">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {(mode === "swap" ? ["BUY", "SELL"] : ["fiat", "crypto"]).map(label => (
              <button
                key={label}
                className={`
                  uppercase font-bold text-base sm:text-lg tracking-wide px-2 pb-1 border-b-2 transition
                  ${tab === label
                    ? "text-[#96a954] border-[#96a954]"
                    : "text-white border-transparent hover:text-[#96a954]"}
                `}
                onClick={() => setTab(label as any)}
              >{mode === "swap" ? label : (label === "fiat" ? "SEND FIAT" : "SEND CRYPTO")}</button>
            ))}
          </div>
        </div>
        {/* Card Layout */}
        <div className="relative flex flex-col items-center gap-2">
          {/* Top Card */}
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                {pillButton(showFromDropdown, setShowFromDropdown, fromToken, TOKENS, setFromToken)}
              </div>
              <span className="ml-auto text-xs sm:text-sm text-white font-medium">you pay</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0.00"
                value={fromAmount}
                onChange={e => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value); }}
                className="bg-transparent border-none outline-none text-lg sm:text-2xl font-bold text-white px-0 focus:ring-0 w-2/3"
                style={inputStyle}
                autoComplete="off"
              />
              <div className="flex flex-col items-end ml-auto">
                <span className="text-xs text-white mb-0.5">balance</span>
                <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
              </div>
            </div>
          </div>
          {/* Center Overlap Circle */}
          <div
            className="absolute left-1/2 z-20"
            style={
              mode === "send"
                ? { top: 124, transform: "translateX(-50%)" }
                : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
            }
          >
            <span className="p-4 sm:p-5 rounded-full bg-[#232628] border-8 border-[#14161b] text-[#96a954] shadow-xl flex items-center" style={{ boxShadow: "0 4px 24px #23262880" }}>
              {mode === "swap"
                ? <ArrowDownUp className="w-7 h-7 sm:w-8 sm:h-8" />
                : <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8" />
              }
            </span>
          </div>
          {/* Bottom Card */}
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
            {/* Swap */}
            {(mode === "swap" || tab === "BUY" || tab === "SELL") ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    {pillButton(showToDropdown, setShowToDropdown, toToken, TOKENS, setToToken)}
                  </div>
                  <span className="ml-auto text-xs sm:text-sm text-white font-medium">you get</span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                    className="bg-transparent border-none outline-none text-lg sm:text-2xl font-bold text-white px-0 w-2/3 select-none opacity-80"
                    style={inputStyle}
                    autoComplete="off"
                  />
                  <div className="flex flex-col items-end ml-auto">
                    <span className="text-xs text-white mb-0.5">balance</span>
                    <span className="text-white text-sm sm:text-lg font-semibold">{toToken.balance}</span>
                  </div>
                </div>
              </>
            ) : (
              // Send
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    {pillButton(showCountryDropdown, setShowCountryDropdown, country, COUNTRIES, setCountry)}
                  </div>
                  {tab === "crypto"
                    ? null
                    : <span className="ml-auto text-xs sm:text-sm text-white font-medium">you get</span>
                  }
                </div>
                {tab === "crypto" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      inputMode="decimal"
                      readOnly
                      value={outputFiat ? outputFiat.toLocaleString() : "0.00"}
                      className="bg-transparent border-none outline-none text-lg sm:text-2xl font-bold text-white px-0 w-2/3 select-none opacity-80"
                      style={inputStyle}
                      autoComplete="off"
                    />
                    <div className="flex flex-col items-end ml-auto mt-1">
                      <span className="text-xs text-white mb-0.5">{country.currency}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {/* Card for Mobile Network & Phone (send mode, fiat only) */}
          {mode === "send" && tab === "fiat" && (
            <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-4 shadow-lg flex flex-col z-10 relative">
              <label className="text-gray-400 text-sm mb-1 font-medium">Mobile Network</label>
              <select
                value={network}
                onChange={e => setNetwork(e.target.value)}
                className="w-full bg-[#1e2127] text-white text-lg font-medium px-4 py-2 mb-2 rounded-full border-none outline-none focus:ring-2 focus:ring-[#96a954] transition"
              >
                {country.networks.map(n => (
                  <option value={n} key={n}>{n}</option>
                ))}
              </select>
              <label className="text-gray-400 text-sm mb-1 font-medium">Recipient Mobile Number</label>
              <input
                type="tel"
                placeholder={`e.g. +254 700000000`}
                required
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-lg font-bold text-white px-0 py-2 rounded focus:ring-2 focus:ring-[#96a954]"
                style={inputStyle}
                autoComplete="off"
              />
            </div>
          )}
          {/* Exchange rate card (for send only) */}
          {(mode === "send" && (tab === "fiat" || tab === "crypto")) && (
            <div className="w-full bg-[#14161b] rounded-2xl px-4 py-3 mb-2 flex items-center gap-3 shadow">
              <span className="text-sm text-gray-400">Exchange Rate:</span>
              <span className="text-sm font-bold text-[#96a954]">
                1 {fromToken.symbol} = {(TOKEN_TO_USD[fromToken.symbol] * country.rate).toLocaleString()} {country.currency}
              </span>
            </div>
          )}
        </div>
        {/* Action Button */}
        <form className="flex flex-col mt-2" onSubmit={handleSend}>
          <button
            className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg sm:text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-6"
            type="submit"
            disabled={sending}
          >
            {sending
              ? (mode === "swap" ? "Processing..." : "Sending...")
              : (mode === "swap"
                ? (tab === "BUY" ? "Buy Now" : "Sell Now")
                : "Send"
              )
            }
          </button>
        </form>
      </div>
    </div>
  );
}
