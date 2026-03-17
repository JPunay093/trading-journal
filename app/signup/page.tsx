"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for confirmation");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign Up</h1>
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
            onClick={handleSignup}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium"
          >
            Sign Up
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
