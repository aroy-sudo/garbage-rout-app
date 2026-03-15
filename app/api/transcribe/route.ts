import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groqForm = new FormData();
    groqForm.append("file", audioFile, "audio.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("response_format", "json");
    groqForm.append("language", "en");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: groqForm,
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("STT API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
