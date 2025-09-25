"use client";
import { useState, useEffect } from "react";
import { COUNTRIES, TOKEN_TO_USD } from "@/lib/constants"; // Adjust import as needed
import { ChevronDown } from "lucide-react";

// Country pill button as above (reuse or import)
function countryPillButton(dropdown, setDropdown, value, list, onChange) {
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
            <div key={item.code} onClick={() => { onChange(item); setDropdown(false); }} className="flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl">
              <span className={`fi fi-${item.code}`} style={{ width: 28, height: 20, fontSize: 22, borderRadius: 4 }} />
              <span className="font-semibold">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

export default function SendFiat() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [network, setNetwork] = useState(country.networks[0]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { setNetwork(country.networks[0]); }, [country]);

  const inputStyle = { boxShadow: "none", appearance: "textfield" as const };

  // Replace with your backend send logic!
  function handleSend(e) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setAmount("");
      setRecipient("");
      setNetwork(country.networks[0]);
      alert("Fiat transfer coming soon!");
    }, 1200);
  }

  const outputFiat = amount && !isNaN(Number(amount)) && Number(amount) !== 0
    ? parseFloat(amount)
    : 0;

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="uppercase font-normal text-base sm:text-sm tracking-wide text-[#96a954] font-bold border-b-2 border-[#96a954] px-2 pb-1">
          SEND FIAT
        </span>
      </div>
      <div className="relative flex flex-col items-center gap-2">
        <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col z-10 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              {countryPillButton(showCountryDropdown, setShowCountryDropdown, country, COUNTRIES, setCountry)}
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
        </div>
        <form className="flex flex-col mt-2 w-full" onSubmit={handleSend}>
          <button
            className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg sm:text-xl rounded-full transition hover:bg-[#96a954]/90 shadow-xl mt-6"
            type="submit"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
