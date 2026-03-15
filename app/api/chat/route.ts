import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_BASE = "https://api.groq.com/openai/v1";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a helpful customer support assistant for a garbage route management app. 
You help residents with:
- Garbage and recycling collection schedules
- Route information and changes
- Missed pickups and complaints
- Waste disposal guidelines (what goes in which bin)
- Holiday schedule changes
- Special bulk waste collection requests
- Account and billing queries

Be friendly, concise, and empathetic. If you don't know specific route details, 
ask for the resident's address or area so you can assist better. 
Always aim to resolve issues in as few messages as possible.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
