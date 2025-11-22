"use client"

import { useConversation } from "@elevenlabs/react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mic, MicOff, Volume2, AlertCircle, Loader2, Star, BookOpen, Lightbulb } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Evaluation {
  proficiency: string
  summary: string
  advice: string
}

export function EnglishTutor() {
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const conversation = useConversation({
    onConnect: () => setConnectionStatus("connected"),
    onDisconnect: () => setConnectionStatus("disconnected"),
    onError: (err) => {
      console.error("Conversation error:", err)
      setError(typeof err === "string" ? err : "대화 중 오류가 발생했습니다.")
      setConnectionStatus("disconnected")
    },
    onModeChange: (mode) => {
      // Handle mode change if needed (speaking/listening)
    },
    clientTools: {
      reportEvaluation: async (data: any) => {
        console.log("Received evaluation:", data)
        // Ensure data fields are strings
        setEvaluation({
          proficiency: typeof data.proficiency === "string" ? data.proficiency : "평가 불가",
          summary: typeof data.summary === "string" ? data.summary : "요약 불가",
          advice: typeof data.advice === "string" ? data.advice : "조언 불가",
        })
        setIsFeedbackOpen(true)
        // Use setTimeout to allow the state to update before ending
        setTimeout(async () => {
          await conversation.endSession()
        }, 500)
        return "Evaluation received. Ending session."
      },
    },
  })

  const startConversation = useCallback(async () => {
    try {
      setConnectionStatus("connecting")
      setError(null)

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Get signed URL from our backend
      const response = await fetch("/api/signed-url")
      if (!response.ok) {
        throw new Error("Failed to get signed URL")
      }
      const { signedUrl } = await response.json()

      // Connect to ElevenLabs
      await conversation.startSession({ signedUrl })
    } catch (err) {
      console.error("Failed to start conversation:", err)
      setError("대화를 시작할 수 없습니다. 마이크 권한을 확인하고 다시 시도해주세요.")
      setConnectionStatus("disconnected")
    }
  }, [conversation])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-4">
      <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">영어 튜터</CardTitle>
          <CardDescription className="text-zinc-400">AI 튜터와 함께 영어 회화를 연습해보세요</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          <div className="relative w-full h-32 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {connectionStatus === "connected" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex items-center justify-center"
                >
                  {/* Visualizer Animation */}
                  <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping" />
                  <div className="absolute w-20 h-20 bg-indigo-500/30 rounded-full animate-pulse delay-75" />
                  <div className="w-16 h-16 bg-indigo-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center z-10">
                    <Mic className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <p className="absolute -bottom-12 text-indigo-300 font-medium text-sm">듣고 있습니다...</p>
                </motion.div>
              ) : connectionStatus === "connecting" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-2" />
                  <p className="text-zinc-500 text-sm">연결 중...</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center"
                >
                  <MicOff className="w-8 h-8 text-zinc-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 px-4 py-2 rounded-lg text-sm w-full justify-center border border-red-900/50">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full pt-4 space-y-3">
            {connectionStatus === "connected" ? (
              <>
                <Button
                  onClick={stopConversation}
                  variant="destructive"
                  size="lg"
                  className="w-full font-semibold shadow-lg hover:shadow-red-900/20 transition-all"
                >
                  세션 종료
                </Button>
                <p className="text-xs text-zinc-500 text-center animate-pulse">
                  팁: "Goodbye"라고 말하면 피드백 리포트를 받을 수 있습니다!
                </p>
              </>
            ) : (
              <Button
                onClick={startConversation}
                disabled={connectionStatus === "connecting"}
                size="lg"
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-lg transition-all"
              >
                {connectionStatus === "connecting" ? "시작 중..." : "세션 시작"}
              </Button>
            )}
          </div>

          <p className="text-xs text-zinc-600 text-center">{"Produced by Dr. Alf Bae. 2025\n"} </p>
        </CardContent>
      </Card>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              세션 리포트
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              AI가 분석한 당신의 영어 실력입니다.
            </DialogDescription>
          </DialogHeader>

          {evaluation && (
            <div className="space-y-6 py-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    능숙도
                  </Badge>
                </div>
                <p className="text-lg font-medium text-white">{evaluation.proficiency}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>요약</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{evaluation.summary}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>조언</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{evaluation.advice}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
