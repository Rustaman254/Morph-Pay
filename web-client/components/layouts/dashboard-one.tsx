import Header from "@/components/shared-components/Header";
import Image from "next/image";
import Footer from "../shared-components/Footer";

export default function DashboardOne({children}: {children: React.ReactNode}) {
  return (
    <div className="bg-[#14161b] font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {children}
      </main>
      <Footer />
    </div>
  );
}
