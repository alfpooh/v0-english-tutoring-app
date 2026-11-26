// Server-only auth helpers: OTP tokens and signed session cookies.
// Uses Web Crypto so it works in both Node and Edge runtimes.

export const SESSION_COOKIE = "tutor_session"
export const SESSION_TTL_SECONDS = 60 * 60 * 12 // 12 hours
export const OTP_TTL_SECONDS = 60 * 5 // 5 minutes

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret"

export class ConfigError extends Error {}

function getSecret(): string {
  const secret = process.env.APP_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === "production") {
    throw new ConfigError("APP_SECRET is not configured")
  }
  return DEV_FALLBACK_SECRET
}

/** The fixed test code is accepted only outside production, or when explicitly enabled. */
export function isTestOtpAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_OTP === "true"
}

export const TEST_OTP = "12345"

const encoder = new TextEncoder()

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 90000
  return (10000 + n).toString()
}

/** Opaque token the client holds between "request-otp" and "verify-login": `<expiry>.<hmac>`. */
export async function createOtpToken(otp: string, email: string): Promise<string> {
  const exp = nowSeconds() + OTP_TTL_SECONDS
  const sig = await hmac(`otp:${otp}:${email.toLowerCase()}:${exp}`)
  return `${exp}.${sig}`
}

export type OtpCheck = "ok" | "expired" | "invalid"

export async function verifyOtpToken(otp: string, email: string, token: string): Promise<OtpCheck> {
  const [expStr, sig] = token.split(".")
  const exp = Number(expStr)
  if (!sig || !Number.isFinite(exp)) return "invalid"
  if (exp < nowSeconds()) return "expired"
  const expected = await hmac(`otp:${otp}:${email.toLowerCase()}:${exp}`)
  return safeEqual(expected, sig) ? "ok" : "invalid"
}

/** Session cookie value: `<base64url email>.<expiry>.<hmac>`. */
export async function createSessionToken(email: string): Promise<string> {
  const emailPart = Buffer.from(email.toLowerCase()).toString("base64url")
  const exp = nowSeconds() + SESSION_TTL_SECONDS
  const sig = await hmac(`session:${emailPart}:${exp}`)
  return `${emailPart}.${exp}.${sig}`
}

export async function verifySessionToken(token: string | undefined): Promise<{ email: string } | null> {
  if (!token) return null
  const [emailPart, expStr, sig] = token.split(".")
  const exp = Number(expStr)
  if (!emailPart || !sig || !Number.isFinite(exp) || exp < nowSeconds()) return null
  const expected = await hmac(`session:${emailPart}:${exp}`)
  if (!safeEqual(expected, sig)) return null
  return { email: Buffer.from(emailPart, "base64url").toString() }
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie")
  if (!header) return undefined
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=")
    if (k === name) return decodeURIComponent(v.join("="))
  }
  return undefined
}

/** Returns the session for this request, or null if missing/invalid/expired. */
export async function getSession(req: Request): Promise<{ email: string } | null> {
  try {
    return await verifySessionToken(readCookie(req, SESSION_COOKIE))
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
}
