"use client";

import { useState, useEffect } from "react";
import { Sun } from "lucide-react";
import Header from "@/components/@shared-component/Header";
import { useRouter } from "next/navigation";
import { ReactElement } from "react";
import axios from "axios";

export default function DashboardLayout({ children }: { children: ReactElement }) {
    const [user, setUser] = useState(null);
    const [isSignedIn, setIsSignedIn] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const token = localStorage.getItem("auth_token");
                const contact = localStorage.getItem("contact");
                if (!token || !contact) {
                    setIsSignedIn(false);
                    return;
                }
                const res = await axios.get(
                    `http://localhost:5500/api/v1/p2p/user/${encodeURIComponent(contact)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setUser(res.data);
            } catch (err) {
                setIsSignedIn(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!isSignedIn) {
            router.replace("/");
        }
    }, [isSignedIn, router]);

    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="w-full bg-[#f9f8f9]">
            <div className="w-full max-w-7xl mx-auto px-6 pt-10">
                <Header mode="menu" active="overview" />
                <div className=" py-15 ">
                    <div className="flex items-center justify-between mb-5">
                        <h1 className="text-3xl font-bold">
                            Hey, <span className="text-orange-600">{user?.fname} {user?.lname}</span>? Welcome Back<span className="ml-1">👋</span>
                        </h1>
                        {/* <Sun size={26} className="text-gray-400" /> */}
                    </div>
                    <div className="text-gray-400 text-lg mb-8">Just ask me anything!</div>
                </div>
            </div>
            {/* Full-width, edge-to-edge overview/page content here: */}
            <main className="w-full bg-white">
                <div className="w-full max-w-7xl mx-auto py-5 px-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
