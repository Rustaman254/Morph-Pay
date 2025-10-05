"use client";

import { useState, useEffect } from "react";
import {
    Copy,
    RefreshCcw,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Wallet as WalletIcon,
    CircleDollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WalletPage() {
    // Replace with your real data fetching here
    const [wallet, setWallet] = useState({
        address: "0xB31e1A391Bc237fEcb9bC19678F4621584377d91",
        balance: 4235.78,
        currency: "USD",
        totalIn: 11320.00,
        totalOut: 7084.10,
        pending: 150.00
    });

    const truncatedAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(wallet.address);
        toast.success("Wallet address copied!");
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center mb-8">
                <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                    <WalletIcon size={28} />
                </div>
                <div>
                    <div className="text-xl font-semibold mb-1">Wallet</div>
                    <div className="text-gray-400 text-sm">All your balances and transactions in one place</div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-7 mb-8">
                {/* Main Wallet Card */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3 col-span-2">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-600 font-medium">Main Wallet</div>
                        <span className="flex items-center font-mono text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-700 border gap-2">
                            {truncatedAddress}
                            <button
                                className="ml-1 hover:text-orange-600 focus:outline-none"
                                title="Copy wallet address"
                                onClick={handleCopy}
                            >
                                <Copy size={14} />
                            </button>
                        </span>
                    </div>
                    <div className="my-4">
                        <div className="text-gray-400 text-xs">Available balance</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-3xl font-bold text-gray-900">${wallet.balance.toLocaleString()} </span>
                            <span className="uppercase font-semibold text-md text-gray-400">{wallet.currency}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <Button className="rounded-full gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 font-semibold">
                            <ArrowDownLeft size={16} /> Receive
                        </Button>
                        <Button variant="outline" className="rounded-full gap-2 px-6 py-2 font-semibold">
                            <ArrowUpRight size={16} /> Send
                        </Button>
                        <Button variant="ghost" className="rounded-full gap-2 px-6 py-2 font-semibold text-orange-600">
                            <ArrowRightLeft size={16} /> Swap
                        </Button>
                        <Button variant="ghost" className="rounded-full gap-2 px-6 py-2 font-semibold text-gray-500 border">
                            <RefreshCcw size={16} /> Refresh
                        </Button>
                    </div>
                </div>
                {/* Wallet breakdown and stats */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
                    <div className="text-gray-500 font-semibold mb-2 flex items-center gap-2">
                        <CircleDollarSign size={18} className="text-orange-600" /> Wallet summary
                    </div>
                    <div className="flex justify-between border-b pb-2 mb-2">
                        <span className="text-xs text-gray-400">Total In</span>
                        <span className="font-bold text-green-600">${wallet.totalIn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 mb-2">
                        <span className="text-xs text-gray-400">Total Out</span>
                        <span className="font-bold text-red-500">${wallet.totalOut.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Pending</span>
                        <span className="font-bold text-orange-600">${wallet.pending.toLocaleString()}</span>
                    </div>
                </div>
                {/* Wallet actions and info */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-5 items-center justify-center text-center">
                    <div className="text-lg font-semibold text-gray-800 mb-1">Deposit new funds</div>
                    <div className="text-sm text-gray-500 mb-3">
                        Send more assets or fiat to your wallet address to increase your available balance.
                    </div>
                    <Button className="rounded-full bg-orange-600 px-8 py-2 mt-1 text-white">Deposit</Button>
                </div>
            </div>

            {/* Sample recent transactions area */}
            <div className="bg-white rounded-2xl shadow p-8 mt-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-semibold text-gray-800">Recent Transactions</div>
                    <Button variant="ghost" className="text-orange-600">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="py-2 px-3 font-medium">Type</th>
                                <th className="py-2 px-3 font-medium">Description</th>
                                <th className="py-2 px-3 font-medium">Amount</th>
                                <th className="py-2 px-3 font-medium">Date</th>
                                <th className="py-2 px-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Replace with dynamic transactions */}
                            <tr className="border-b hover:bg-orange-50 transition">
                                <td className="py-2 px-3 flex items-center gap-1 text-green-600 font-bold"><ArrowDownLeft size={14} /> Received</td>
                                <td className="py-2 px-3">From external account</td>
                                <td className="py-2 px-3 text-green-700 font-semibold">+$1,500.00</td>
                                <td className="py-2 px-3">Oct 2, 2025</td>
                                <td className="py-2 px-3 text-green-600">Completed</td>
                            </tr>
                            <tr className="border-b hover:bg-orange-50 transition">
                                <td className="py-2 px-3 flex items-center gap-1 text-red-600 font-bold"><ArrowUpRight size={14} /> Sent</td>
                                <td className="py-2 px-3">To peer: 0x123...def</td>
                                <td className="py-2 px-3 text-red-700 font-semibold">-$250.00</td>
                                <td className="py-2 px-3">Sep 30, 2025</td>
                                <td className="py-2 px-3 text-gray-600">Pending</td>
                            </tr>
                            <tr className="border-b hover:bg-orange-50 transition">
                                <td className="py-2 px-3 flex items-center gap-1 text-orange-600 font-bold"><ArrowRightLeft size={14} /> Swap</td>
                                <td className="py-2 px-3">Swapped ETH to USD</td>
                                <td className="py-2 px-3 text-orange-700 font-semibold">-$50.51</td>
                                <td className="py-2 px-3">Sep 29, 2025</td>
                                <td className="py-2 px-3 text-green-600">Completed</td>
                            </tr>
                            {/* ...add more rows as needed */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
