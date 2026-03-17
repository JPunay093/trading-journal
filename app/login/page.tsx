"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Login successful! ✅");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Login</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium"
          >
            Login
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
