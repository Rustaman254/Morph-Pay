"use client";
import React, { useRef, useState, useEffect } from "react";
import DashboardOne from "@/components/layouts/dashboard-one";
import {
  ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Clock, MoreHorizontal,
} from "lucide-react";
import classNames from "classnames";
import Image from "next/image";
import { ethers } from "ethers";

const CURRENCY_OPTS = [
  { code: "USD", label: "USD" },
  { code: "KES", label: "KES" },
  { code: "NGN", label: "NGN" },
  { code: "TZS", label: "TZS" }
];

const TOKEN_LOGOS = { tUSD: "/logos/tusd.svg" };
const TUSD_ADDRESS = "0x3Cd3B6047417a6930B993Ea508037810436C4ae0";
const SCROLL_SEPOLIA_RPC = "https://scroll-sepolia.drpc.org";
const activities = [
  { id: "a1", type: "Deposit", from: "0x1234...C89F", to: TUSD_ADDRESS, token: "USDT", amount: 100, date: "2025-10-03 09:33", status: "Success", logo: "/tether-usdt-logo.png", network: "Ethereum" },
  { id: "a2", type: "Sent", from: TUSD_ADDRESS, to: "0xMerchant...C119", token: "USDT", amount: 25.5, date: "2025-10-02 17:11", status: "Success", logo: "/tether-usdt-logo.png", network: "Starknet" },
  { id: "a3", type: "Swap", from: TUSD_ADDRESS, to: "0xDex...D234", token: "USDC", amount: 14.3, date: "2025-10-01 18:03", status: "Pending", logo: "/usdc-logo.png", network: "Polygon" },
  { id: "a4", type: "Received", from: "0xFriend...0099", to: TUSD_ADDRESS, token: "tUSD", amount: 75.05, date: "2025-09-29 22:44", status: "Failed", logo: "/tusd.svg", network: "Ethereum" }
];
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

