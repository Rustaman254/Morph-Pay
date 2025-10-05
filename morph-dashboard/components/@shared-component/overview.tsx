"use client";

import { useState } from "react";
import { ArrowRight, Calendar, PieChart, CreditCard, ArrowUpRight, Lock, BarChart, Search, User, MessageCircle, Info, Star, X, Sun, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Overview() {
    return (
        <div className="min-h-screen font-inter flex flex-col items-center py-8 px-2">
            {/* Header */}

            {/* Responsive Grid Layout */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-3">
                {/* Card - Main Account */}
                <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">VISA</span>
                        <CreditCard size={18} className="text-gray-500" />
                        <button className="bg-gray-100 text-gray-500 text-xs py-1 px-3 rounded-full font-medium">Direct Debits</button>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-0.5">Linked to main account</div>
                        <div className="font-bold tracking-wider text-lg">**** 2719</div>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" className="rounded-full px-4 py-1 flex-1 text-xs">Receive</Button>
                            <Button variant="secondary" className="rounded-full px-4 py-1 flex-1 text-xs">Send</Button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-400">Monthly regular fee</div>
                        <div className="text-red-400 font-medium"> $25.00</div>
                    </div>
                    <div className="flex justify-end">
                        <button className="text-xs text-orange-600">Edit cards limitation</button>
                    </div>
                </div>

                {/* Card - Total income */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-3">
                    <div className="text-sm text-gray-400">Total income</div>
                    <div className="text-2xl font-bold text-gray-900">$23,194.80</div>
                    <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-orange-600 font-semibold">Weekly</span>
                        <span className="text-gray-500 font-semibold">System Lock</span>
                    </div>
                </div>

                {/* Card - Total paid */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2">
                    <div className="text-sm text-gray-400">Total paid</div>
                    <div className="text-2xl font-bold text-gray-900">$8,145.20</div>
                    <Button variant="ghost" className="w-max text-orange-600 mt-2">View on chart mode</Button>
                </div>

                {/* Card - 36% Growth */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-1 items-center justify-center">
                    <BarChart size={28} className="mb-2 text-orange-600" />
                    <div className="font-bold text-3xl text-orange-600">36%</div>
                    <div className="text-gray-500 text-sm">Growth</div>
                </div>

                {/* Card - System lock */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2 items-center">
                    <Lock size={21} className="mb-1 text-gray-500" />
                    <div className="font-semibold text-base text-gray-900">System Lock</div>
                </div>

                {/* Card - Days Remaining */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-3 items-center">
                    <span className="font-bold text-2xl text-orange-600">13 Days</span>
                    <span className="text-xs text-gray-500">109 hours, 23 minutes</span>
                    <div className="flex gap-1">
                        {[...Array(13)].map((_, i) => (
                            <div key={i} className="rounded-full w-2 h-2 bg-orange-600" />
                        ))}
                    </div>
                </div>

                {/* Card - Year Bar */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2">
                    <div className="flex items-end justify-between">
                        <span className="text-xs text-gray-400">2022</span>
                        <div className="rounded-full w-12 h-2 bg-orange-200" />
                        <span className="font-semibold text-sm text-orange-600">2023</span>
                    </div>
                </div>

                {/* Card - Annual Profits */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 h-full w-full flex items-center justify-center pointer-events-none">
                        {/* Render stylized profit circles */}
                        <svg width="120" height="120">
                            <circle cx="60" cy="110" r="40" fill="#FAE3D4" />
                            <circle cx="60" cy="110" r="28" fill="#F5C1A3" />
                            <circle cx="60" cy="110" r="20" fill="#E87337" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm text-gray-500">Annual profits</div>
                        <div className="font-bold text-2xl text-orange-700 mt-1">$14K</div>
                        <div className="flex gap-2 flex-col py-2">
                            <span className="text-xs">$9.3K</span>
                            <span className="text-xs">$6.8K</span>
                            <span className="text-xs">$4K</span>
                        </div>
                    </div>
                    <select className="absolute top-3 right-3 bg-transparent border-none text-xs text-gray-400 focus:outline-none">
                        <option>2022</option>
                        <option>2023</option>
                    </select>
                </div>

                {/* Card - Activity Manager */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Activity manager</span>
                        <Button variant="ghost" className="px-3 py-1">Filters</Button>
                    </div>
                    <Input type="text" placeholder="Search in activities..." className="rounded-full py-2 px-4 text-xs" />
                    <div className="text-3xl font-bold text-orange-600">$43.20 <span className="text-sm text-gray-400">USD</span></div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="rounded-full">Team</Button>
                        <Button variant="ghost" className="rounded-full">Insights</Button>
                        <Button variant="ghost" className="rounded-full">Today</Button>
                    </div>
                </div>

                {/* Card - Wallet Verification */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-3 items-center">
                    <Sun className="mb-1 text-orange-600" />
                    <div className="font-semibold text-base">Wallet Verification</div>
                    <div className="text-xs text-gray-500 text-center mb-1">
                        Enable 2-step verification to secure your wallet.
                    </div>
                    <Button className="rounded-full bg-orange-600 text-white px-5 py-2">Enable</Button>
                </div>

                {/* Card - Review/Rating */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Review rating</span>
                        <button className="text-gray-300 rounded-full border border-gray-100"><X size={16} /></button>
                    </div>
                    <div className="font-semibold text-base">How is your business management going?</div>
                    <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="text-orange-400" />
                        ))}
                    </div>
                </div>

                {/* Card - Main Stocks & Chart */}
                <div className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Main Stocks</span>
                        <span className="text-xs text-orange-600">Extended &amp; Limited</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$16,073.49</div>
                    <div className="flex gap-1 items-center">
                        <ArrowUpRight size={15} className="text-orange-500" />
                        <span className="text-orange-500 text-xs">+9.3%</span>
                    </div>
                    {/* <ChartComponent /> */}
                </div>
            </div>
        </div>
    );
}
