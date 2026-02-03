"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { type Language, t } from "@/lib/i18n"

interface LoginScreenProps {
  onLoginSuccess: () => void
  language: Language
}

export function LoginScreen({ onLoginSuccess, language }: LoginScreenProps) {
  const [step, setStep] = useState<"email" | "verification">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpHash, setOtpHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const cleanEmail = email.trim()
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", email: cleanEmail }),
      })

      const text = await res.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] JSON Parse Error. Status:", res.status, "Response:", text)
        throw new Error(`Server error (${res.status})`)
      }

      if (!res.ok) throw new Error(data.error || t(language, "sendingFailed"))

      if (data.otpHash) {
        setOtpHash(data.otpHash)
      }

      setEmail(cleanEmail)
      setStep("verification")
    } catch (err: any) {
      console.error("[v0] Email submit error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-login",
          email,
          otp,
          otpHash,
        }),
      })

      const text = await res.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] JSON Parse Error. Status:", res.status, "Response:", text)
        throw new Error(`Server error (${res.status})`)
      }

      if (!res.ok) throw new Error(data.error || t(language, "loginFailed"))

      onLoginSuccess()
    } catch (err: any) {
      console.error("[v0] Verify error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-4">
      <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">{t(language, "login")}</CardTitle>
          <CardDescription className="text-zinc-400">
            {step === "email" ? t(language, "enterEmail") : t(language, "enterVerification")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  {t(language, "email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t(language, "getVerificationCode")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-300">{t(language, "verificationCode")}</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={5} value={otp} onChange={(value) => setOtp(value)} className="gap-2">
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-zinc-700 text-white" />
                      <InputOTPSlot index={1} className="border-zinc-700 text-white" />
                      <InputOTPSlot index={2} className="border-zinc-700 text-white" />
                      <InputOTPSlot index={3} className="border-zinc-700 text-white" />
                      <InputOTPSlot index={4} className="border-zinc-700 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t(language, "start")}
              </Button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
