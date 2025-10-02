"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, Lock, Phone, Globe, ArrowRight, RefreshCcw, Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";

const COUNTRY_LIST = [
    { label: "Kenya", code: "KE", dial: "+254", regex: /^0\d{9}$/ },
    // Add others if desired
];

export default function AuthPage() {
    const router = useRouter();
    const [showSignup, setShowSignup] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [countryPrefix, setCountryPrefix] = useState("");
    const [loading, setLoading] = useState(false);

    // Reveal state for password inputs
    const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
    const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);

    // Shared state for signup
    const [signupForm, setSignupForm] = useState({
        phone: "",
        email: "",
        password: "",
        fname: "",
        lname: "",
        country: "",
        isAgent: false,
    });
    const [loginForm, setLoginForm] = useState({
        contact: "",
        password: "",
    });
    const [recoveryContact, setRecoveryContact] = useState("");
    const [defaultCountry, setDefaultCountry] = useState(COUNTRY_LIST[0]);

    // Reset input state when switching forms
    useEffect(() => {
        setLoginForm({ contact: "", password: "" });
        setLoginPasswordVisible(false);
        setSignupPasswordVisible(false);
    }, [showSignup]);
    useEffect(() => {
        setRecoveryContact("");
    }, [showRecovery]);

    useEffect(() => {
        async function getDefaultCountry() {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const found = COUNTRY_LIST.find(item => item.code === data.country_code);
                if (found) setDefaultCountry(found);
            } catch {}
        }
        getDefaultCountry();
    }, []);

    useEffect(() => {
        if (showSignup) {
            async function getCountry() {
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    const found = COUNTRY_LIST.find(item => item.code === data.country_code);
                    if (found) {
                        setSignupForm(f => ({
                            ...f,
                            country: found.code,
                        }));
                        setCountryPrefix(found.dial);
                    }
                } catch {}
            }
            getCountry();
        }
    }, [showSignup]);

    // Signup handlers
    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };
    const handleSignupCountryChange = (e) => {
        const selected = COUNTRY_LIST.find(c => c.code === e.target.value);
        setSignupForm({ ...signupForm, country: e.target.value, phone: "" });
        setCountryPrefix(selected ? selected.dial : "");
    };
    const handleSignupPhoneChange = (e) => {
        const val = e.target.value.replace(/^0+/, "");
        setSignupForm({ ...signupForm, phone: val });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const msisdn = countryPrefix && signupForm.phone
                ? `${countryPrefix}${signupForm.phone.replace(/^0+/, "")}` : "";
            const response = await axios.post("http://localhost:5500/api/v1/auth/register", {
                phone: msisdn,
                email: signupForm.email,
                password: signupForm.password,
                fname: signupForm.fname,
                lname: signupForm.lname,
                country: signupForm.country,
                isAgent: false
            });
            localStorage.setItem("auth_token", response.data.token);
            localStorage.setItem("contact", response.data.contact);
            toast.success("Registration successful!");
            setTimeout(() => {
                router.replace('/');
                window.location.reload();
            }, 1200);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                toast.error("A user with this phone or email already exists.");
            } else {
                toast.error(err.response?.data?.message || "Registration failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginChange = (e) => {
        const { name, value: origValue } = e.target;
        let value = origValue;
        if (name === "contact" && value.startsWith("0") && defaultCountry.regex.test(value)) {
            value = defaultCountry.dial + value.slice(1);
        }
        setLoginForm({ ...loginForm, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5500/api/v1/auth/login", {
                contact: loginForm.contact,
                password: loginForm.password
            });
            localStorage.setItem("auth_token", response.data.token);
            localStorage.setItem("contact", response.data.contact);
            toast.success("Logged in successfully!");
            setTimeout(() => {
                router.replace('/');
                window.location.reload();
            }, 1200);
        } catch (err) {
            toast.error(err.response?.data?.error || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- ACCOUNT RECOVERY ---
    const handleRecovery = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:5500/api/v1/auth/recover", {
                contact: recoveryContact
            });
            toast.success("Recovery instructions sent!");
            setShowRecovery(false);
        } catch (err) {
            toast.error(err.response?.data?.error || "Recovery failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-inter bg-[#f9f8f9]">
            <Toaster richColors position="top-right" />
            <div className="w-full max-w-[700px] rounded-3xl bg-[#f9f8f9] px-10 py-12">
                <div className="flex items-center mb-8">
                    <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">N9</div>
                    <div>
                        <div className="text-lg font-semibold mb-1">Morph</div>
                        <div className="text-gray-400 text-sm">
                            {showSignup
                                ? "Create your account"
                                : showRecovery
                                    ? "Account recovery"
                                    : "Login to your account"}
                        </div>
                    </div>
                </div>
                {/* Titles and info */}
                <div className="mb-8 text-center">
                    {showSignup ? (
                        <>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                Get started with Morph
                            </div>
                            <div className="text-base text-gray-600 mb-2">
                                Create your Morph account to access a seamless peer-to-peer liquidity platform.
                            </div>
                            <div className="text-xs text-gray-400">
                                Signing up is free. Your financial privacy is a priority.
                            </div>
                        </>
                    ) : showRecovery ? (
                        <>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                Account recovery
                            </div>
                            <div className="text-base text-gray-600 mb-2">
                                Enter your email or phone number for password reset instructions.
                            </div>
                            <div className="text-xs text-gray-400">
                                Lost access? Our recovery is secure and private.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                Welcome back to Morph
                            </div>
                            <div className="text-base text-gray-600 mb-2">
                                Sign in to your Morph account to access your wallet and liquidity provider dashboard.
                            </div>
                            <div className="text-xs text-gray-400">
                                Trouble logging in? Contact support or recover your credentials.
                            </div>
                        </>
                    )}
                </div>
                {/* Recovery form */}
                {showRecovery ? (
                    <form onSubmit={handleRecovery}>
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                            <Input
                                name="recoveryContact"
                                type="text"
                                placeholder="Phone (with +254) or Email"
                                value={recoveryContact}
                                onChange={e => setRecoveryContact(e.target.value)}
                                className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full cursor-pointer rounded-full bg-orange-600 hover:bg-orange-700 text-white py-8 px-8 flex items-center justify-center transition ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <>
                                    <span className="px-6">Sending...</span>
                                    <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V12H4z"></path>
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span className="px-6">Recover Account</span>
                                    <RefreshCcw size={20} className="ml-3" />
                                </>
                            )}
                        </Button>
                        <div className="text-center mt-6">
                            <button
                                className="text-gray-500 text-sm underline"
                                disabled={loading}
                                type="button"
                                onClick={() => setShowRecovery(false)}
                            >
                                Back to login
                            </button>
                        </div>
                    </form>
                ) : !showSignup ? (
                    <>
                        <form onSubmit={handleLogin}>
                            <div className="relative mb-4">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                                <Input
                                    name="contact"
                                    type="text"
                                    placeholder="Phone (with +254) or Email"
                                    value={loginForm.contact}
                                    onChange={handleLoginChange}
                                    className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="relative mb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                                <Input
                                    name="password"
                                    type={loginPasswordVisible ? "text" : "password"}
                                    placeholder="Password"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    className="pl-11 pr-11 py-8 rounded-full bg-white border border-gray-200 text-base"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setLoginPasswordVisible(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    tabIndex={-1}
                                >
                                    {loginPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="mb-4">
                                <button
                                    type="button"
                                    className="text-orange-600 text-xs font-normal hover:underline focus:outline-none transition-colors"
                                    style={{ fontWeight: 400 }}
                                    disabled={loading}
                                    onClick={() => setShowRecovery(true)}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={`w-full cursor-pointer rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-center transition ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <>
                                        <span className="px-6">Logging In...</span>
                                        <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V12H4z"></path>
                                        </svg>
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </form>
                        <div className="text-center mt-6">
                            <button
                                className="text-orange-600 font-bold"
                                disabled={loading}
                                onClick={() => setShowSignup(true)}
                            >
                                Don&apos;t have an account? Sign up
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleSignup}>
                            <div className="flex gap-4 mb-4">
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                                    <Input
                                        name="fname"
                                        type="text"
                                        placeholder="First Name"
                                        value={signupForm.fname}
                                        onChange={handleSignupChange}
                                        className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                                    <Input
                                        name="lname"
                                        type="text"
                                        placeholder="Last Name"
                                        value={signupForm.lname}
                                        onChange={handleSignupChange}
                                        className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Globe size={18} /></span>
                                    <select
                                        name="country"
                                        value={signupForm.country}
                                        onChange={handleSignupCountryChange}
                                        className="pl-11 pr-4 py-5 rounded-full bg-white border border-gray-200 text-base focus:outline-none w-full appearance-none"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Select Country</option>
                                        {COUNTRY_LIST.map(({ label, code }) => (
                                            <option key={code} value={code}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={18} /></span>
                                    <div className="flex">
                                        <span className="flex items-center pl-11 bg-white border border-gray-200 rounded-l-full py-5 pr-2 text-base text-gray-600">
                                            {countryPrefix}
                                        </span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            placeholder="712345678"
                                            value={signupForm.phone}
                                            onChange={handleSignupPhoneChange}
                                            className="flex-1 rounded-r-full bg-white border-t border-b border-r border-gray-200 py-5 pl-3 pr-4 text-base focus:outline-none"
                                            pattern="[0-9]{6,15}"
                                            required
                                            disabled={!countryPrefix || loading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={signupForm.email}
                                        onChange={handleSignupChange}
                                        className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                                    <Input
                                        name="password"
                                        type={signupPasswordVisible ? "text" : "password"}
                                        placeholder="Password"
                                        value={signupForm.password}
                                        onChange={handleSignupChange}
                                        className="pl-11 pr-11 py-8 rounded-full bg-white border border-gray-200 text-base"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSignupPasswordVisible(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        tabIndex={-1}
                                    >
                                        {signupPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={`w-full cursor-pointer rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-center transition ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <>
                                        <span className="px-6">Signing Up...</span>
                                        <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V12H4z"></path>
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <span className="px-6">Sign Up</span>
                                        <ArrowRight size={20} className="ml-3" />
                                    </>
                                )}
                            </Button>
                        </form>
                        <div className="text-center mt-6">
                            <button className="text-orange-600 font-bold" disabled={loading} onClick={() => setShowSignup(false)}>
                                Already have an account? Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
