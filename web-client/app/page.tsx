import DashboardOne from "@/components/layouts/dashboard-one";
import BuySell from "@/components/shared-components/BuySell";

export default function Home() {
  return (
    <DashboardOne>
      <div className="flex flex-col items-start space-y-1 mb-6">
        <h1 className="text-3xl font-bold text-white">
          Welcome to Morph Pay
        </h1>
        <p className="text-lg text-gray-300">
          Your gateway to seamless crypto transactions.
        </p>
      </div>
      <BuySell />
    </DashboardOne>
  );
}
