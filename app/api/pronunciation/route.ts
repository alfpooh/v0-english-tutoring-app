import { NextResponse } from "next/server"

const API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(request: Request) {
  try {
    const { word } = await request.json()

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 })
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Use ElevenLabs TTS to generate pronunciation
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: word,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("ElevenLabs TTS error:", error)
      return NextResponse.json({ error: "Failed to generate pronunciation" }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Pronunciation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
