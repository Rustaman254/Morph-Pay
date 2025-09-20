"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [connected, setConnected] = useState(false);
  const walletAddress = "0x12...89F7";
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/send", label: "Send" },
    { href: "/receive", label: "Receive" },
  ];

  return (
    <header className="w-full h-16 bg-[#14161b] flex items-center px-8">
      <div className="w-full relative flex items-center h-full">
        {/* Logo */}
        <div className="font-bold text-base text-[#96a954] z-10">Morph Pay</div>

        {/* Navigation (always perfectly centered) */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex gap-3 list-none m-0">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-white font-medium text-sm px-3 py-2 transition-colors duration-200 
                      ${isActive ? "bg-[#232628] rounded-full font-semibold" : "rounded-full"} 
                      hover:bg-[#232628]`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right side (absolute) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
          {!connected ? (
            <button
              onClick={() => setConnected(true)}
              className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full transition-colors hover:bg-[#96a954]/90"
            >
              Connect
            </button>
          ) : (
            <div className="bg-[#1e2127] rounded-full px-4 py-2 flex items-center gap-4 shadow">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#96a954] flex items-center justify-center rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#14161b"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2m0-6h18"
                    />
                  </svg>
                </span>
                <span className="text-white text-sm font-mono">{walletAddress}</span>
              </div>
              <button
                onClick={() => setConnected(false)}
                className="bg-[#96a954] text-[#14161b] font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#96a954]/90 transition"
              >
                Logout
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#14161b"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
