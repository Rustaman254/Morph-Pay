"use client";
import { useState } from "react";
import { RefreshCw, Settings, ArrowDownUp } from "lucide-react";

// Dummy market rates for token conversions
const MARKET_RATES: Record<string, number> = {
  "ETH:USDT": 2000,
  "USDT:ETH": 1 / 2000,
  "ETH:BNB": 6.28,
  "BNB:ETH": 1 / 6.28,
  "USDT:BNB": 0.00314,
  "BNB:USDT": 318,
};

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", balance: 2.543 },
  { symbol: "USDT", name: "Tether USD", logo: "https://cryptologos.cc/logos/tether-usdt-logo.png", balance: 403.44 },
  { symbol: "BNB", name: "Binance Coin", logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", balance: 5.32 },
];

export default function CryptoWallet() {
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromAmount, setFromAmount] = useState("");

  // Calculate output amount using market rates
  const key = `${fromToken.symbol}:${toToken.symbol}`;
  const marketRate = MARKET_RATES[key] || 1;
  const toAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
      ? (parseFloat(fromAmount) * marketRate).toFixed(6)
      : "0";

  // Shuffle swaps tokens and values
  const handleShuffle = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  // Remove number input spin buttons with CSS (for Webkit browsers)
  const inputStyle = {
    boxShadow: "none",
    appearance: "textfield" as any,
  };

  return (
    <div className="w-full flex justify-center mt-10">
      <div className="w-full max-w-2xl">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-5">
            {["BUY", "SELL"].map(label => (
              <button
                key={label}
                className={`uppercase font-bold text-lg tracking-wide px-3 pb-1 border-b-2 transition
                  ${action === label
                    ? "text-[#96a954] border-[#96a954]"
                    : "text-white border-transparent hover:text-[#96a954]"}
                `}
                onClick={() => setAction(label as "BUY" | "SELL")}
              >{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full text-white hover:text-[#96a954]" title="Refresh">
              <RefreshCw className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full text-white hover:text-[#96a954]" title="Settings">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CARDS + SHUFFLE ICON */}
        <div className="flex flex-col items-center gap-2 relative">
          {/* FROM CARD */}
          <div className="w-full bg-[#232628] rounded-2xl px-10 py-7 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowFromDropdown(v => !v)}
                  className="flex items-center bg-[#1e2127] text-white text-lg font-bold px-8 py-2 rounded-full"
                  style={{ minWidth: 110, minHeight: 44, border: "none" }}
                >
                  <img src={fromToken.logo} alt={fromToken.symbol} className="w-8 h-8 mr-2 rounded-full" />
                  {fromToken.symbol}
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
                  </svg>
                </button>
                {showFromDropdown &&
                  <div className="absolute left-0 mt-2 w-64 bg-[#232628] z-20 rounded-2xl shadow-lg">
                    {TOKENS.map(t => (
                      <div
                        key={t.symbol}
                        onClick={() => { setFromToken(t); setShowFromDropdown(false); }}
                        className="flex items-center gap-2 py-3 px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
                      >
                        <img src={t.logo} alt={t.symbol} className="w-8 h-8 rounded-full" />
                        <span className="font-semibold">{t.symbol}</span>
                        <span className="text-gray-400 text-xs">{t.name}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
              <span className="ml-auto text-sm text-white font-medium">you pay</span>
            </div>
            <div className="flex items-end justify-between mt-5">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0.00"
                value={fromAmount}
                onChange={e => {
                  // Only allow numbers and decimals
                  if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value);
                }}
                className="bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-white px-0 focus:ring-0 w-2/3"
                style={inputStyle}
                autoComplete="off"
              />
              <div className="flex flex-col items-end ml-auto">
                <span className="text-xs text-white mb-0.5">balance</span>
                <span className="text-white text-lg font-semibold">{fromToken.balance}</span>
              </div>
            </div>
          </div>

          {/* SHUFFLE ICON */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={handleShuffle}
              className="p-5 rounded-full bg-[#232628] border-8 border-[#14161b] text-[#96a954] shadow-xl"
              title="Switch tokens" type="button"
              style={{ boxShadow: "0 4px 24px #23262880" }}
            >
              <ArrowDownUp className="w-8 h-8" />
            </button>
          </div>

          {/* TO CARD */}
          <div className="w-full bg-[#232628] rounded-2xl px-10 py-7 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowToDropdown(v => !v)}
                  className="flex items-center bg-[#1e2127] text-white text-lg font-bold px-8 py-2 rounded-full"
                  style={{ minWidth: 110, minHeight: 44 }}
                >
                  <img src={toToken.logo} alt={toToken.symbol} className="w-8 h-8 mr-2 rounded-full" />
                  {toToken.symbol}
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
                  </svg>
                </button>
                {showToDropdown &&
                  <div className="absolute left-0 mt-2 w-64 bg-[#232628] z-20 rounded-2xl shadow-lg">
                    {TOKENS.map(t => (
                      <div
                        key={t.symbol}
                        onClick={() => { setToToken(t); setShowToDropdown(false); }}
                        className="flex items-center gap-2 py-3 px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
                      >
                        <img src={t.logo} alt={t.symbol} className="w-8 h-8 rounded-full" />
                        <span className="font-semibold">{t.symbol}</span>
                        <span className="text-gray-400 text-xs">{t.name}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
              <span className="ml-auto text-sm text-white font-medium">you get</span>
            </div>
            <div className="flex items-end justify-between mt-5">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-white px-0 w-2/3 select-none opacity-80"
                style={inputStyle}
                autoComplete="off"
              />
              <div className="flex flex-col items-end ml-auto">
                <span className="text-xs text-white mb-0.5">balance</span>
                <span className="text-white text-lg font-semibold">{toToken.balance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full radius button */}
        <button
          className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-8"
          type="button"
        >
          {action === "BUY" ? "Buy Now" : "Sell Now"}
        </button>
      </div>
      <style jsx global>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
