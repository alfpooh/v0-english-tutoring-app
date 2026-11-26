import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

// The agent (prompt, voice, client tools) is created and updated by `scripts/setup-agent.mjs`,
// so its configuration lives in one place. This route only looks it up and issues a signed URL.
const AGENT_NAME = "English Tutor (v0)"

// Simple in-memory cache to avoid listing agents on every request
let cachedAgentId: string | null = process.env.ELEVENLABS_AGENT_ID || null

async function findAgentId(apiKey: string): Promise<string | null> {
  if (cachedAgentId) return cachedAgentId

  const listResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
    headers: { "xi-api-key": apiKey },
  })
  if (!listResponse.ok) {
    throw new Error(`Failed to list agents: ${listResponse.status} ${listResponse.statusText}`)
  }

  const data = await listResponse.json()
  const agent = (data.agents || []).find((a: { name?: string }) => a.name === AGENT_NAME)
  cachedAgentId = agent?.agent_id ?? null
  return cachedAgentId
}

export async function GET(req: Request) {
  if (!(await getSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error("[signed-url] ELEVENLABS_API_KEY is not configured")
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 })
  }

  try {
    const agentId = await findAgentId(apiKey)
    if (!agentId) {
      console.error(`[signed-url] Agent "${AGENT_NAME}" not found. Run scripts/setup-agent.mjs first.`)
      return NextResponse.json({ error: "Tutor agent is not set up" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    )
    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({ signedUrl: data.signed_url })
  } catch (error) {
    console.error("[signed-url] Error getting signed URL:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
