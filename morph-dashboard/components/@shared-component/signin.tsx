"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, User, Lock, ArrowRight, Phone, Globe } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function Signup() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center font-inter bg-[#f9f8f9]">
      <div className="w-full max-w-[700px] rounded-3xl bg-[#f9f8f9] px-10 py-12">
        <div className="flex items-center mb-8">
          <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">N9</div>
          <div>
            <div className="text-lg font-semibold mb-1">Financial Dashboard</div>
            <div className="text-gray-400 text-sm">{isLogin ? "Log in to your account" : "Create your account"}</div>
          </div>
        </div>

        {isLogin ? (
          <form>
            <div className="flex flex-col gap-6 mb-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                <Input type="email" placeholder="Email" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                <Input type="password" placeholder="Password" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-between transition">
              <span className="px-6">Log In</span>
              <ArrowRight size={20} className="ml-3 mr-6" />
            </Button>
            <div className="mt-8 text-center">
              <span className="text-gray-400 text-base">Don't have an account?</span>
              <button onClick={() => setIsLogin(false)} className="text-orange-600 ml-2 font-medium hover:underline">
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          <>
            <form>
              {/* First row: fname, lname */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                  <Input type="text" placeholder="First Name" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                  <Input type="text" placeholder="Last Name" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
              </div>
              {/* Second row: phone, country */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={18} /></span>
                  <Input type="tel" placeholder="Phone" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Globe size={18} /></span>
                  <Input type="text" placeholder="Country" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
              </div>
              {/* Third row: email, password */}
              <div className="flex gap-4 mb-8">
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                  <Input type="email" placeholder="Email" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                  <Input type="password" placeholder="Password" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
                </div>
              </div>
              {/* Submit button */}
              <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-between transition">
                <span className="px-6">Sign Up</span>
                <ArrowRight size={20} className="ml-3 mr-6" />
              </Button>
            </form>
            <div className="mt-8 text-center">
              <span className="text-gray-400 text-base">Already have an account?</span>
              <button onClick={() => setIsLogin(true)} className="text-orange-600 ml-2 font-medium hover:underline">
                Log In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
