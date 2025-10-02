// pages/login.tsx
import AuthLayout from "@/components/@layouts/AuthLayout";
import Link from "next/link";

export default function Login() {
  return (
    <AuthLayout
      infographic={
        <img
          src="/infographic-login.svg"
          alt="Login Infographic"
          className="max-w-[80%]"
        />
      }
    >
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      <form className="flex flex-col gap-4">
        <label className="font-medium">Email</label>
        <input
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
          type="email"
          placeholder="you@email.com"
          required
        />
        <label className="font-medium">Password</label>
        <input
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
          type="password"
          placeholder="Password"
          required
        />
        <button
          className="w-full py-2 bg-indigo-700 text-white rounded-lg mt-4 hover:bg-indigo-800"
          type="submit"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          New here?{" "}
          <Link href="/signup" className="text-indigo-700 underline">
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
