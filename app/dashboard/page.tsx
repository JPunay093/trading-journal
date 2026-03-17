"use client";

export const dynamic = "force-dynamic";

import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Load user + trades
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });

        setTrades(data || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Calculate P/L and prepare chart data
  const tradesWithPL = trades.map((trade) => ({
    ...trade,
    pl:
      trade.direction === "sell"
        ? (trade.entry_price - trade.exit_price) * trade.quantity
        : (trade.exit_price - trade.entry_price) * trade.quantity,
  }));

  const filteredTrades = tradesWithPL.filter((trade) => {
    if (filterFrom && trade.date < filterFrom) return false;
    if (filterTo && trade.date > filterTo) return false;
    return true;
  });

  const setPreset = (preset: "today" | "week" | "month" | "all") => {
    const today = new Date().toISOString().slice(0, 10);
    if (preset === "today") {
      setFilterFrom(today);
      setFilterTo(today);
    }
    if (preset === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setFilterFrom(d.toISOString().slice(0, 10));
      setFilterTo(today);
    }
    if (preset === "month") {
      const d = new Date();
      d.setDate(1);
      setFilterFrom(d.toISOString().slice(0, 10));
      setFilterTo(today);
    }
    if (preset === "all") {
      setFilterFrom("");
      setFilterTo("");
    }
  };

  const chartData = tradesWithPL.reduce((acc: any[], trade) => {
    const lastTotal = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({
      date: trade.date,
      cumulative: lastTotal + trade.pl,
    });
    return acc;
  }, []);

  const handleExport = () => {
    const csv = Papa.unparse(tradesWithPL);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading)
    return <div className="text-center mt-20">Loading your journal...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Trading Journal
            </h1>
            <div className="flex gap-4">
              <Link
                href="/new-trade"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                + New Trade
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="mb-6 text-sm text-gray-700">
              Logged in as:{" "}
              <span className="font-semibold text-gray-900">{user.email}</span>
            </div>
          )}
          {/* Date Filter */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="flex gap-2">
              {(["today", "week", "month", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium capitalize"
                >
                  {p === "week"
                    ? "This Week"
                    : p === "month"
                      ? "This Month"
                      : p === "all"
                        ? "All Time"
                        : "Today"}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-sm text-gray-800"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-sm text-gray-800"
              />
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Trades
              </p>
              <span className="text-3xl font-bold text-gray-900">
                {filteredTrades.length}
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total P/L
              </p>
              <span className="text-3xl font-bold text-green-600">
                ${filteredTrades.reduce((sum, t) => sum + t.pl, 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-sm font-medium text-gray-500 mb-1">Win Rate</p>
              <span className="text-3xl font-bold text-gray-900">— </span>
              <span className="text-sm text-gray-400">(coming soon)</span>
            </div>
          </div>

          {/* Profit Chart */}
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Equity Curve</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trades Table */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Your Trades</h2>
              <button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Asset
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Direction
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Entry
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Exit
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Qty / Lots
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      P/L
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tradesWithPL.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12 text-gray-500"
                      >
                        No trades yet. Add your first one!
                      </td>
                    </tr>
                  ) : (
                    tradesWithPL.map((trade) => (
                      <tr key={trade.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-800">
                          {trade.date}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {trade.asset}
                        </td>
                        <td
                          className={`px-6 py-4 font-medium ${trade.direction === "buy" ? "text-green-600" : "text-red-600"}`}
                        >
                          {trade.direction?.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-800">
                          ${trade.entry_price}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-800">
                          ${trade.exit_price}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-800">
                          {trade.quantity}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${trade.pl >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${trade.pl.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {trade.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
