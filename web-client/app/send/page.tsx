import DashboardOne from "@/components/layouts/dashboard-one";
import BuySellSend from "@/components/shared-components/BuySell";
// import SendComponent from "@/components/shared-components/sendComponent";

export default function Home() {
  return (
    <DashboardOne>
      <div className="w-full flex flex-col items-start space-y-1 mb-6">
        <h1 className="w-full text-3xl font-bold text-center text-white">Welcome To Morph Pay</h1>
        <p className="w-full text-lg text-gray-300 text-center">Your gateway to seamless crypto transactions.</p>
      </div>
      <BuySellSend mode="send" />
    </DashboardOne>
  );
}
