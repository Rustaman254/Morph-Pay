// "use client";
// import { useState, useEffect } from "react";
// import { ChevronDown } from "lucide-react";

// const TOKENS = [
//   { symbol: "ETH", name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", balance: 2.543 },
//   { symbol: "USDT", name: "Tether USD", logo: "https://cryptologos.cc/logos/tether-usdt-logo.png", balance: 403.44 },
//   { symbol: "BNB", name: "Binance Coin", logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", balance: 5.32 },
// ];
// const COUNTRIES = [
//   { name: "Kenya", code: "KE", currency: "KES", flag: "/kenya.svg", rate: 160, networks: ["Mpesa", "Airtel Money", "Telkom"] },
//   { name: "Nigeria", code: "NG", currency: "NGN", flag: "/nigeria.svg", rate: 950, networks: ["MTN", "Airtel", "Glo", "9mobile"] },
//   { name: "USA", code: "US", currency: "USD", flag: "/usa.svg", rate: 1, networks: ["T-Mobile", "AT&T", "Verizon"] },
//   { name: "Tanzania", code: "TZ", currency: "TZS", flag: "/tanzania.svg", rate: 2500, networks: ["Vodacom", "Airtel", "Tigo", "Halotel"] },
//   { name: "Uganda", code: "UG", currency: "UGX", flag: "/uganda.svg", rate: 3800, networks: ["MTN", "Airtel", "Africell"] }
// ];
// const TOKEN_TO_USD: Record<string, number> = { ETH: 2000, USDT: 1, BNB: 310 };

// export default function SendComponent() {
//   const [tab, setTab] = useState<"fiat" | "crypto">("fiat");
//   const [fromToken, setFromToken] = useState(TOKENS[0]);
//   const [showTokenDropdown, setShowTokenDropdown] = useState(false);
//   const [fromAmount, setFromAmount] = useState("");
//   const [country, setCountry] = useState(COUNTRIES[0]);
//   const [showCountryDropdown, setShowCountryDropdown] = useState(false);
//   const [network, setNetwork] = useState(country.networks[0]);
//   const [recipient, setRecipient] = useState("");
//   const [sending, setSending] = useState(false);
//   const [address, setAddress] = useState("");

//   useEffect(() => {
//     setNetwork(country.networks[0]);
//   }, [country]);

//   const tokenUsd = TOKEN_TO_USD[fromToken.symbol] || 1;
//   const outputUsd = fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) !== 0
//     ? parseFloat(fromAmount) * tokenUsd
//     : 0;
//   const outputFiat = outputUsd * country.rate;

//   const inputStyle = { boxShadow: "none", appearance: "textfield" as any };

//   function handleSend(e: React.FormEvent) {
//     e.preventDefault();
//     setSending(true);
//     setTimeout(() => {
//       setSending(false);
//       setFromAmount("");
//       setRecipient("");
//       setAddress("");
//       alert("Transfer Successful!");
//     }, 1200);
//   }

//   // Tabs bar (no icons, transparent background)
//   const TabBar = (
//     <div className="flex items-center gap-4 mb-6">
//       <button
//         onClick={() => setTab("fiat")}
//         className={`uppercase font-bold text-base sm:text-lg px-3 py-2 rounded-full transition tracking-wide 
//           ${tab === "fiat" 
//             ? "text-[#96a954] bg-transparent" 
//             : "text-white bg-transparent hover:text-[#96a954]"}`}
//         style={{ border: "none" }}
//       >
//         Send Fiat
//       </button>
//       <button
//         onClick={() => setTab("crypto")}
//         className={`uppercase font-bold text-base sm:text-lg px-3 py-2 rounded-full transition tracking-wide 
//           ${tab === "crypto"
//             ? "text-[#96a954] bg-transparent"
//             : "text-white bg-transparent hover:text-[#96a954]"}`}
//         style={{ border: "none" }}
//       >
//         Send Crypto
//       </button>
//     </div>
//   );

