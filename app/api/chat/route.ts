import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Your customized EcoRoute context
    const systemPrompt = `You are EcoBot, the official AI Waste Management Assistant for the Bhilai Municipal Corporation and the EcoRoute platform. Your goal is to help residents properly segregate waste and schedule pickups. 

Knowledge Base:
- Wet Waste: Food scraps, vegetable peels, leaves (Green Bin). Advise composting or handing to daily municipal collectors.
- Dry Waste: Paper, cardboard, clean glass, metal (Blue Bin).
- Plastic Waste: Tell users they do NOT need to throw plastic in the regular trash. They should schedule a dedicated plastic pickup via the EcoRoute Telegram bot or their Resident Dashboard.
- Hazardous/E-Waste: Batteries, medical waste, electronics, chemicals (Red Bin). Drop off at Nehru Nagar Hub or Sector 6 Depot.

Guidelines: 
- Keep your answers short, friendly, and direct (under 3 sentences).
- Never hallucinate rules outside of this context.
- Always encourage using the EcoRoute app for plastic pickups.`;

    // 2. Using the new Hugging Face Router endpoint
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            { role: "system", "content": systemPrompt },
            { role: "user", "content": message }
          ],
          max_tokens: 150,
          temperature: 0.3,
          stream: false
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hugging Face API Error:", errorBody);
      return NextResponse.json({ error: 'Failed to fetch from Hugging Face API', details: errorBody }, { status: response.status });
    }

    const result = await response.json();
    
    // 3. Parsing the OpenAI-compatible response format
    if (result.choices && result.choices.length > 0 && result.choices[0].message?.content) {
      const generatedText = result.choices[0].message.content.trim();
      return NextResponse.json({ reply: generatedText });
    } else {
      console.error("Unexpected JSON format:", result);
      return NextResponse.json({ error: 'Unexpected response format from Hugging Face API' }, { status: 500 });
    }

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}