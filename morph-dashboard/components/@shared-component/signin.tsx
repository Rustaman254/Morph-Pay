"use client"

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, Lock, Phone, Globe, ArrowRight } from "lucide-react";
import { Toaster, toast } from "sonner";

const COUNTRY_LIST = [
    { label: "Kenya", code: "KE", dial: "+254" },
    { label: "Uganda", code: "UG", dial: "+256" },
    { label: "Tanzania", code: "TZ", dial: "+255" },
    { label: "Nigeria", code: "NG", dial: "+234" },
];

export default function Signup() {
    const [form, setForm] = useState({
        phone: "",
        email: "",
        password: "",
        fname: "",
        lname: "",
        country: "",
        isAgent: false,
    });
    const [countryPrefix, setCountryPrefix] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (e) => {
        const selected = COUNTRY_LIST.find(c => c.code === e.target.value);
        setForm({ ...form, country: e.target.value, phone: "" });
        setCountryPrefix(selected ? selected.dial : "");
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/^0+/, "");
        setForm({ ...form, phone: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const msisdn =
                countryPrefix && form.phone
                    ? `${countryPrefix}${form.phone.replace(/^0+/, "")}`
                    : "";
            await axios.post("http://localhost:5500/api/v1/auth/register", {
                phone: msisdn,
                email: form.email,
                password: form.password,
                fname: form.fname,
                lname: form.lname,
                country: form.country,
                isAgent: false
            });
            toast.success("Registration successful!");
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


    return (
        <div className="min-h-screen flex items-center justify-center font-inter bg-[#f9f8f9]">
            <Toaster richColors position="top-right" />
            <div className="w-full max-w-[700px] rounded-3xl bg-[#f9f8f9] px-10 py-12">
                <div className="flex items-center mb-8">
                    <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">N9</div>
                    <div>
                        <div className="text-lg font-semibold mb-1">Financial Dashboard</div>
                        <div className="text-gray-400 text-sm">Create your account</div>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4 mb-4">
                        <div className="relative w-1/2">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                            <Input
                                name="fname"
                                type="text"
                                placeholder="First Name"
                                value={form.fname}
                                onChange={handleChange}
                                className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                required
                            />
                        </div>
                        <div className="relative w-1/2">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                            <Input
                                name="lname"
                                type="text"
                                placeholder="Last Name"
                                value={form.lname}
                                onChange={handleChange}
                                className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="relative w-1/2">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Globe size={18} /></span>
                            <select
                                name="country"
                                value={form.country}
                                onChange={handleCountryChange}
                                className="pl-11 pr-4 py-5 rounded-full bg-white border border-gray-200 text-base focus:outline-none w-full appearance-none"
                                required
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
                                {/* Static country prefix; input for rest of number */}
                                <span className="flex items-center pl-11 bg-white border border-gray-200 rounded-l-full py-5 pr-2 text-base text-gray-600">
                                    {countryPrefix}
                                </span>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="712345678"
                                    value={form.phone}
                                    onChange={handlePhoneChange}
                                    className="flex-1 rounded-r-full bg-white border-t border-b border-r border-gray-200 py-5 pl-3 pr-4 text-base focus:outline-none"
                                    pattern="[0-9]{6,15}"
                                    required
                                    disabled={!countryPrefix}
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
                                value={form.email}
                                onChange={handleChange}
                                className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                required
                            />
                        </div>
                        <div className="relative w-1/2">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-between transition"
                    >
                        <span className="px-6">{loading ? "Signing Up..." : "Sign Up"}</span>
                        <ArrowRight size={20} className="ml-3 mr-6" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
