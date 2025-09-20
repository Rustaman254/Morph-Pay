import DashboardOne from "@/components/layouts/dashboard-one";
import BuySellSend from "@/components/shared-components/BuySell";
// import SendComponent from "@/components/shared-components/sendComponent";

export default function Home() {
  return (
    <DashboardOne>
      <div className="flex flex-col items-start space-y-1 mb-6">
        {/* <h1 className="text-3xl font-bold text-white">Welcome To Morph Pay</h1>
        <p className="text-lg text-gray-300">Your gateway to seamless crypto transactions.</p> */}
      </div>
      <BuySellSend mode="swap" />
    </DashboardOne>
  );
}
