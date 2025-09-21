import DashboardOne from "@/components/layouts/dashboard-one";
import Transactions from "@/components/shared-components/Transactions";

export default function TransactionsPage() {
  return (
    <DashboardOne>
      <div className="flex flex-col items-start space-y-1 mb-6">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="text-lg text-gray-300">
          View all your crypto and fiat transfers, swaps, and more.
        </p>
      </div>
      <Transactions />
    </DashboardOne>
  );
}
