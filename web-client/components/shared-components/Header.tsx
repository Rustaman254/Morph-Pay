"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Send,
    Download,
    LogOut,
    WalletMinimal,
    Copy,
} from "lucide-react";
import Logo from "@/public/logoipsum-custom-logo.svg";
import { connect, disconnect } from "starknetkit";

const DEFAULT_PROFILE =
    "https://ui-avatars.com/api/?name=User&background=96a954&color=232628&size=128";

interface WalletInfoModalProps {
    walletAddress: string;
    onClose: () => void;
    onCopy: () => void;
    copied: boolean;
    userProfileImage: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDisconnect: () => void;
}

function WalletInfoModal({
    walletAddress,
    onClose,
    onCopy,
    copied,
    userProfileImage,
    onImageChange,
    onDisconnect,
}: WalletInfoModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60">
            <div className="bg-[#232628] rounded-lg p-8 min-w-[320px] flex flex-col items-center relative shadow-lg">
                <button
                    className="absolute top-3 right-3 text-[#96a954] hover:text-white text-xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &#10005;
                </button>
                <img
                    src={userProfileImage || DEFAULT_PROFILE}
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
                <button
                    className="mt-3 bg-[#96a954] text-[#232628] px-4 py-2 rounded-full font-semibold hover:bg-[#96a954]/90 transition-colors mb-2"
                    onClick={onDisconnect}
                >
                    <LogOut className="w-4 h-4 inline-block mr-1" /> Logout
                </button>
                <span className="text-xs text-[#96a954] text-center w-full">
                    Connected to Starknet
                </span>
            </div>
        </div>
    );
}

export default function Header() {
    const [connected, setConnected] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [showWalletInfo, setShowWalletInfo] = useState(false);
    const [copied, setCopied] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Send", icon: Send },
        // { href: "/send", label: "Swap", icon: LayoutDashboard },
        // { href: "/receive", label: "Receive", icon: Download },
        { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    ];

    useEffect(() => {
        const reconnect = async () => {
            setLoading(true);
            try {
                const { wallet, connectorData } = await connect({
                    modalMode: "neverAsk",
                    webWalletUrl: "https://web.argent.xyz",
                });
                if (wallet && connectorData) {
                    setWallet(wallet);
                    setWalletAddress(connectorData.account || "");
                    setConnected(true);
                }
            } finally {
                setLoading(false);
            }
        };
        reconnect();
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const { wallet, connectorData } = await connect({
                modalMode: "alwaysAsk",
                webWalletUrl: "https://web.argent.xyz",
                modalTheme: "system",
            });
            if (wallet && connectorData) {
                setWallet(wallet);
                setWalletAddress(connectorData.account || "");
                setConnected(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        await disconnect({ clearLastWallet: true });
        setConnected(false);
        setWallet(null);
        setWalletAddress("");
        setShowWalletInfo(false);
    };

    const handleCopy = async () => {
        if (walletAddress) {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handleCloseWalletInfo = () => {
        setShowWalletInfo(false);
        setCopied(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setProfileImage(url);
        }
    };

    return (
        <>
            <header className="w-full h-16 bg-[#14161b] flex items-center px-3 sm:px-8">
                <div className="w-full relative flex items-center h-full">
                    <div className="flex items-center gap-2 z-10 min-w-[2rem]">
                        <img
                            src={Logo.src}
                            alt="Morph Pay Logo"
                            className="w-24 h-24 sm:w-40 sm:h-40 object-fit"
                            draggable={false}
                        />
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
                                onClick={handleConnect}
                                className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors hover:bg-[#96a954]/90"
                                disabled={loading}
                            >
                                <WalletMinimal className="w-4 h-4" stroke="#14161b" />
                                {loading ? "Connecting..." : "Sign up / Login with Email"}
                            </button>
                        ) : (
                            // Wallet display has different behaviors on mobile vs desktop
                            <div>
                                <div
                                    className={`bg-[#1e2127] rounded-full px-4 py-2 shadow flex items-center gap-4 ${
                                        // Desktop: show wallet info button and logout
                                        "sm:flex"
                                    }`}
                                >
                                    <div
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => setShowWalletInfo(true)}
                                    >
                                        <span className="w-7 h-7 bg-[#96a954] flex items-center justify-center rounded-full">
                                            <WalletMinimal className="w-4 h-4" stroke="#14161b" />
                                        </span>
                                        <span className="text-white text-sm font-mono">
                                            {walletAddress ? walletAddress.slice(0, 8) + "..." : ""}
                                        </span>
                                    </div>
                                    {/* Desktop only: show wallet info and logout */}
                                    <button
                                        onClick={() => setShowWalletInfo(true)}
                                        className="bg-[#232628] text-[#96a954] px-3 py-1 rounded-full text-xs ml-2 hidden sm:inline"
                                    >
                                        Show wallet info
                                    </button>
                                    <button
                                        onClick={handleDisconnect}
                                        className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#96a954]/90 transition hidden sm:flex"
                                    >
                                        Logout
                                        <LogOut className="w-4 h-4 ml-1" stroke="#14161b" />
                                    </button>
                                </div>
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
                    userProfileImage={profileImage}
                    onImageChange={handleImageChange}
                    onDisconnect={handleDisconnect}
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
