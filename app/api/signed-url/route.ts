import { NextResponse } from "next/server"

// In a production environment, this should be in an environment variable.
// For this demo, we are using the provided key securely on the server side.
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_dbeab933805d8b9b9db19901478b66a02c5f8e67b0e06dd6"
const AGENT_NAME = "English Tutor (v0)"

// Simple in-memory cache to avoid listing agents on every request
let cachedAgentId: string | null = null

async function getOrCreateAgent() {
  if (cachedAgentId) return cachedAgentId

  try {
    // 1. List Agents
    const listResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    })

    if (!listResponse.ok) {
      throw new Error(`Failed to list agents: ${listResponse.statusText}`)
    }

    const data = await listResponse.json()
    const agents = data.agents || []
    const existingAgent = agents.find((a: any) => a.name === AGENT_NAME)

    if (existingAgent) {
      cachedAgentId = existingAgent.agent_id
      return existingAgent.agent_id
    }

    // 2. Create Agent if not found
    console.log("Creating new agent...")
    const createResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: AGENT_NAME,
        conversation_config: {
          agent: {
            prompt: {
              prompt:
                "You are a helpful and patient English tutor. Your goal is to help the user improve their English skills. You correct their grammar politely, suggest better vocabulary, and engage them in interesting conversation. You speak clearly and at a moderate pace. If the user makes a mistake, explain why it is a mistake and offer a correction.",
            },
            first_message:
              "Hello! I am your English tutor. I'm here to help you practice your English. What would you like to talk about today?",
            language: "en",
          },
          tts: {
            // Using a default voice ID (Rachel) if not specified, but usually required.
            // Trying to rely on default or a known ID.
            // "21m00Tcm4TlvDq8ikWAM" is Rachel.
            voice_id: "21m00Tcm4TlvDq8ikWAM",
          },
        },
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create agent: ${errorText}`)
    }

    const createData = await createResponse.json()
    cachedAgentId = createData.agent_id
    return createData.agent_id
  } catch (error) {
    console.error("Error in getOrCreateAgent:", error)
    throw error
  }
}

export async function GET() {
  try {
    const agentId = await getOrCreateAgent()

    if (!agentId) {
      return NextResponse.json({ error: "Failed to get agent ID" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({ signedUrl: data.signed_url })
  } catch (error) {
    console.error("Error getting signed URL:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
