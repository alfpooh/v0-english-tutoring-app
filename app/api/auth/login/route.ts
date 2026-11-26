import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  ConfigError,
  SESSION_COOKIE,
  TEST_OTP,
  createOtpToken,
  createSessionToken,
  generateOtp,
  isTestOtpAllowed,
  sessionCookieOptions,
  verifyOtpToken,
} from "@/lib/auth"

const isProduction = process.env.NODE_ENV === "production"

export async function POST(req: Request) {
  try {
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 })
    }

    const { action, otp, otpHash } = body
    const email = typeof body.email === "string" ? body.email.trim() : ""

    if (action === "request-otp") {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "유효한 이메일 주소를 입력해주세요." }, { status: 400 })
      }

      const generatedOtp = generateOtp()
      const resendApiKey = process.env.RESEND_API_KEY
      let emailSent = false

      if (resendApiKey) {
        try {
          const result = await new Resend(resendApiKey).emails.send({
            from: process.env.RESEND_FROM || "English Tutor <onboarding@resend.dev>",
            to: email,
            subject: "English Tutor 인증 코드",
            html: `<p>인증 코드는 <strong>${generatedOtp}</strong> 입니다.</p><p>이 코드는 5분간 유효합니다.</p>`,
          })
          if (result.error) {
            console.error("[auth] Resend API error:", result.error)
          } else {
            emailSent = true
          }
        } catch (emailError) {
          console.error("[auth] Failed to send email:", emailError)
        }
      }

      // Never write OTPs to production logs.
      if (!emailSent && !isProduction) {
        console.log(`[auth] (dev) OTP for ${email}: ${generatedOtp}`)
      }

      if (!emailSent && !isTestOtpAllowed()) {
        return NextResponse.json(
          { error: "인증 코드 이메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요." },
          { status: 502 },
        )
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "인증 코드가 이메일로 발송되었습니다."
          : `이메일을 보내지 못했습니다. 테스트 코드 ${TEST_OTP}를 사용하세요.`,
        otpHash: await createOtpToken(generatedOtp, email),
      })
    }

    if (action === "verify-login") {
      if (typeof otp !== "string" || !email || typeof otpHash !== "string") {
        return NextResponse.json({ error: "모든 정보를 입력해주세요." }, { status: 400 })
      }

      const isTestLogin = isTestOtpAllowed() && otp === TEST_OTP
      if (!isTestLogin) {
        const check = await verifyOtpToken(otp, email, otpHash)
        if (check === "expired") {
          return NextResponse.json({ error: "인증 코드가 만료되었습니다. 다시 요청해주세요." }, { status: 401 })
        }
        if (check !== "ok") {
          return NextResponse.json({ error: "인증 코드가 올바르지 않습니다." }, { status: 401 })
        }
      }

      const res = NextResponse.json({ success: true })
      res.cookies.set(SESSION_COOKIE, await createSessionToken(email), sessionCookieOptions)
      return res
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  } catch (error) {
    console.error("[auth] Auth error:", error)
    const message =
      error instanceof ConfigError ? "서버 설정 오류입니다. 관리자에게 문의해주세요." : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
