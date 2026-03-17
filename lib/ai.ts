export async function analyzeTrades(tradesData: any[]) {
  const apiKey = process.env.NEXT_PUBLIC_HF_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Hugging Face API key is not configured. Please set NEXT_PUBLIC_HF_API_KEY in environment variables.",
    );
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

  const prompt = `Analyze this trading journal data and provide detailed insights:

${JSON.stringify(anonymizedData, null, 2)}

Provide:
1. Win rate analysis
2. Best and worst performing trades
3. Common patterns in winning trades
4. Common patterns in losing trades
5. Risk management observations
6. Specific recommendations for improvement`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-Small-4-119B-2603",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HF API Error:", errorData);
      throw new Error(
        `API Error: ${response.status} - ${errorData.error || "Unknown error"}`,
      );
    }

    const result = await response.json();

    if (!result[0]?.generated_text) {
      throw new Error(
        "No response generated. Model might be loading, try again in a moment.",
      );
    }

    return result[0].generated_text;
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    throw new Error(
      error.message || "Failed to analyze trades. Check console for details.",
    );
  }
}
