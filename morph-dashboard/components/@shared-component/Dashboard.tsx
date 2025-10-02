"use client"

import { useState } from "react";
import { User, Search, Sun } from "lucide-react";
import Header from "./Header";

export default function Dashboard() {
    return (
        <div className="w-screen py-10 px-20">
            {/* Header */}
            <Header mode="menu" active={"overview"}/>

            {/* Greeting and Assistant */}
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-bold">Hey, Need help?<span className="ml-1">👋</span></h1>
                <Sun size={26} className="text-gray-400" />
            </div>
            <div className="text-gray-400 text-lg mb-8">Just ask me anything!</div>

            {/* Main Cards and Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Cards code stays the same */}
            </div>

            {/* Analytics, Charts, Tasks Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Cards code stays the same */}
            </div>
        </div>
    );
}