function truncateAddress(address: string, size = 6) {
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

function useScreen() {
  const [width, setWidth] = React.useState<number | null>(null);
  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function BalanceCards({ balances, wallet }: {
  balances: { symbol: string; address: string; balance: number; decimals: number }[];
  wallet: string;
}) {
  const width = useScreen();
  const isMobile = width !== null ? width < 768 : false;
  const [currentIndex, setCurrentIndex] = useState(0);
  const PAGE_SIZE = isMobile ? 1 : 3;
  const totalPages = Math.ceil(balances.length / PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) setCurrentIndex(0);
  }, [isMobile]);
  useEffect(() => {
    if (scrollRef.current && isMobile) {
      scrollRef.current.scrollTo({
        left: currentIndex * 225,
        behavior: "smooth"
      });
    }
  }, [currentIndex, isMobile]);

  return (
    <div className="w-full flex flex-col items-center relative mb-10">
      <div className="w-full max-w-[420px] mx-auto flex items-center justify-center overflow-hidden"
        style={{ minHeight: isMobile ? "145px" : "185px", position: "relative" }}>
        <div
          ref={scrollRef}
          className={classNames(
            "flex transition-transform duration-300 ease-in-out gap-4",
            isMobile && "overflow-x-auto snap-x no-scrollbar"
          )}
          style={{
            width: "100%",
            scrollSnapType: isMobile ? "x mandatory" : undefined,
          }}
        >
          {balances.map((token, idx) => (
            <div
              key={token.symbol}
              className={classNames(
                "relative flex flex-col justify-between rounded-xl px-5 py-4 bg-[#23331f] shadow-lg",
                isMobile ? "snap-center shrink-0 mx-0" : "mx-0"
              )}
              style={{
                width: isMobile ? 205 : 270,
                minWidth: isMobile ? 205 : 270,
                maxWidth: isMobile ? 205 : 270,
                height: isMobile ? 135 : 155,
                marginRight: isMobile && idx < balances.length - 1 ? 16 : 0,
              }}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center">
                  {TOKEN_LOGOS[token.symbol] ? (
                    <img src={TOKEN_LOGOS[token.symbol]} alt={token.symbol} className="w-7 h-7 object-contain" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#a1a584] flex items-center justify-center text-[#24331f] text-base font-bold">{token.symbol}</div>
                  )}
                </div>
                <button className="p-1.5 rounded-md hover:bg-[#25371f] active:bg-[#152510] transition">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <span className="text-lg text-white font-bold mb-0.5 break-all">
                {token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {token.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>
      {balances.length > PAGE_SIZE && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button key={idx}
              className={classNames("w-2.5 h-2.5 rounded-full mx-1 focus:outline-none", idx === currentIndex ? "bg-[#96a954]" : "bg-gray-500 opacity-60")}
              style={{ transition: "background 0.2s" }}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ act }: { act: typeof activities[number] }) {
  const arrow = act.type === "Sent"
    ? <ArrowUpRight className="w-5 h-5 text-red-400" />
    : <ArrowDownLeft className="w-5 h-5 text-[#96a954]" />;
  const statusEl = act.status === "Success"
    ? (<><CheckCircle2 className="w-5 h-5 text-[#96a954]" /><span className="text-[#96a954] text-xs font-bold">Success</span></>)
    : act.status === "Pending"
      ? (<><Clock className="w-5 h-5 text-yellow-400 animate-pulse" /><span className="text-yellow-400 text-xs font-bold">Pending</span></>)
      : (<><XCircle className="w-5 h-5 text-red-400" /><span className="text-red-400 text-xs font-bold">Failed</span></>);
  const typeStyles = act.type === "Sent"
    ? "bg-red-900 text-red-400"
    : "bg-green-900 text-[#96a954]";
  return (
    <div className="w-full flex items-center gap-6 bg-[#232628]/80 backdrop-blur-md rounded-2xl px-5 py-6 shadow transition-transform hover:scale-[1.01] mb-4 cursor-pointer mx-auto max-w-[420px]">
      <Image src={act.logo} alt={act.token} width={48} height={48} className="rounded-full border-2 border-[#232628]" />
      <div className="flex-1 flex flex-col gap-1 text-left">
        <div className="flex items-center gap-3">
          <span className={classNames("font-bold text-lg text-white")}>
            {act.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {act.token}
          </span>
          {arrow}
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${typeStyles}`}>{act.type}</span>
        </div>
        <div className="flex items-center text-xs font-mono gap-2 text-gray-400">
          {act.type === "Sent" || act.type === "Swap"
            ? (<><span className="font-normal">To</span><span className="text-white">{act.to}</span></>)
            : (<><span className="font-normal">From</span><span className="text-white">{act.from}</span></>)
          }
          <span className="ml-2 hidden md:inline text-gray-600">on {act.network}</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between min-h-[64px]">
        <div className="flex items-center gap-2 mb-2">{statusEl}</div>
        <span className="text-xs text-gray-400">{act.date}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [balances, setBalances] = useState([
    { symbol: "tUSD", address: TUSD_ADDRESS, balance: 0, decimals: 18 }
  ]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currency, setCurrency] = useState(CURRENCY_OPTS[0]);
  const [rate, setRate] = useState<number>(1);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("morphpay_user") : null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setWalletAddress(userObj.address);
      } catch {
        setWalletAddress(null);
        setError("Invalid user data in localStorage.");
        setLoading(false);
      }
    } else {
      setWalletAddress(null);
      setError("No user found in localStorage.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!walletAddress) return;
    async function getTUSDBalance() {
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.JsonRpcProvider(SCROLL_SEPOLIA_RPC);
        const contract = new ethers.Contract(TUSD_ADDRESS, ERC20_ABI, provider);
        const rawBalance = await contract.balanceOf(walletAddress);
        const decimals: number = await contract.decimals();
        const formattedBalance = Number(ethers.formatUnits(rawBalance, decimals));
        setBalances([{ symbol: "tUSD", address: TUSD_ADDRESS, balance: formattedBalance, decimals }]);
      } catch (err) {
        setBalances([{ symbol: "tUSD", address: TUSD_ADDRESS, balance: 0, decimals: 18 }]);
        setError("Could not fetch blockchain balance.");
      } finally {
        setLoading(false);
      }
    }
    getTUSDBalance();
  }, [walletAddress]);

  useEffect(() => {
    async function fetchRate() {
      try {
        const apiKey = "f26bcd69521b0118afe209fc543d099f";
        const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&base=USD&symbols=${currency.code}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(data)
        setRate(data.rates?.[currency.code] ?? 1);
      } catch {
        setRate(1);
      }
    }
    fetchRate();
  }, [currency]);

  const totalToken = balances.reduce((sum, t) => sum + t.balance, 0);
  const fiatValue = totalToken * rate;

  return (
    <DashboardOne>
      <div className="w-full flex flex-col items-center justify-center py-6 px-2 sm:px-4">
        <div className="w-full flex flex-col items-center justify-center mb-2">
          <div className="flex flex-row items-center justify-center w-full">
            <span className="text-lg font-semibold text-gray-400 text-center mr-2">
              Available Balance
            </span>
            <select
              className="bg-[#1e2127] border-none rounded-full px-4 py-1 text-white font-mono focus:ring-2 focus:ring-[#96a954] text-base"
              value={currency.code}
              onChange={e =>
                setCurrency(CURRENCY_OPTS.find(c => c.code === e.target.value)!)
              }
            >
              {CURRENCY_OPTS.map(c => (
                <option value={c.code} key={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-4xl font-bold text-white my-4">
            {fiatValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency.label}
          </span>
          <span className="text-base font-mono text-gray-400 mt-1 mb-1">
            1 USD = {rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency.label}
          </span>
        </div>
        {loading ? (
          <span className="text-3xl font-extrabold text-white text-center mb-6">
            Loading...
          </span>
        ) : error ? (
          <span className="text-3xl font-extrabold text-red-400 text-center mb-6">
            {error}
          </span>
        ) : (
          <BalanceCards balances={balances} wallet={walletAddress ?? ""} />
        )}
        <div className="w-full flex flex-col items-center mt-12 max-w-[420px] mx-auto">
          <div className="text-lg text-gray-400 mb-2 font-semibold text-center w-full">
            Recent Activity
          </div>
          {activities.map(activity => (
            <ActivityCard key={activity.id} act={activity} />
          ))}
        </div>
      </div>
    </DashboardOne>
  );
}
