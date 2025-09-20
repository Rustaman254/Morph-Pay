import DashboardOne from "@/components/layouts/dashboard-one";
import BuySellSend from "@/components/shared-components/BuySell";
// import SendComponent from "@/components/shared-components/sendComponent";

export default function Send() {
  return (
    <DashboardOne>
      <div className="flex flex-col items-start space-y-1 mb-6">
        <h1 className="text-3xl font-bold text-white">Send Crypto to Mobile</h1>
        <p className="text-lg text-gray-300">Convert and send instantly using Morph Pay.</p>
      </div>
      <BuySellSend mode="send" />
    </DashboardOne>
  );
}
