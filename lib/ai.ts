export async function analyzeTrades(tradesData: any[]) {
  // Anonymize sensitive data before sending
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

  const prompt = `Analyze this trading journal data and provide insights about the trader's performance and patterns:

${JSON.stringify(anonymizedData, null, 2)}

Please provide:
1. Win rate analysis
2. Best and worst performing trades
3. Common patterns in winning and losing trades
4. Risk management observations
5. Specific recommendations for improvement
6. Overall trading psychology insights`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}`,
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

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result[0].generated_text || "Unable to generate analysis";
  } catch (error) {
    console.error("AI Analysis error:", error);
    throw error;
  }
}
