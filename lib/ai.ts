export async function analyzeTrades(tradesData: any[]) {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const anonymizedData = tradesData.map((trade) => ({
    date: trade.date,
    direction: trade.direction,
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    quantity: trade.quantity,
    pl: (trade.direction === "sell"
      ? (trade.entry_price - trade.exit_price) * trade.quantity
      : (trade.exit_price - trade.entry_price) * trade.quantity
    ).toFixed(2),
  }));

  const prompt = `Analyze this trading data and provide insights:

${JSON.stringify(anonymizedData, null, 2)}

Provide: 1. Win rate 2. Best/worst trades 3. Patterns 4. Risk notes 5. Recommendations`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "groq/compound",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Groq API error");
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error: any) {
    console.error("Groq error:", error);
    throw new Error(error.message || "Failed to analyze trades");
  }
}
