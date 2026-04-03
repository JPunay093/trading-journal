"use client";

export const dynamic = "force-dynamic";

import ProtectedRoute from "@/components/ProtectedRoute";
import { analyzeTrades } from "@/lib/ai";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
              AI Trade Analysis
            </h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium self-start sm:self-auto"
            >
              ✕ Back to Dashboard
            </Link>
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md mb-6">
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
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Your Analysis
              </h2>
              <div className="prose prose-sm max-w-none text-gray-800">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-bold mt-3 mb-2" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-base font-bold mt-2 mb-1"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc list-inside mb-3 ml-4"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal list-inside mb-3 ml-4"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto mb-4">
                        <table
                          className="w-full border-collapse border border-gray-300 text-sm"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-gray-100" {...props} />
                    ),
                    tbody: ({ node, ...props }) => <tbody {...props} />,
                    tr: ({ node, ...props }) => (
                      <tr className="hover:bg-gray-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-gray-300 p-3 font-bold text-left"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 p-3" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-600"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block bg-gray-100 p-3 rounded my-3 overflow-x-auto font-mono text-sm"
                          {...props}
                        />
                      ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-gray-900" {...props} />
                    ),
                  }}
                >
                  {analysis}
                </ReactMarkdown>
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
