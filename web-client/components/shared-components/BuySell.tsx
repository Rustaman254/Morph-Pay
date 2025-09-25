"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ArrowDownUp, PlusCircle } from "lucide-react";

// --- Types ---
type Mode = "swap" | "send";
type Tab = "BUY" | "SELL" | "fiat" | "crypto";
interface Token {
  symbol: "ETH" | "USDT" | "BNB";
  name: string;
  logo: string;
  balance: number;
}
interface Country {
  name: string;
  code: string; // ISO 3166-1-alpha-2 (e.g. KE, NG, US etc, must be lowercase for CSS)
  currency: string;
  rate: number;
  networks: string[];
}

// --- Dummy Data ---
const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", logo: "/ethereum-eth-logo.png", balance: 2.543 },
  { symbol: "USDT", name: "Tether USD", logo: "/tether-usdt-logo.png", balance: 403.44 },
  { symbol: "BNB", name: "Binance Coin", logo: "/bnb-bnb-logo.png", balance: 5.32 }
];
const COUNTRIES: Country[] = [
  { name: "Kenya", code: "ke", currency: "KES", rate: 160, networks: ["Mpesa", "Airtel Money", "Telkom"] },
  { name: "Nigeria", code: "ng", currency: "NGN", rate: 950, networks: ["MTN", "Airtel", "Glo", "9mobile"] },
  { name: "USA", code: "us", currency: "USD", rate: 1, networks: ["T-Mobile", "AT&T", "Verizon"] },
  { name: "Tanzania", code: "tz", currency: "TZS", rate: 2500, networks: ["Vodacom", "Airtel", "Tigo", "Halotel"] },
  { name: "Uganda", code: "ug", currency: "UGX", rate: 3800, networks: ["MTN", "Airtel", "Africell"] }
];
const TOKEN_TO_USD: Record<"ETH" | "USDT" | "BNB", number> = { ETH: 2000, USDT: 1, BNB: 310 };
const MARKET_RATES: Record<string, number> = {
  "ETH:USDT": 2000,
  "USDT:ETH": 1 / 2000,
  "ETH:BNB": 6.28,
  "BNB:ETH": 1 / 6.28,
  "USDT:BNB": 0.00314,
  "BNB:USDT": 318,
};

