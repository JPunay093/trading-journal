export async function analyzeTrades(tradesData: any[]) {
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
