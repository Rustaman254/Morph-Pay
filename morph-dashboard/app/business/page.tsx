"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, User, Lock, Phone, Globe, Building2, Briefcase, ListChecks, Link } from "lucide-react"

export default function RegisterBusiness() {
  return (
    <div className="min-h-screen flex items-center justify-center font-inter bg-[#f9f8f9]">
      <div className="w-full max-w-[700px] rounded-3xl bg-[#f9f8f9] px-10 py-12">
        <div className="flex items-center mb-8 cursor-pointer">
          <div className="bg-black text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">N9</div>
          <div>
            <div className="text-lg font-semibold mb-1">Financial Dashboard</div>
            <div className="text-gray-400 text-sm hover:underline">Back to Signup</div>
          </div>
        </div>

        <form>
          {/* User information fields */}
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
          <div className="flex gap-4 mb-4">
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
              <Input type="email" placeholder="Email" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
              <Input type="password" placeholder="Password" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
          </div>
          {/* Business information fields */}
          <div className="flex gap-4 mb-4">
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Building2 size={18} /></span>
              <Input type="text" placeholder="Business Name" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase size={18} /></span>
              <Input type="text" placeholder="Legal Entity Type" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><ListChecks size={18} /></span>
              <Input type="text" placeholder="Registration Number" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
              <Input type="email" placeholder="Business Email" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
            </div>
          </div>
          <div className="relative mb-8">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Link size={18} /></span>
            <Input type="url" placeholder="Website" className="pl-11 pr-4 py-8 rounded-full bg-white border border-gray-200 text-base" />
          </div>
          {/* Submit button */}
          <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-8 px-8 flex items-center justify-between transition">
            <span className="px-6">Register Business</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