// Token Pill Button (unchanged)
function tokenPillButton(
  dropdown: boolean,
  setDropdown: (v: boolean) => void,
  value: Token,
  list: Token[],
  onChange: (item: Token) => void
) {
  return (
    <button
      onClick={() => setDropdown(!dropdown)}
      className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full relative"
      style={{ minWidth: 90, minHeight: 44, border: "none" }}
      type="button"
    >
      <img
        src={value.logo}
        alt={value.name}
        width={32}
        height={32}
        className="w-7 h-7 sm:w-8 sm:h-8 mr-2 rounded-full"
      />
      {value.symbol}
      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
      </svg>
      {dropdown && (
        <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
          {list.map(item => (
            <div
              key={item.symbol}
              onClick={() => { onChange(item); setDropdown(false); }}
              className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
            >
              <img
                src={item.logo}
                alt={item.name}
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              />
              <span className="font-semibold">{item.symbol}</span>
              <span className="text-gray-400 text-xs">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// Country Pill Button (flag-icons solution)
function countryPillButton(
  dropdown: boolean,
  setDropdown: (v: boolean) => void,
  value: Country,
  list: Country[],
  onChange: (item: Country) => void
) {
  return (
    <button
      onClick={() => setDropdown(!dropdown)}
      className="flex items-center bg-[#1e2127] text-white text-base sm:text-lg font-bold px-5 sm:px-8 py-2 rounded-full relative min-w-[120px]"
      type="button"
    >
      <span className={`fi fi-${value.code} mr-2`} style={{ width: 28, height: 20, fontSize: 22, borderRadius: 4 }} />
      <span className="font-semibold">{value.name}</span>
      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
      </svg>
      {dropdown && (
        <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
          {list.map(item => (
            <div
              key={item.code}
              onClick={() => { onChange(item); setDropdown(false); }}
              className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
            >
              <span className={`fi fi-${item.code}`} style={{ width: 28, height: 20, fontSize: 22, borderRadius: 4 }} />
              <span className="font-semibold">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// Rest is unchanged
function DepositModal({ show, onClose }: { show: boolean, onClose: () => void }) {
  return show ? (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/70">
      <div className="bg-[#232628] rounded-2xl w-full max-w-sm p-8 flex flex-col items-center shadow-xl relative">
        <button
          className="absolute top-4 right-4 text-[#96a954] hover:text-white text-2xl"
          onClick={onClose}>×</button>
        <PlusCircle className="w-10 h-10 text-[#96a954] mb-3" />
        <h2 className="text-[#96a954] font-bold text-2xl mb-2">Deposit Crypto</h2>
        <p className="text-white text-center text-base mb-4">Choose a provider to buy crypto with card or transfer.</p>
        <div className="w-full flex flex-col gap-4">
          <button className="bg-[#96a954] text-[#232628] p-3 rounded-full font-bold text-lg hover:bg-[#96a954]/80">Buy with MoonPay</button>
          <button className="bg-[#96a954] text-[#232628] p-3 rounded-full font-bold text-lg hover:bg-[#96a954]/80">Buy with Transak</button>
        </div>
        <span className="text-xs text-[#aaa] mt-6 block text-center">Funds will be deposited to your wallet address</span>
      </div>
    </div>
  ) : null;
}

// --- Main Component ---
export default function BuySellSend({ mode = "swap" }: { mode?: Mode }) {
  const [tab, setTab] = useState<Tab>(mode === "swap" ? "BUY" : "fiat");
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const key = `${fromToken.symbol}:${toToken.symbol}`;
  const marketRate = MARKET_RATES[key] || 1;
  const toAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
      ? (parseFloat(fromAmount) * marketRate).toFixed(6)
      : "0";

  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [network, setNetwork] = useState<string>(country.networks[0]);
  const [recipient, setRecipient] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  useEffect(() => { setNetwork(country.networks[0]); }, [country]);
  const tokenUsd = TOKEN_TO_USD[fromToken.symbol];
  const outputUsd = fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
    ? parseFloat(fromAmount) * tokenUsd
    : 0;
  const outputFiat = outputUsd * country.rate;
  const inputStyle = { boxShadow: "none", appearance: "textfield" as const };

  const [showDeposit, setShowDeposit] = useState(false);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <div className="flex items-start justify-start px-2 sm:px-4 md:px-0">
      <div className="w-full max-w-[430px] sm:max-w-lg md:max-w-2xl">
        {/* Tabs / Deposit */}
        {mode === "send" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {["fiat", "crypto"].map(label => (
                <button
                  key={label}
                  className={`
                    uppercase font-normal text-base sm:text-sm tracking-wide px-2 pb-1 border-b-2 transition
                    ${tab === label
                      ? "text-[#96a954] font-bold border-[#96a954]"
                      : "text-white border-transparent font-bold hover:text-[#96a954]"}
                  `}
                  onClick={() => setTab(label as Tab)}
                >{label === "fiat" ? "SEND FIAT" : "SEND CRYPTO"}</button>
              ))}
            </div>
            <button
              className="text-[#96a954] font-semibold text-base px-4 py-1.5 bg-[#1e2127] rounded-full border border-[#232628] hover:bg-[#232628] transition hidden sm:inline-flex items-center"
              onClick={() => setShowDeposit(true)}
              type="button"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Deposit
            </button>
          </div>
        )}

        {/* Card Layout */}
        <div className="relative flex flex-col items-center gap-2">
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                {tokenPillButton(showFromDropdown, setShowFromDropdown, fromToken, TOKENS, setFromToken)}
              </div>
              <span className="ml-auto text-xs sm:text-sm text-white font-medium">
                {mode === "swap" ? "you pay" : (tab === "crypto" ? "token" : "you pay")}
              </span>
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
              />
              <div className="flex flex-col items-end ml-auto">
                <span className="text-xs text-white mb-0.5">balance</span>
                <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
              </div>
            </div>
          </div>
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
          <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
            {/* Swap */}
            {mode === "swap" ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    {tokenPillButton(showToDropdown, setShowToDropdown, toToken, TOKENS, setToToken)}
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
            ) : tab === "crypto" ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    {tokenPillButton(showToDropdown, setShowToDropdown, fromToken, TOKENS, setFromToken)}
                  </div>
                  <span className="ml-auto text-xs sm:text-sm text-white font-medium">Send to</span>
                </div>
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
                <label className="block text-gray-400 text-sm mb-1 font-medium">Amount</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={e => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value); }}
                  className="w-full bg-transparent border-none outline-none text-lg font-bold text-white px-0 py-2 rounded focus:ring-2 focus:ring-[#96a954]"
                  style={inputStyle}
                  autoComplete="off"
                />
                <div className="flex flex-col items-end ml-auto mt-2">
                  <span className="text-xs text-white mb-0.5">balance</span>
                  <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    {countryPillButton(
                      showCountryDropdown,
                      setShowCountryDropdown,
                      country,
                      COUNTRIES,
                      setCountry
                    )}
                  </div>
                  <span className="ml-auto text-xs sm:text-sm text-white font-medium">you get</span>
                </div>
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
              </>
            )}
          </div>
          {mode === "send" && (tab === "fiat" || tab === "crypto") && (
            <div className="w-full bg-[#14161b] rounded-2xl px-4 py-3 mb-2 flex items-center gap-3 shadow">
              <span className="text-sm text-gray-400">Exchange Rate:</span>
              <span className="text-sm font-bold text-[#96a954]">
                1 {fromToken.symbol} = {(TOKEN_TO_USD[fromToken.symbol] * country.rate).toLocaleString()} {country.currency}
              </span>
            </div>
          )}
        </div>
        <form className="flex flex-col mt-2" onSubmit={handleSend}>
          <button
            className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg sm:text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-6"
            type="submit"
            disabled={sending}
          >
            {sending
              ? (mode === "swap" ? "Processing..." : "Sending...")
              : (mode === "swap"
                ? "Swap"
                : tab === "fiat"
                  ? "Send"
                  : "Send Crypto"
              )
            }
          </button>
        </form>
      </div>
      <DepositModal show={showDeposit} onClose={() => setShowDeposit(false)} />
    </div>
  );
}
