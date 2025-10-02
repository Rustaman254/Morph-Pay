import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, LogOut, LayoutDashboard, Users, Layers, Exchange, UserSquare, ListChecks, Wallet, BarChart2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

const menuLinks = [
    { label: "Overview", key: "overview", href: "/overview", icon: <LayoutDashboard size={18} className="mr-2 text-orange-600" /> },
    // { label: "Liquidity Pools", key: "liquidity", href: "/liquidity", icon: <Layers size={18} className="mr-2 text-orange-600" /> },
    // { label: "Peer Exchange", key: "peer-exchange", href: "/peer-exchange", icon: <Exchange size={18} className="mr-2 text-orange-600" /> },
    { label: "Provider Account", key: "provider-account", href: "/provider-account", icon: <UserSquare size={18} className="mr-2 text-orange-600" /> },
    { label: "My Requests", key: "requests", href: "/requests", icon: <ListChecks size={18} className="mr-2 text-orange-600" /> },
    { label: "Wallet", key: "wallet", href: "/wallet", icon: <Wallet size={18} className="mr-2 text-orange-600" /> },
    { label: "Analytics", key: "analytics", href: "/analytics", icon: <BarChart2 size={18} className="mr-2 text-orange-600" /> },
    { label: "Reports", key: "reports", href: "/reports", icon: <FileText size={18} className="mr-2 text-orange-600" /> }
];

const exampleNotifications = [
    { id: 1, text: "Cash request received from Alice", time: "2 min ago", read: false },
    { id: 2, text: "Your liquidity pool deposit confirmed", time: "7 min ago", read: false },
    { id: 3, text: "Weekly liquidity report available", time: "1 hour ago", read: true }
];

const firstName = "Dwayne";
const lastName = "Tatum";
const walletAddress = "0xB31e1A391Bc237fEcb9bC19678F4621584377d91";
const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

export default function Header({ mode = "menu", active = "overview" }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const menuRef = useRef(null);
    const userRef = useRef(null);
    const notifRef = useRef(null);

    const unreadCount = exampleNotifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                openDropdown &&
                ((openDropdown === "menu" && menuRef.current && !menuRef.current.contains(event.target)) ||
                 (openDropdown === "user" && userRef.current && !userRef.current.contains(event.target)) ||
                 (openDropdown === "notifications" && notifRef.current && !notifRef.current.contains(event.target)))
            ) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.96, y: -8 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: -8 }
    };

    return (
        <div className="flex items-center justify-between mb-8 relative">
            {/* Left */}
            <div className="flex items-center">
                {mode === "menu" && (
                    <button
                        aria-label="Open menu"
                        className="mr-3 cursor-pointer flex items-center justify-center bg-white rounded-full w-14 h-14"
                        onClick={() => setOpenDropdown(openDropdown === "menu" ? null : "menu")}
                        ref={menuRef}
                    >
                        <img src="/icons/menu-alt-03-svgrepo-com.svg" alt="menu" className="w-7 h-7" />
                    </button>
                )}
                <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">N9</div>
                <div>
                    <div className="text-lg font-semibold">Financial</div>
                    <div className="text-gray-400 text-sm">Dashboard</div>
                </div>
            </div>
            {/* Center Navigation for "links" mode */}
            {mode === "links" && (
                <div className="flex-1 flex justify-center">
                    <nav className="flex gap-1">
                        {menuLinks.map(link => (
                            <a
                                key={link.key}
                                href={link.href}
                                className={active === link.key
                                    ? "px-4 py-2 rounded-full bg-orange-600 text-white text-xs font-semibold shadow transition-colors flex items-center"
                                    : "px-4 py-2 rounded-full text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center"
                                }
                            >
                                {link.icon}
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
            {/* Right section */}
            <div className="flex items-center gap-3">
                {/* Notification Icon */}
                <div className="relative" ref={notifRef}>
                    <button
                        aria-label="Notifications"
                        className="border rounded-full p-4 flex items-center justify-center bg-transparent"
                        onClick={() => setOpenDropdown(openDropdown === "notifications" ? null : "notifications")}
                    >
                        <Bell size={22} className="text-gray-500" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <AnimatePresence>
                        {openDropdown === "notifications" && (
                            <motion.div
                                className="absolute right-0 top-14 bg-white rounded-lg shadow-lg w-72 p-0 z-50"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={dropdownVariants}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                <div className="p-4 font-semibold">Notifications</div>
                                <ul className="max-h-64 overflow-y-auto divide-y">
                                    {exampleNotifications.length === 0 && (
                                        <li className="p-4 text-gray-400 text-sm">No new notifications</li>
                                    )}
                                    {exampleNotifications.map(n => (
                                        <li key={n.id} className={`px-4 py-3 ${n.read ? "bg-white" : "bg-orange-50"}`}>
                                            <div className="text-sm">{n.text}</div>
                                            <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Profile section */}
                <div className="flex gap-2 items-center relative" ref={userRef}>
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="w-10 h-10 rounded-full border" />
                    <button
                        className="flex flex-col text-left focus:outline-none"
                        onClick={() => setOpenDropdown(openDropdown === "user" ? null : "user")}
                    >
                        <span className="font-bold text-sm">{firstName} {lastName}</span>
                        <span className="text-xs text-gray-400">{truncatedAddress}</span>
                    </button>
                    <AnimatePresence>
                        {openDropdown === "user" && (
                            <motion.div
                                className="absolute top-12 left-7 bg-white rounded-lg shadow-lg w-56 p-2 z-50"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={dropdownVariants}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                <div className="flex flex-col gap-1 px-3 py-2">
                                    <span className="text-gray-500 text-xs">Wallet Address</span>
                                    <span className="font-mono text-sm break-all">{truncatedAddress}</span>
                                </div>
                                <a
                                    href="/settings"
                                    className="w-full block px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center"
                                >
                                    <UserSquare size={16} className="mr-2 text-orange-600" />
                                    Profile Settings
                                </a>
                                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-orange-600 hover:bg-orange-100 transition-colors mt-1">
                                    <LogOut size={18} className="text-orange-600" />
                                    <span className="text-sm font-semibold">Sign Out</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Search section */}
                <div className="border rounded-full p-4 flex items-center justify-center bg-transparent">
                    <Search size={24} className="text-gray-400" />
                </div>
                <Input
                    type="text"
                    placeholder="Start searching here ..."
                    className="w-[130px] border-none outline-none bg-transparent text-xs shadow-none"
                />
            </div>
            {/* Dropdown for menu icon in "menu" mode */}
            <AnimatePresence>
                {mode === "menu" && openDropdown === "menu" && (
                    <motion.div
                        className="absolute left-0 top-16 bg-white rounded-lg shadow-lg p-3 w-64 z-50"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        {menuLinks.map(link => (
                            <a
                                key={link.key}
                                href={link.href}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    active === link.key
                                        ? "bg-orange-600 text-white"
                                        : "text-gray-800 hover:bg-gray-100"
                                }`}
                            >
                                {link.icon}
                                {link.label}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
