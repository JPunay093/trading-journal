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

  const anonymizedData = trades.map((trade: any) => ({
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
        temperature: 0.7,
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
