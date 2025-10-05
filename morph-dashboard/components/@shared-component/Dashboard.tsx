"use client"

import DashboardLayout from "../@layouts/DashboardLayout";
import Overview from "./overview";
import WalletPage from "./Wallet";

export default function Dashboard() {
    return (
        <DashboardLayout>
            <WalletPage />
        </DashboardLayout>
    );
}



