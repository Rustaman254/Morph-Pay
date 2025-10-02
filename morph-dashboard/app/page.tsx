"use client"
import { useState, useEffect } from "react";
import Signin from "@/components/@shared-component/signin";
import { toast } from "sonner";
import Dashboard from "@/components/@shared-component/Dashboard";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    setIsSignedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("auth_token");
    setIsSignedIn(false);
    toast.success("Signed out successfully.");
  };

  if (isSignedIn) {
    return (
      <div className="bg-[#f9f8f9]">
        <Dashboard  />
      </div>
    );
  }

  return <Signin />;
}
