import React, { useState, useRef, useEffect } from "react";
import { User as UserIcon, Bell } from "lucide-react";
import axios from "axios";

type UserType = {
  fname: string;
  lname: string;
  address: string;
  contact?: string;
};

type NotificationType = {
  id: number;
  message: string;
  unread: boolean;
};

type HeaderProfileWithNotificationsProps = {
  onLogout: () => void;
};

const notifications: NotificationType[] = [
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

function truncateAddress(address: string): string {
  if (!address || address.length < 11) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const HeaderProfileWithNotifications: React.FC<HeaderProfileWithNotificationsProps> = ({
  onLogout,
}) => {
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);

      // Get the user data and token from localStorage
      const userStr = localStorage.getItem("morphpay_user");
      let contact: string | undefined;
      if (userStr) {
        try {
          const userObj: UserType = JSON.parse(userStr);
          contact = userObj.contact;
        } catch (e) {
          setError("Invalid user data in local storage.");
          setLoading(false);
          return;
        }
      }
      if (!contact) {
        setError("No user found in local storage.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("morphpay_jwt"); 
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<UserType>(
          `https://morph-pay.onrender.com/api/v1/p2p/user/${contact}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          onLogout();
        } else {
          setError("Error loading profile");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [onLogout]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  return (
    <div className="flex items-center gap-4 relative">
      {/* NOTIFICATION ICON AND DROPDOWN */}
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          className="relative w-10 cursor-pointer h-10 flex items-center justify-center rounded-full hover:bg-[#23292d]"
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
            ref={dropdownRef}
            tabIndex={-1}
            className="absolute left-0 mt-2 top-full min-w-[270px] max-w-xs bg-[#222c20] rounded-xl shadow-2xl border border-[#96a954]/10 z-50"
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
                  {n.unread && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
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
      <div className="flex items-center bg-[#e8f5de] rounded-full pl-4 pr-3 py-2 shadow gap-4 min-w-[240px] max-w-md">
        <div className="rounded-full bg-[#b2c6a1] p-2.5 flex items-center justify-center">
          <UserIcon size={32} className="text-white" />
        </div>
        <div className="flex flex-col items-start justify-center flex-1 ml-3">
          {loading ? (
            <span className="text-xs text-gray-500">Loading...</span>
          ) : error ? (
            <span className="text-xs text-red-500">{error}</span>
          ) : user ? (
            <>
              <span className="font-semibold text-sm text-[#23311c] leading-5">
                {user.fname} {user.lname}
              </span>
              <span className="text-[13px] font-mono text-[#678453]">
                {truncateAddress(user.address)}
              </span>
            </>
          ) : null}
        </div>
        <button
          type="button"
          className="text-sm cursor-pointer px-4 py-2 rounded-full bg-[#96a954] text-[#232628] font-semibold ml-2 min-w-[68px] hover:bg-[#7dbb5f] transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HeaderProfileWithNotifications;
