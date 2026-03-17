"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import { supabase } from "../../lib/supabaseClient";

type FormData = {
  date: Date;
  asset: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  quantity: number;
  notes: string;
};

export default function NewTrade() {
  const router = useRouter();
  const { register, handleSubmit, reset, control } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const formattedDate = data.date.toISOString().split("T")[0];

    const { error } = await supabase.from("trades").insert([
      {
        ...data,
        date: formattedDate,
        user_id: user?.id,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Trade saved! ✅");
      reset();
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Trade</h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ✕ Close
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              onChangeRaw={(e: any) => {
                const date = new Date(e.currentTarget.value);
                if (!isNaN(date.getTime())) {
                  field.onChange(date);
                }
              }}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholderText="yyyy-MM-dd"
              required
            />
          )}
        />
        <input
          placeholder="Asset (e.g. AAPL)"
          {...register("asset")}
          className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <select
          {...register("direction")}
          className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Direction</option>
          <option value="buy">Buy (Long)</option>
          <option value="sell">Sell (Short)</option>
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Entry Price"
          {...register("entry_price")}
          className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Exit Price"
          {...register("exit_price")}
          className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="number"
          placeholder="Quantity / Lots"
          {...register("quantity")}
          className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <textarea
          placeholder="Notes / Strategy"
          {...register("notes")}
          className="w-full border border-gray-300 p-3 rounded-lg h-24 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
        >
          Save Trade
        </button>
      </form>
    </div>
  );
}
