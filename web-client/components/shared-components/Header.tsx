"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Send,
    WalletMinimal,
} from "lucide-react";
import Logo from "@/public/logoipsum-custom-logo.svg";
import LoginSignupModal from "./LoginModal";
import HeaderProfile from "./HeaderProfile"; 

type UserData = { fname: string; lname: string; address: string; };

export default function Header(): React.ReactElement {
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);
    const [modalMode, setModalMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    const pathname = usePathname();
    const navLinks = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/send", label: "Send", icon: Send },
        { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    ];

    // On mount and whenever the modal closes, check for login state
    useEffect(() => {
        const userData = localStorage.getItem("morphpay_user");
        const jwt = localStorage.getItem("morphpay_jwt");
        if (userData && jwt) {
            try {
                const parsed = JSON.parse(userData);
                // Defensive check for keys
                setUser({
                    fname: parsed.fname || "",
                    lname: parsed.lname || "",
                    address: parsed.address || "",
                });
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [isShowLoginModal]);

    // Closes modal & updates user after login
    const handleModalClose = () => {
        const userData = localStorage.getItem("morphpay_user");
        const jwt = localStorage.getItem("morphpay_jwt");
        if (userData && jwt) {
            try {
                const parsed = JSON.parse(userData);
                setUser({
                    fname: parsed.fname || "",
                    lname: parsed.lname || "",
                    address: parsed.address || "",
                });
            } catch {
                setUser(null);
            }
        }
        setIsShowLoginModal(false);
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("morphpay_jwt");
        localStorage.removeItem("morphpay_user");
        setUser(null);
    };

    return (
        <>
            <header className="w-full h-16 bg-[#14161b] flex items-center px-3 sm:px-8">
                <div className="w-full relative flex items-center h-full">
                    <div className="flex items-center gap-2 z-10 min-w-[2rem]">
                        <img src={Logo.src} alt="Morph Pay Logo" className="w-24 h-24 sm:w-40 sm:h-40 object-fit" draggable={false} />
                    </div>
                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                        <ul className="flex gap-3 list-none m-0">
                            {navLinks.map(({ href, label }) => {
                                const isActive = pathname === href;
                                return (
                                    <li key={href}>
                                        <Link href={href}
                                            className={`text-white font-medium text-sm px-3 py-2 transition-colors duration-200
                                            ${isActive ? "bg-[#232628] !text-[#96a954] rounded-full font-semibold" : "rounded-full"}
                                            hover:bg-[#232628]`}>{label}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                        {user ? (
                            <HeaderProfile user={user} onLogout={handleLogout} />
                        ) : (
                            <button
                                onClick={() => {
                                    setIsShowLoginModal(true);
                                    setModalMode("login");
                                }}
                                className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors hover:bg-[#96a954]/90"
                                disabled={loading}>
                                <WalletMinimal className="w-4 h-4" stroke="#14161b" />
                                Sign up / Login
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {isShowLoginModal && (
                <LoginSignupModal
                    mode={modalMode}
                    setMode={setModalMode}
                    onClose={handleModalClose}
                    loading={loading}
                />
            )}

            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex bg-[#20232b] bg-opacity-95 rounded-full items-center py-2 px-4 shadow-lg border border-[#232628] sm:hidden">
                {navLinks.map(({ href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link href={href} key={href}
                            className={`
                                flex items-center justify-center 
                                px-3 py-2 mx-1 rounded-full
                                transition-colors duration-200
                                text-white
                                ${isActive ? "bg-[#96a954] !text-[#232628]" : "bg-transparent"}
                            `}><Icon className="w-6 h-6" /></Link>
                    );
                })}
            </nav>
        </>
    );
}
