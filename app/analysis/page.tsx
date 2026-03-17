"use client";

export const dynamic = "force-dynamic";

import ProtectedRoute from "@/components/ProtectedRoute";
import { analyzeTrades } from "@/lib/ai";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Trade = {
  id: string;
  date: string;
  asset: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  quantity: number;
  notes: string;
};

export default function Analysis() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadTrades() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });

        setTrades(data || []);
      }
    }

    loadTrades();
  }, []);

  const handleAnalyze = async () => {
    if (trades.length === 0) {
      setError("You need trades to analyze. Add some trades first!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzeTrades(trades);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Error analyzing trades. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              AI Trade Analysis
            </h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ✕ Back to Dashboard
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md mb-6">
            <p className="text-gray-600 mb-4">
              Analyze your trading patterns with AI. This will examine your
              trades and provide personalized insights.
            </p>

            <button
              onClick={handleAnalyze}
              disabled={loading || trades.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium disabled:bg-gray-400 transition"
            >
              {loading
                ? "Analyzing your trades..."
                : `Analyze ${trades.length} trades`}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {analysis && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Your Analysis
              </h2>
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {analysis}
              </div>
              <button
                onClick={() => setAnalysis("")}
                className="mt-6 text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
