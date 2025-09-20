import DashboardOne from "@/components/layouts/dashboard-one";
import BuySell from "@/components/shared-components/BuySell";
import Header from "@/components/shared-components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <DashboardOne>
      <h1 className="text-3xl font-bold text-white">Welcome to Morph Pay</h1>
      <p className="text-lg text-gray-300">Your gateway to seamless crypto transactions.</p>
      <BuySell />
    </DashboardOne>
  );
}