//   return (
//     <div className="w-full flex justify-center mt-4 px-2 sm:px-4">
//       <div className="w-full max-w-[430px] sm:max-w-lg md:max-w-2xl">
//         {TabBar}
//         <div className="flex flex-col gap-2">
//           {/* TOKEN CARD */}
//           <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col">
//             <div className="flex items-center justify-between mb-3">
//               <div className="relative">
//                 <button type="button"
//                   onClick={() => setShowTokenDropdown(v => !v)}
//                   className="flex items-center bg-[#1e2127] text-white text-lg font-bold px-5 sm:px-8 py-2 rounded-full"
//                   style={{ minWidth: 90, minHeight: 44 }}
//                 >
//                   <img src={fromToken.logo} alt={fromToken.symbol} className="w-8 h-8 mr-2 rounded-full" />
//                   {fromToken.symbol}
//                   <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//                 {showTokenDropdown &&
//                   <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
//                     {TOKENS.map(t => (
//                       <div key={t.symbol}
//                         onClick={() => { setFromToken(t); setShowTokenDropdown(false); }}
//                         className="flex items-center gap-2 py-2 px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
//                       >
//                         <img src={t.logo} alt={t.symbol} className="w-8 h-8 rounded-full" />
//                         <span className="font-semibold">{t.symbol}</span>
//                         <span className="text-gray-400 text-xs">{t.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 }
//               </div>
//               <span className="ml-auto text-xs md:text-sm text-white font-medium">you pay</span>
//             </div>
//             <div className="flex items-end justify-between mt-1">
//               <input
//                 type="text"
//                 inputMode="decimal"
//                 pattern="[0-9]*"
//                 placeholder="0.00"
//                 value={fromAmount}
//                 onChange={e => {
//                   if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setFromAmount(e.target.value);
//                 }}
//                 className="bg-transparent border-none outline-none text-3xl sm:text-4xl font-extrabold text-white px-0 focus:ring-0 w-2/3"
//                 style={inputStyle}
//                 autoComplete="off"
//               />
//               <div className="flex flex-col items-end ml-auto">
//                 <span className="text-xs text-white mb-0.5">balance</span>
//                 <span className="text-white text-sm sm:text-lg font-semibold">{fromToken.balance}</span>
//               </div>
//             </div>
//           </div>
//           {/* DOWN ARROW CIRCLE */}
//           <div className="flex justify-center relative -my-4 z-20">
//             <span className="p-4 sm:p-5 rounded-full bg-[#232628] border-8 border-[#14161b] text-[#96a954] shadow-xl flex items-center" style={{ boxShadow: "0 4px 24px #23262880" }}>
//               <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8" />
//             </span>
//           </div>
//           {/* SECOND CARD */}
//           {tab === "crypto" ? (
//             <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="relative w-full">
//                   <button type="button"
//                     onClick={() => setShowCountryDropdown(v => !v)}
//                     className="flex items-center bg-[#1e2127] text-white text-lg font-bold px-5 sm:px-8 py-2 rounded-full w-full"
//                     style={{ minHeight: 44 }}
//                   >
//                     <img src={country.flag} alt={country.name} className="w-8 h-8 mr-2 rounded-full" />
//                     {country.name}
//                     <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                   {showCountryDropdown &&
//                     <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
//                       {COUNTRIES.map(c => (
//                         <div key={c.code}
//                           onClick={() => { setCountry(c); setShowCountryDropdown(false); }}
//                           className="flex items-center gap-2 py-2 px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
//                         >
//                           <img src={c.flag} alt={c.name} className="w-8 h-8 rounded-full" />
//                           <span className="font-semibold">{c.name}</span>
//                           <span className="text-gray-400 text-xs">{c.currency}</span>
//                         </div>
//                       ))}
//                     </div>
//                   }
//                 </div>
//               </div>
//               <label className="block text-gray-400 text-sm mb-1 font-medium">Recipient Wallet Address</label>
//               <input
//                 type="text"
//                 placeholder="Paste wallet address"
//                 required
//                 value={address}
//                 onChange={e => setAddress(e.target.value)}
//                 className="w-full bg-transparent border-none outline-none text-lg font-bold text-white px-0 py-2 rounded focus:ring-2 focus:ring-[#96a954]"
//                 style={inputStyle}
//                 autoComplete="off"
//               />
//             </div>
//           ) : (
//             <div className="w-full bg-[#232628] rounded-2xl px-4 sm:px-6 py-6 shadow-lg flex flex-col">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="relative">
//                   <button type="button"
//                     onClick={() => setShowCountryDropdown(v => !v)}
//                     className="flex items-center bg-[#1e2127] text-white text-lg font-bold px-5 sm:px-8 py-2 rounded-full"
//                     style={{ minWidth: 120, minHeight: 44 }}
//                   >
//                     <img src={country.flag} alt={country.name} className="w-8 h-8 mr-2 rounded-full" />
//                     {country.name}
//                     <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                   {showCountryDropdown &&
//                     <div className="absolute left-0 mt-2 w-44 sm:w-56 bg-[#232628] z-20 rounded-2xl shadow-lg">
//                       {COUNTRIES.map(c => (
//                         <div key={c.code}
//                           onClick={() => { setCountry(c); setShowCountryDropdown(false); }}
//                           className="flex items-center gap-2 py-2 px-4 hover:bg-[#1e2127] cursor-pointer rounded-2xl"
//                         >
//                           <img src={c.flag} alt={c.name} className="w-8 h-8 rounded-full" />
//                           <span className="font-semibold">{c.name}</span>
//                           <span className="text-gray-400 text-xs">{c.currency}</span>
//                         </div>
//                       ))}
//                     </div>
//                   }
//                 </div>
//                 <span className="ml-auto text-xs md:text-sm text-white font-medium">you get</span>
//               </div>
//               <input
//                 type="text"
//                 inputMode="decimal"
//                 readOnly
//                 value={outputFiat ? outputFiat.toLocaleString() : "0.00"}
//                 className="bg-transparent border-none outline-none text-lg sm:text-2xl font-bold text-white px-0 w-2/3 select-none opacity-80"
//                 style={inputStyle}
//                 autoComplete="off"
//               />
//               <div className="flex flex-col items-end ml-auto mt-1">
//                 <span className="text-xs text-white mb-0.5">{country.currency}</span>
//               </div>
//               {/* Mobile network above number */}
//               <label className="text-gray-400 text-sm mb-1 font-medium mt-2">Mobile Network</label>
//               <select
//                 value={network}
//                 onChange={e => setNetwork(e.target.value)}
//                 className="w-full bg-[#1e2127] text-white text-lg font-medium px-4 py-2 mb-1 rounded-full border-none outline-none focus:ring-2 focus:ring-[#96a954] transition"
//               >
//                 {country.networks.map(n => (
//                   <option value={n} key={n}>{n}</option>
//                 ))}
//               </select>
//               <label className="text-gray-400 text-sm mb-1 font-medium mt-1">Recipient Mobile Number</label>
//               <input
//                 type="tel"
//                 placeholder={`e.g. +254 700000000`}
//                 required
//                 value={recipient}
//                 onChange={e => setRecipient(e.target.value)}
//                 className="w-full bg-transparent border-none outline-none text-lg font-bold text-white px-0 py-2 rounded focus:ring-2 focus:ring-[#96a954]"
//                 style={inputStyle}
//                 autoComplete="off"
//               />
//             </div>
//           )}
//           {/* Exchange Rate */}
//           <div className="w-full bg-[#14161b] rounded-2xl px-4 py-3 mb-2 flex items-center gap-3 shadow">
//             <span className="text-sm text-gray-400">Exchange Rate:</span>
//             <span className="text-sm font-bold text-[#96a954]">
//               1 {fromToken.symbol} = {(TOKEN_TO_USD[fromToken.symbol] * country.rate).toLocaleString()} {country.currency}
//             </span>
//           </div>
//           {/* Send Button (always at bottom, separated by gap-2) */}
//           <form className="flex flex-col gap-2" onSubmit={handleSend}>
//             <button
//               className="w-full py-4 bg-[#96a954] text-[#232628] font-extrabold text-lg rounded-full transition hover:bg-[#96a954]/90 shadow-xl"
//               type="submit"
//               disabled={sending}
//             >
//               {sending ? "Sending..." : "Send"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
