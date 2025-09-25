import DashboardOne from "@/components/layouts/dashboard-one";
import { ArrowDownLeft, ArrowUpRight, LifeBuoy, Headset} from "lucide-react";
import Transactions from "@/components/shared-components/Transactions";

// Example: replace with actual user currency lookup/data
const USER_CURRENCY = {
  code: "KES",
  rate: 160, // 1 USD = 160 KES
  label: "Ksh" // You can use "KES", "Ksh", or whatever local symbol you want
};

export default function Home() {
  const userBalance = 3025.19; // Assume this is in USD by default
  const localValue = userBalance * USER_CURRENCY.rate;

  return (
    <DashboardOne>
      <div className="w-full flex flex-col items-center justify-center py-6">
        <span className="text-lg font-semibold text-gray-400 text-center mb-1">
          Available Balance
        </span>
        <span className="text-4xl font-extrabold text-white text-center">
          ${userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="text-sm mt-4 font-semibold text-[#96a954] text-center mb-8">
          = {USER_CURRENCY.label} {localValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <div className="flex items-center justify-center gap-14">
          {/* Withdraw */}
          <a
            href="/send"
            className="flex flex-col items-center group hover:text-[#96a954] transition"
          >
            <ArrowUpRight className="w-10 h-10 text-[#96a954] mb-2 group-hover:scale-110 transition" />
            <span className="text-base text-white font-semibold group-hover:text-[#96a954]">Send</span>
          </a>
          {/* Deposit */}
          <a
            href="/deposit"
            className="flex flex-col items-center group hover:text-[#96a954] transition"
          >
            <ArrowDownLeft className="w-10 h-10 text-[#96a954] mb-2 group-hover:scale-110 transition" />
            <span className="text-base text-white font-semibold group-hover:text-[#96a954]">Deposit</span>
          </a>
          {/* Support */}
          <div className="flex flex-col items-center opacity-70">
            <Headset className="w-10 h-10 text-[#96a954] mb-2" />
            <span className="text-base text-white font-semibold">Support</span>
          </div>
        </div>
      </div>
      {/* Transactions List */}
      {/* <Transactions compact/> */}
    </DashboardOne>
  );
}
