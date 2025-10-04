"use client"

import React, { useEffect, useState } from "react";
import DashboardOne from "@/components/layouts/dashboard-one";
import { ArrowDownLeft, ArrowUpRight, Headset, Banknote } from "lucide-react";
import { ethers } from "ethers";

const USER_CURRENCY = {
  code: "KES",
  rate: 160,
  label: "Ksh"
};

const TOKEN_ADDRESS = "0xEdfb4f72a38555f211913efa371a7297A4D5d137"; 
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function Home() {
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Safely parse user object and extract address from localStorage
    const userStr = typeof window !== "undefined" ? localStorage.getItem("morphpay_user") : null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setWalletAddress(userObj.address);
      } catch {
        setWalletAddress(null);
        setError("Invalid user data in localStorage.");
      }
    } else {
      setWalletAddress(null);
      setError("No user found in localStorage.");
    }
  }, []);

  useEffect(() => {
    // only fetch balance if address is available
    async function fetchBalance() {
      if (!walletAddress) return;
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io");
        const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
        const rawBalance = await token.balanceOf(walletAddress);
        const decimals = await token.decimals();
        const humanBalance = Number(ethers.formatUnits(rawBalance, decimals));
        setUserBalance(humanBalance);
      } catch (err: any) {
        setError("Could not fetch blockchain balance.");
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [walletAddress]);

  const localValue = userBalance !== null ? userBalance * USER_CURRENCY.rate : null;

  return (
    <DashboardOne>
      <div className="w-full flex flex-col items-center justify-center py-6">
        <span className="text-lg font-semibold text-gray-400 text-center mb-1">
          Available Balance
        </span>
        {loading ? (
          <span className="text-4xl font-extrabold text-white text-center">
            Loading...
          </span>
        ) : error ? (
          <span className="text-4xl font-extrabold text-red-400 text-center">{error}</span>
        ) : (
          <>
            <span className="text-4xl font-extrabold text-white text-center">
              {userBalance?.toLocaleString(undefined, { maximumFractionDigits: 6 })} tUSD
            </span>
            <span className="text-sm mt-4 font-semibold text-[#96a954] text-center mb-8">
              = {USER_CURRENCY.label}{" "}
              {localValue?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </>
        )}

        <div className="flex items-center justify-center gap-14">
          <a href="/send" className="flex flex-col items-center group hover:text-[#96a954] transition">
            <Banknote className="w-10 h-10 text-[#96a954] mb-2 group-hover:scale-110 transition" />
            <span className="text-base text-white font-semibold group-hover:text-[#96a954]">
              Buy/sell
            </span>
          </a>
          <a href="/send" className="flex flex-col items-center group hover:text-[#96a954] transition">
            <ArrowUpRight className="w-10 h-10 text-[#96a954] mb-2 group-hover:scale-110 transition" />
            <span className="text-base text-white font-semibold group-hover:text-[#96a954]">
              Send
            </span>
          </a>
          <a href="/deposit" className="flex flex-col items-center group hover:text-[#96a954] transition">
            <ArrowDownLeft className="w-10 h-10 text-[#96a954] mb-2 group-hover:scale-110 transition" />
            <span className="text-base text-white font-semibold group-hover:text-[#96a954]">
              Deposit
            </span>
          </a>
          <div className="flex flex-col items-center opacity-70">
            <Headset className="w-10 h-10 text-[#96a954] mb-2" />
            <span className="text-base text-white font-semibold">Support</span>
          </div>
        </div>
      </div>
    </DashboardOne>
  );
}
