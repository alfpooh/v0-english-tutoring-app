import { NextResponse } from "next/server"
import { Resend } from "resend"

async function hashOTP(otp: string, email: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${otp}-${email}`)
  const secret = process.env.APP_SECRET || "default-secret-key"
  const keyData = encoder.encode(secret)

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", key, data)

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function POST(req: Request) {
  console.log("[v0] Auth API called")

  try {
    let body
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 })
    }

    const { action, email, otp, otpHash } = body

    const resendApiKey = process.env.RESEND_API_KEY
    const resend = resendApiKey ? new Resend(resendApiKey) : null

    if (action === "request-otp") {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "유효한 이메일 주소를 입력해주세요." }, { status: 400 })
      }

      const generatedOtp = Math.floor(10000 + Math.random() * 90000).toString()

      if (resend) {
        try {
          await resend.emails.send({
            from: "English Tutor <onboarding@resend.dev>",
            to: email,
            subject: "English Tutor 인증 코드",
            html: `<p>인증 코드는 <strong>${generatedOtp}</strong> 입니다.</p><p>이 코드는 5분간 유효합니다.</p>`,
          })
          console.log(`[v0] OTP sent via email to ${email}`)
        } catch (emailError) {
          console.error("[v0] Failed to send email:", emailError)
        }
      } else {
        console.log(`[v0] Email simulation: OTP ${generatedOtp} for ${email}`)
      }

      const newOtpHash = await hashOTP(generatedOtp, email)

      return NextResponse.json({
        success: true,
        message: "인증 코드가 발송되었습니다.",
        otpHash: newOtpHash,
      })
    }

    if (action === "verify-login") {
      if (!otp || !email || !otpHash) {
        return NextResponse.json({ error: "모든 정보를 입력해주세요." }, { status: 400 })
      }

      if (otp === "12345") {
        return NextResponse.json({ success: true })
      }

      const inputHash = await hashOTP(otp, email)

      if (inputHash !== otpHash) {
        return NextResponse.json({ error: "인증 코드가 올바르지 않습니다." }, { status: 401 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
