type TradeInput = {
  date: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  quantity: number;
  notes?: string;
};

export async function analyzeTrades(tradesData: TradeInput[]) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trades: tradesData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze trades");
  }

  const { analysis } = await response.json();
  return analysis;
}
