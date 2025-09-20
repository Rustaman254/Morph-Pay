"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    WalletMinimal,
    LogOut,
    LayoutDashboard,
    ArrowLeftRight,
    Send,
    Download,
    Copy,
} from "lucide-react";

import Logo from "@/public/logoipsum-custom-logo.svg";

// Default profile image if user hasn't uploaded one
const DEFAULT_PROFILE =
    "https://ui-avatars.com/api/?name=User&background=96a954&color=232628&size=128";

// Modal component with image upload
interface WalletInfoModalProps {
    walletAddress: string;
    onClose: () => void;
    onCopy: () => void;
    copied: boolean;
    profileImage: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function WalletInfoModal({
    walletAddress,
    onClose,
    onCopy,
    copied,
    profileImage,
    onImageChange,
}: WalletInfoModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60">
            <div className="bg-[#232628] rounded-lg p-8 min-w-[320px] flex flex-col items-center relative shadow-lg">
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-[#96a954] hover:text-white text-xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &#10005;
                </button>
                {/* Profile Picture */}
                <img
                    src={profileImage || DEFAULT_PROFILE}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mb-4 object-cover"
                />
                <label className="text-[#96a954] mb-4 cursor-pointer">
                    <span className="underline">Change Image</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onImageChange}
                    />
                </label>
                {/* Wallet Address */}
                <div className="flex flex-col items-center mb-3 w-full">
                    <span className="text-white font-mono break-all text-sm mb-2">{walletAddress}</span>
                    <button
                        onClick={onCopy}
                        className="flex items-center px-3 py-2 bg-[#96a954] rounded-full text-[#232628] font-semibold hover:bg-[#96a954]/90 transition-colors"
                    >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Address
                        {copied && (
                            <span className="ml-2 text-green-400 text-xs">Copied!</span>
                        )}
                    </button>
                </div>
                <span className="text-xs text-[#96a954] text-center w-full">Wallet Info: Add more details here.</span>
            </div>
        </div>
    );
}

export default function Header() {
    const [connected, setConnected] = useState(false);
    const [showWalletInfo, setShowWalletInfo] = useState(false);
    const [copied, setCopied] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const walletAddress = "0x12fc59A84d2F4e058C44B3FAdB76328CEc89F89F7";
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Buy/Sell Crypto", icon: LayoutDashboard },
        { href: "/send", label: "Send", icon: Send },
        { href: "/receive", label: "Receive", icon: Download },
        { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    ];

    // Copy handler
    const handleCopy = async () => {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    // Modal close handler
    const handleCloseWalletInfo = () => {
        setShowWalletInfo(false);
        setCopied(false);
    };

    // Profile image handler
    const handleImageChange = (e: { target: { files: any[]; }; }) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setProfileImage(url);
        }
    };

    return (
        <>
            <header className="w-full h-16 bg-[#14161b] flex items-center px-8">
                <div className="w-full relative flex items-center h-full">
                    <div className="flex items-center gap-2 z-10 min-w-[2rem]">
                        <img
                            src={Logo.src}
                            alt="Morph Pay Logo"
                            className="w-40 h-40 object-fit"
                            /* object-contain keeps SVGs from being cropped */
                            draggable={false}
                        />
                        {/* <span className="font-bold text-base text-[#96a954]">Morph Pay</span> */}
                    </div>
                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                        <ul className="flex gap-3 list-none m-0">
                            {navLinks.map(({ href, label }) => {
                                const isActive = pathname === href;
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className={`text-white font-medium text-sm px-3 py-2 transition-colors duration-200
                        ${isActive ? "bg-[#232628] !text-[#96a954] rounded-full font-semibold" : "rounded-full"}
                        hover:bg-[#232628]`}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                        {!connected ? (
                            <button
                                onClick={() => setConnected(true)}
                                className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors hover:bg-[#96a954]/90"
                            >
                                <WalletMinimal className="w-4 h-4" stroke="#14161b" />
                                Connect
                            </button>
                        ) : (
                            <div className="bg-[#1e2127] rounded-full px-4 py-2 flex items-center gap-4 shadow">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 bg-[#96a954] flex items-center justify-center rounded-full">
                                        <WalletMinimal className="w-4 h-4" stroke="#14161b" />
                                    </span>
                                    <span className="text-white text-sm font-mono">{walletAddress.slice(0, 8) + "..."}</span>
                                </div>
                                <button
                                    onClick={() => setShowWalletInfo(true)}
                                    className="bg-[#232628] text-[#96a954] px-3 py-1 rounded-full text-xs ml-2"
                                >
                                    Show wallet info
                                </button>
                                <button
                                    onClick={() => setConnected(false)}
                                    className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#96a954]/90 transition"
                                >
                                    Logout
                                    <LogOut className="w-4 h-4 ml-1" stroke="#14161b" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {showWalletInfo && (
                <WalletInfoModal
                    walletAddress={walletAddress}
                    onClose={handleCloseWalletInfo}
                    onCopy={handleCopy}
                    copied={copied}
                    profileImage={profileImage}
                    onImageChange={handleImageChange}
                />
            )}

            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex bg-[#20232b] bg-opacity-95 rounded-full items-center py-2 px-4 shadow-lg border border-[#232628] sm:hidden">
                {navLinks.map(({ href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            href={href}
                            key={href}
                            className={`
                flex items-center justify-center 
                px-3 py-2 mx-1 rounded-full
                transition-colors duration-200
                text-white
                ${isActive ? "bg-[#96a954] !text-[#232628]" : "bg-transparent"}
              `}
                        >
                            <Icon className="w-6 h-6" />
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
