"use client";
import { useState } from "react";
import { RefreshCw, Settings, ArrowDownUp } from "lucide-react";

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

  const key = `${fromToken.symbol}:${toToken.symbol}`;
  const marketRate = MARKET_RATES[key] || 1;
  const toAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
      ? (parseFloat(fromAmount) * marketRate).toFixed(6)
      : "0";

  const handleShuffle = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const inputStyle = {
    boxShadow: "none",
    appearance: "textfield" as any,
  };

  return (
    <div className="w-full flex justify-center mt-4 px-2 sm:px-4 md:px-0">
      <div className="w-full max-w-[430px] sm:max-w-lg md:max-w-2xl">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {["BUY", "SELL"].map(label => (
              <button
                key={label}
                className={`uppercase font-bold text-base sm:text-lg tracking-wide px-2 pb-1 border-b-2 transition
                  ${action === label
                    ? "text-[#96a954] border-[#96a954]"
                    : "text-white border-transparent hover:text-[#96a954]"}
                `}
                onClick={() => setAction(label as "BUY" | "SELL")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full text-white hover:text-[#96a954]" title="Refresh">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="p-2 rounded-full text-white hover:text-[#96a954]" title="Settings">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Cards + Shuffle */}
        <div className="relative flex flex-col items-center gap-2 md:gap-2">
          {/* Top card */}
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 md:px-10 py-6 md:py-8 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowFromDropdown(v => !v)}
                  className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full"
                  style={{ minWidth: 80, minHeight: 44, border: "none" }}
                >
                  <img src={fromToken.logo} alt={fromToken.symbol} className="w-7 h-7 sm:w-8 sm:h-8 mr-2 rounded-full" />
                  {fromToken.symbol}
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
                  </svg>
                </button>
                {showFromDropdown &&
                  <div className="absolute left-0 mt-2 w-44 sm:w-56 md:w-64 bg-[#232628] z-20 rounded-2xl shadow-lg">
                    {TOKENS.map(t => (
                      <div
                        key={t.symbol}
                        onClick={() => { setFromToken(t); setShowFromDropdown(false); }}
                        className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
                      >
                        <img src={t.logo} alt={t.symbol} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                        <span className="font-semibold">{t.symbol}</span>
                        <span className="text-gray-400 text-xs">{t.name}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
              <span className="ml-auto text-xs md:text-sm text-white font-medium">you pay</span>
            </div>
            <div className="flex items-end justify-between mt-2 md:mt-5">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0.00"
                value={fromAmount}
                onChange={e => {
                  if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value);
                }}
                className="bg-transparent border-none outline-none text-lg sm:text-2xl font-bold text-white px-0 focus:ring-0 w-2/3"
                style={inputStyle}
                autoComplete="off"
                inputMode="decimal"
              />
              <div className="flex flex-col items-end ml-auto">
                <span className="text-xs text-white mb-0.5">balance</span>
                <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
              </div>
            </div>
          </div>
          {/* Shuffle icon, always centered and overlapping cards */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={handleShuffle}
              className="p-4 sm:p-5 rounded-full bg-[#232628] border-8 border-[#14161b] text-[#96a954] shadow-xl"
              title="Switch tokens" type="button"
              style={{ boxShadow: "0 4px 24px #23262880" }}
            >
              <ArrowDownUp className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </div>
          {/* Bottom card */}
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 md:px-10 py-6 md:py-8 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowToDropdown(v => !v)}
                  className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full"
                  style={{ minWidth: 80, minHeight: 44 }}
                >
                  <img src={toToken.logo} alt={toToken.symbol} className="w-7 h-7 sm:w-8 sm:h-8 mr-2 rounded-full" />
                  {toToken.symbol}
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
                  </svg>
                </button>
                {showToDropdown &&
                  <div className="absolute left-0 mt-2 w-44 sm:w-56 md:w-64 bg-[#232628] z-20 rounded-2xl shadow-lg">
                    {TOKENS.map(t => (
                      <div
                        key={t.symbol}
                        onClick={() => { setToToken(t); setShowToDropdown(false); }}
                        className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
                      >
                        <img src={t.logo} alt={t.symbol} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                        <span className="font-semibold">{t.symbol}</span>
                        <span className="text-gray-400 text-xs">{t.name}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
              <span className="ml-auto text-xs md:text-sm text-white font-medium">you get</span>
            </div>
            <div className="flex items-end justify-between mt-2 md:mt-5">
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
          </div>
        </div>
        {/* Button */}
        <button
          className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg sm:text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-8"
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
