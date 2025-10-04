import React, { useState } from "react";
import { User, Bell } from "lucide-react";

// Dummy user data (replace with your state/props as needed)
const user = {
  fname: "Jane",
  lname: "Doe",
  address: "0x1234abcd5678ef9012345678ef9012345678abcd",
};

// Dummy notifications
const notifications = [
  {
    id: 1,
    message: "New P2P liquidity provision request from DeltaCorp.",
    unread: true,
  },
  {
    id: 2,
    message: "Business ABC filled your P2P offer.",
    unread: false,
  },
];

function truncateAddress(address: string) {
  if (!address || address.length < 11) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const HeaderProfileWithNotifications: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex items-center gap-4 relative">
      {/* NOTIFICATION ICON & DROPDOWN */}
      <div className="relative">
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#23292d]"
          aria-label="Notifications"
          onClick={() => setNotifOpen((v) => !v)}
        >
          <Bell className="w-6 h-6 text-[#7dbb5f]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-[10px] h-[10px] rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
          )}
        </button>
        {notifOpen && (
          <div
            tabIndex={-1}
            className="absolute left-0 mt-2 min-w-[270px] max-w-xs bg-[#222c20] rounded-xl shadow-2xl border border-[#96a954]/10 z-50"
          >
            <div className="px-4 py-2 border-b border-[#96a954]/10 font-semibold text-[#7dbb5f] text-sm">
              Notifications
            </div>
            <ul className="p-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-2 py-2 text-xs rounded flex items-center gap-2 ${
                    n.unread ? "font-semibold text-white bg-[#313c28]/70" : "text-gray-400"
                  }`}
                >
                  {n.message}
                  {n.unread && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="text-xs px-2 py-1 text-gray-400">No notifications</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {/* PROFILE CONTAINER */}
      <div className="flex items-center bg-[#e8f5de] rounded-full pl-3 pr-2 py-2 shadow gap-3 min-w-[200px] max-w-xs">
        {/* Profile pic */}
        <div className="rounded-full bg-[#b2c6a1] p-2 flex items-center justify-center">
          <User size={28} className="text-white" />
        </div>
        {/* Name + wallet */}
        <div className="flex flex-col items-start justify-center flex-1 ml-2">
          <span className="font-semibold text-xs text-[#23311c] leading-4">{user.fname} {user.lname}</span>
          <span className="text-xs font-mono text-[#678453]">{truncateAddress(user.address)}</span>
        </div>
        {/* Logout */}
        <button
          className="text-[10px] px-3 py-1 rounded-full bg-[#96a954] text-[#232628] font-semibold ml-2 min-w-[54px] hover:bg-[#7dbb5f] transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HeaderProfileWithNotifications;
