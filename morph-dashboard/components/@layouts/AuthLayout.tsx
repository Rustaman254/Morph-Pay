import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  infographic?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, infographic }) => (
  <div className="flex min-h-screen bg-[#f9f8f9]">
    {/* Left: Infographic Section */}
    <div className="flex-1 flex items-center justify-center bg-white rounded-l-2xl">
      {infographic}
    </div>
    {/* Right: Form Section */}
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
