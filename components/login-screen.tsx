"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Key } from "lucide-react"

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<"email" | "verification">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [idCode, setIdCode] = useState("")
  const [otpHash, setOtpHash] = useState("") // New state to store the hash
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
        throw new Error(`서버 오류가 발생했습니다. (${res.status})`)
      }

      if (!res.ok) throw new Error(data.error || "인증 코드 발송에 실패했습니다.")

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
          idCode,
          otpHash,
        }),
      })

      const text = await res.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] JSON Parse Error. Status:", res.status, "Response:", text)
        throw new Error(`서버 오류가 발생했습니다. (${res.status})`)
      }

      if (!res.ok) throw new Error(data.error || "로그인에 실패했습니다.")

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
          <CardTitle className="text-2xl font-bold text-white">로그인</CardTitle>
          <CardDescription className="text-zinc-400">
            {step === "email" ? "이메일 주소를 입력해주세요" : "인증 정보를 입력해주세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  이메일
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
                인증 코드 받기
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-300">인증 코드 (5자리)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="idCode" className="text-zinc-300">
                  ID 문자 (4자리)
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="idCode"
                    type="text"
                    maxLength={4}
                    placeholder="ID 문자 입력"
                    value={idCode}
                    onChange={(e) => setIdCode(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500 uppercase"
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
                시작하기
              </Button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
