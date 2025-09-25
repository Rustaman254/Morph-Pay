"use client";
import { useState } from "react";
import {
  ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Clock, X, Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Dummy Transactions
const DUMMY_TRANSACTIONS = [
  {
    id: "tx01",
    type: "Sent",
    from: "0x12fc...C89F",
    to: "0x45fa...C89F",
    token: "ETH",
    amount: 0.09,
    date: "2025-09-20 09:33",
    status: "Success",
    logo: "/ethereum-eth-logo.png",
    network: "Ethereum",
    txHash: "0xabcdef0123456789",
    fee: "0.00021 ETH",
    block: "19423321"
  },
  {
    id: "tx02",
    type: "Received",
    from: "0x34b8...9112",
    to: "0x12fc...C89F",
    token: "USDT",
    amount: 120.5,
    date: "2025-09-20 07:17",
    status: "Success",
    logo: "/tether-usdt-logo.png",
    network: "Starknet",
    txHash: "0x55e611204af...",
    fee: "0.81 USDT",
    block: "19422999"
  },
  {
    id: "tx03",
    type: "Sent",
    from: "0x12fc...C89F",
    to: "0x7Ef6...AE23",
    token: "BNB",
    amount: 1.334,
    date: "2025-09-19 21:01",
    status: "Pending",
    logo: "/bnb-bnb-logo.png",
    network: "BNB Chain",
    txHash: "0xa3eb2effff...",
    fee: "0.01 BNB",
    block: "19332259"
  },
  {
    id: "tx04",
    type: "Received",
    from: "0x899f...7711",
    to: "0x12fc...C89F",
    token: "ETH",
    amount: 0.03,
    date: "2025-09-18 22:44",
    status: "Failed",
    logo: "/ethereum-eth-logo.png",
    network: "Ethereum",
    txHash: "0x419eb54133...",
    fee: "0.00021 ETH",
    block: "19199321"
  }
];

function parseDateString(dateString) {
  if (!dateString) return null;
  const onlyDate = dateString.split(" ")[0];
  return new Date(onlyDate);
}

function TransactionDetails({ tx, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="relative z-[101] pointer-events-auto bg-[#232628]/80 backdrop-blur-md rounded-2xl w-full max-w-2xl flex flex-col md:flex-row shadow-2xl overflow-hidden">
        {/* Summary */}
        <div className="md:w-5/12 w-full flex flex-col items-center justify-center bg-[#232628]/80 px-8 py-8 gap-3">
          <button
            aria-label="Close"
            className="absolute top-6 right-6 md:right-auto md:left-6 text-[#96a954] hover:text-white text-2xl"
            onClick={onClose}>
            <X />
          </button>
          <Image src={tx.logo} alt={tx.token} width={54} height={54} className="rounded-full border-2 border-[#232628]" />
          <span className="font-bold text-3xl text-white">{tx.amount} {tx.token}</span>
          <div className="flex items-center gap-2">
            {tx.type === "Sent" 
              ? <ArrowUpRight className="w-5 h-5 text-red-400" />
              : <ArrowDownLeft className="w-5 h-5 text-[#96a954]" />}
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider
              ${tx.type === "Sent" ? "bg-red-900 text-red-400" : "bg-green-900 text-[#96a954]"}`}>
              {tx.type}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {tx.status === "Success" && <>
              <CheckCircle2 className="w-5 h-5 text-[#96a954]" />
              <span className="text-[#96a954] text-xs font-bold">Success</span>
            </>}
            {tx.status === "Pending" && <>
              <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-bold">Pending</span>
            </>}
            {tx.status === "Failed" && <>
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-xs font-bold">Failed</span>
            </>}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-2">{tx.date}</div>
        </div>
        {/* Details */}
        <div className="md:w-7/12 w-full px-6 py-8 flex flex-col gap-2 text-white font-mono">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-[#1e2127]/60 mb-3">
            <span className="text-base text-gray-400">Network:</span>
            <span className="text-base text-white">{tx.network}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-400">{tx.type === "Sent" ? "From:" : "Sender:"}</span>
            <span className="text-sm text-white">{tx.from}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-400">{tx.type === "Sent" ? "To:" : "Recipient:"}</span>
            <span className="text-sm text-white">{tx.to}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-400">Status:</span>
            <span className={`font-bold text-base ${
                tx.status === "Success" ? "text-[#96a954]" :
                tx.status === "Pending" ? "text-yellow-400" : "text-red-400"
              }`}>
              {tx.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-base">
            <span className="text-gray-400">Fee:</span>
            <span>{tx.fee}</span>
          </div>
          <div className="flex items-center gap-4 text-base">
            <span className="text-gray-400">Block:</span>
            <span>{tx.block}</span>
          </div>
          <div className="flex flex-col gap-1 py-2">
            <span className="text-base text-gray-400">Transaction Hash:</span>
            <span className="break-all text-xs text-[#96a954]">{tx.txHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PER_PAGE = 3;

export default function Transactions({ compact = false }) {
  // Simulate connection state
  const [connected] = useState(true);

  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState<"All" | "Sent" | "Received">("All");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(1);

  // Filtering logic (bypassed in compact mode)
  let filtered = filter === "All"
    ? DUMMY_TRANSACTIONS
    : DUMMY_TRANSACTIONS.filter(tx => tx.type === filter);

  if (searchDate) {
    filtered = filtered.filter(tx => {
      const txDateObj = parseDateString(tx.date);
      return txDateObj &&
        txDateObj.toISOString().slice(0, 10) === searchDate;
    });
  }

  // Show only the latest 3 in compact mode
  const txsToShow = compact
    ? DUMMY_TRANSACTIONS.slice(0, 3)
    : filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Pagination variables (full mode only)
  const pageCount = Math.ceil(filtered.length / PER_PAGE);

  function renderEmptyState() {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <XCircle className="w-10 h-10 text-red-400 mb-2" />
        <span className="text-center text-lg text-gray-400">No transactions found</span>
      </div>
    );
  }

  function renderNotConnectedState() {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <Wallet className="w-10 h-10 text-gray-400 mb-2" />
        <span className="text-center text-lg text-gray-400">Connect your wallet to view transactions</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-8 px-2 sm:px-4">
      <div className="w-full max-w-lg">
        <div className="bg-[transparent]/80 backdrop-blur-md rounded-2xl shadow-lg">
          {/* Only show filter in non-compact mode */}
          {!compact && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                {["All", "Sent", "Received"].map(type => (
                  <button
                    key={type}
                    className={`px-5 py-2 rounded-full text-base font-semibold transition
                      ${filter === type
                        ? "bg-[#96a954] text-[#232628]"
                        : "bg-[#1e2127] text-white hover:bg-[#2f3239]"}
                    `}
                    onClick={() => {
                      setFilter(type);
                      setPage(1);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {connected && (
                <div className="ml-auto flex flex-col gap-1">
                  <label className="text-white text-base font-medium" htmlFor="tx-date">
                    Filter by date:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="tx-date"
                      type="date"
                      value={searchDate}
                      onChange={e => {
                        setSearchDate(e.target.value);
                        setPage(1);
                      }}
                      className="bg-[#1e2127] border-none rounded-full px-4 py-2 text-white font-mono focus:ring-2 focus:ring-[#96a954]"
                      max={new Date().toISOString().slice(0, 10)}
                    />
                    {searchDate && (
                      <button
                        tabIndex={-1}
                        aria-label="Clear date"
                        onClick={() => setSearchDate("")}
                        className="text-gray-400 text-lg ml-1 px-2 pb-1"
                      >×</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-5 min-h-[180px]">
            {!connected ? (
              renderNotConnectedState()
            ) : txsToShow.length === 0 ? (
              renderEmptyState()
            ) : (
              txsToShow.map(tx => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full min-h-[100px] flex items-center gap-6 bg-[#232628]/80 backdrop-blur-md rounded-2xl px-5 py-6 shadow transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <Image
                    src={tx.logo}
                    alt={tx.token}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-[#232628]"
                  />
                  <div className="flex-1 flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-white">
                        {tx.amount} {tx.token}
                      </span>
                      {tx.type === "Sent" ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-[#96a954]" />
                      )}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          tx.type === "Sent"
                            ? "bg-red-900 text-red-400"
                            : "bg-green-900 text-[#96a954]"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <div className="flex items-center text-xs font-mono gap-2 text-gray-400">
                      {tx.type === "Sent" ? (
                        <>
                          <span className="font-normal">To</span>
                          <span className="text-white">{tx.to}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-normal">From</span>
                          <span className="text-white">{tx.from}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between min-h-[64px]">
                    <div className="flex items-center gap-2 mb-2">
                      {tx.status === "Success" && (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[#96a954]" />
                          <span className="text-[#96a954] text-xs font-bold">Success</span>
                        </>
                      )}
                      {tx.status === "Pending" && (
                        <>
                          <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
                          <span className="text-yellow-400 text-xs font-bold">Pending</span>
                        </>
                      )}
                      {tx.status === "Failed" && (
                        <>
                          <XCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 text-xs font-bold">Failed</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{tx.date}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Compact: Show "View all transactions" link */}
          {compact && (
            <div className="flex justify-center py-4">
              <Link href="/transactions" className="text-[#96a954] font-bold underline hover:no-underline text-center text-base transition">
                View all transactions
              </Link>
            </div>
          )}

          {/* Pagination for full view */}
          {!compact && connected && filtered.length > 0 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <button
                className="px-4 py-2 bg-[#1e2127] text-[#96a954] rounded-full font-semibold disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-white text-base px-2">{page} / {pageCount || 1}</span>
              <button
                className="px-4 py-2 bg-[#1e2127] text-[#96a954] rounded-full font-semibold disabled:opacity-50"
                disabled={page === pageCount || pageCount === 0}
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      {selectedTx && (
        <TransactionDetails
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
