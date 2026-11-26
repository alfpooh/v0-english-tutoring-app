import { NextResponse } from "next/server"
import { SESSION_COOKIE, getSession } from "@/lib/auth"

// GET: is the current browser logged in? Used to restore the session after a reload.
export async function GET(req: Request) {
  const session = await getSession(req)
  return NextResponse.json({ loggedIn: Boolean(session) })
}

// DELETE: log out.
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
