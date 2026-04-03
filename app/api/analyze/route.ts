import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Groq API key not configured" },
      { status: 500 }
    );
  }

  const { trades } = await req.json();

  if (!trades || trades.length === 0) {
    return NextResponse.json(
      { error: "No trades to analyze" },
      { status: 400 }
    );
  }

  const recentTrades = trades.slice(-100);

  const anonymizedData = recentTrades.map((trade: any) => ({
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

  const prompt = `You are an expert trading coach analyzing a trader's journal.

Trading data:
${JSON.stringify(anonymizedData, null, 2)}

Provide a structured analysis with these sections:
1. **Performance Summary** - Win rate, total P/L, average win vs average loss
2. **Best & Worst Trades** - Identify the top 3 and bottom 3 trades with reasons
3. **Patterns** - Any recurring behaviors (time of day, asset, direction bias)
4. **Risk Assessment** - Are they over-leveraging? Inconsistent lot sizes?
5. **Actionable Recommendations** - 3 specific things to improve next week

Be direct and honest. Use numbers from the data to back every point.`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.error?.message || "Groq API error" },
      { status: response.status }
    );
  }

  const result = await response.json();
  return NextResponse.json({ analysis: result.choices[0].message.content });
}
