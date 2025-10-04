"use client";
import React, { useState, useEffect } from "react";
import { User, Lock, Mail, CheckCircle } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/logoipsum-custom-logo.svg";
import type { LucideIcon } from "lucide-react";
import axios from "axios";
import { Toaster, toast } from "sonner";

interface LoginSignupModalProps {
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
  onClose: () => void;
  loading: boolean;
}
interface InputProps {
  id: string;
  placeholder: string;
  icon: LucideIcon;
  type: string;
  value: string;
  setValue: (v: string) => void;
}
// Truncates Ethereum wallet addresses for display
function truncateAddress(address: string): string {
  if (!address || !address.startsWith("0x") || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const INPUT_STYLES =
  "w-full pl-14 pr-4 py-3 rounded-full bg-transparent text-gray-200 text-[1.08rem] font-semibold border border-[#1a1d1f] placeholder-[#101114] placeholder:font-normal focus:placeholder-[#191b1e] focus:border-[#96a954]/70 hover:border-[#96a954]/40 focus:shadow-[0_2px_12px_-2px_#96a95450] transition-all duration-150 outline-none";
const BUTTON_STYLES =
  "bg-[#96a954] text-[#232628] font-semibold text-md px-6 py-2 rounded-full shadow hover:shadow-lg hover:bg-[#afc77c] transition-all duration-150 flex items-center justify-center gap-2 mt-2";
const CARD_STYLES =
  "bg-gradient-to-br from-[#232628] via-[#242a2e] to-[#293033] rounded-2xl p-10 min-w-[340px] flex flex-col items-center relative shadow-2xl w-full max-w-lg";

export const LoginSignupModal: React.FC<LoginSignupModalProps> = ({
  mode,
  setMode,
  onClose,
  loading,
}) => {
  const [loginContact, setLoginContact] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupFname, setSignupFname] = useState("");
  const [signupLname, setSignupLname] = useState("");
  const [signupCountry, setSignupCountry] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { data } = await axios.post("https://morph-pay.onrender.com/api/v1/auth/login", {
        contact: loginContact,
        password: loginPassword,
      });
      // Optionally, pass user/token up or close modal here if needed
      localStorage.setItem("morphpay_jwt", data.token);
      localStorage.setItem("morphpay_user", JSON.stringify({
        fname: data.fname,
        lname: data.lname,
        address: data.address,
        contact: data.contact,
      }));
      toast.success("Logged in successfully!");
      setLoginContact("");
      setLoginPassword("");
      onClose(); // Optionally close modal on success
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Login failed. Please try again."
      );
    }
    setLoginLoading(false);
  };

  // Signup Handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      await axios.post("https://morph-pay.onrender.com/api/v1/auth/register", {
        fname: signupFname,
        lname: signupLname,
        country: signupCountry,
        email: signupEmail,
        password: signupPassword,
      });
      toast.success("Registration successful! Please log in.");
      setMode("login");
      setSignupFname("");
      setSignupLname("");
      setSignupCountry("");
      setSignupEmail("");
      setSignupPassword("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Registration failed. Please try again."
      );
    }
    setSignupLoading(false);
  };

  const renderInput = ({ id, placeholder, icon: Icon, type, value, setValue }: InputProps) => (
    <div className="w-full relative transition-all duration-150">
      <Icon className="absolute left-4 top-[0.9rem] w-6 h-6 text-[#96a954]" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className={INPUT_STYLES}
        autoComplete="off"
      />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/70">
        <Toaster position="top-right" richColors />
        <div className={CARD_STYLES}>
          <button
            className="absolute top-4 right-4 text-[#96a954] hover:text-white text-2xl transition-all duration-150"
            onClick={onClose}
            aria-label="Close"
          >
            &#10005;
          </button>
          <span className="text-gray-400 text-base font-medium mb-4 tracking-wide">
            {mode === "login" ? "Login" : "Signup"}
          </span>
          <div className="w-[60%] mx-auto mb-10 mt-1">
            <Image
              src={Logo}
              alt="Logo"
              layout="responsive"
              width={600}
              height={180}
              priority
            />
          </div>
          <form
            onSubmit={mode === "login" ? handleLogin : handleSignup}
            className="w-full flex flex-col gap-8"
          >
            {mode === "signup" ? (
              <>
                <div className="flex gap-6">
                  <div className="w-1/2">
                    {renderInput({
                      id: "signup-fname",
                      placeholder: "First Name",
                      icon: User,
                      type: "text",
                      value: signupFname,
                      setValue: setSignupFname,
                    })}
                  </div>
                  <div className="w-1/2">
                    {renderInput({
                      id: "signup-lname",
                      placeholder: "Last Name",
                      icon: User,
                      type: "text",
                      value: signupLname,
                      setValue: setSignupLname,
                    })}
                  </div>
                </div>
                {renderInput({
                  id: "signup-country",
                  placeholder: "Country",
                  icon: CheckCircle,
                  type: "text",
                  value: signupCountry,
                  setValue: setSignupCountry,
                })}
                {renderInput({
                  id: "signup-email",
                  placeholder: "Email address",
                  icon: Mail,
                  type: "email",
                  value: signupEmail,
                  setValue: setSignupEmail,
                })}
                {renderInput({
                  id: "signup-password",
                  placeholder: "Password (min 8 chars)",
                  icon: Lock,
                  type: "password",
                  value: signupPassword,
                  setValue: setSignupPassword,
                })}
              </>
            ) : (
              <>
                {renderInput({
                  id: "login-contact",
                  placeholder: "Email or Phone",
                  icon: User,
                  type: "text",
                  value: loginContact,
                  setValue: setLoginContact,
                })}
                {renderInput({
                  id: "login-password",
                  placeholder: "Password",
                  icon: Lock,
                  type: "password",
                  value: loginPassword,
                  setValue: setLoginPassword,
                })}
              </>
            )}
            <button
              type="submit"
              className={BUTTON_STYLES}
              disabled={loading || signupLoading || loginLoading}
            >
              <CheckCircle className="w-5 h-5" />
              {loading || signupLoading || loginLoading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                ? "Sign in"
                : "Sign up"}
            </button>
            <div className="text-center text-sm text-[#96a954] mt-2">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="underline ml-1 text-[#96a954] hover:text-white transition-all duration-150"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="underline ml-1 text-[#96a954] hover:text-white transition-all duration-150"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginSignupModal;
