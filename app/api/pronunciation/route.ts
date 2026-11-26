import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

const API_KEY = process.env.ELEVENLABS_API_KEY
const MAX_WORD_LENGTH = 64

export async function POST(request: Request) {
  if (!(await getSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { word } = await request.json()

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 })
    }

    // Vocabulary cards hold a single word or short phrase; cap length so the TTS quota can't be drained.
    if (word.length > MAX_WORD_LENGTH) {
      return NextResponse.json({ error: "Word is too long" }, { status: 400 })
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
