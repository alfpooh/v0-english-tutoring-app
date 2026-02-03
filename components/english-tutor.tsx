"use client"

import { useConversation } from "@elevenlabs/react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mic, MicOff, Volume2, AlertCircle, Loader2, Star, BookOpen, Lightbulb, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { type Language, t } from "@/lib/i18n"

interface EnglishTutorProps {
  language: Language
}

interface Evaluation {
  proficiency: string
  summary: string
  advice: string
}

interface VocabularyWord {
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
}

export function EnglishTutor({ language }: EnglishTutorProps) {
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [vocabulary, setVocabulary] = useState<VocabularyWord | null>(null)

  const playPronunciation = useCallback(async (word: string) => {
    try {
      const response = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      })
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (err) {
      console.error("Failed to play pronunciation:", err)
    }
  }, [])

  const conversation = useConversation({
    onConnect: () => setConnectionStatus("connected"),
    onDisconnect: () => setConnectionStatus("disconnected"),
    onError: (err) => {
      console.error("Conversation error:", err)
      setError(typeof err === "string" ? err : t(language, "conversationError"))
      setConnectionStatus("disconnected")
    },
    onModeChange: (mode) => {
      // Handle mode change if needed (speaking/listening)
    },
    clientTools: {
      showVocabulary: async (data: any) => {
        console.log("Received vocabulary:", data)
        setVocabulary({
          word: typeof data.word === "string" ? data.word : "",
          pronunciation: typeof data.pronunciation === "string" ? data.pronunciation : "",
          partOfSpeech: typeof data.partOfSpeech === "string" ? data.partOfSpeech : "",
          definition: typeof data.definition === "string" ? data.definition : "",
          example: typeof data.example === "string" ? data.example : "",
        })
        return "Vocabulary displayed."
      },
      reportEvaluation: async (data: any) => {
        console.log("Received evaluation:", data)
        setEvaluation({
          proficiency: typeof data.proficiency === "string" ? data.proficiency : t(language, "evaluationUnavailable"),
          summary: typeof data.summary === "string" ? data.summary : t(language, "summaryUnavailable"),
          advice: typeof data.advice === "string" ? data.advice : t(language, "adviceUnavailable"),
        })
        setIsFeedbackOpen(true)
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
      setVocabulary(null)

      await navigator.mediaDevices.getUserMedia({ audio: true })

      const response = await fetch("/api/signed-url")
      if (!response.ok) {
        throw new Error("Failed to get signed URL")
      }
      const { signedUrl } = await response.json()

      await conversation.startSession({ signedUrl })
    } catch (err) {
      console.error("Failed to start conversation:", err)
      setError(t(language, "cannotStartConversation"))
      setConnectionStatus("disconnected")
    }
  }, [conversation, language])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-4 gap-4">
      <AnimatePresence>
        {vocabulary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Card className="w-full border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-5 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-zinc-500 hover:text-white"
                  onClick={() => setVocabulary(null)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">{vocabulary.word}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm font-mono">{vocabulary.pronunciation}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      onClick={() => playPronunciation(vocabulary.word)}
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-zinc-500 text-sm mb-2">{vocabulary.partOfSpeech}</p>
                <p className="text-white text-base mb-4">{vocabulary.definition}</p>
                <p className="text-zinc-400 text-sm italic">"{vocabulary.example}"</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">{t(language, "englishTutor")}</CardTitle>
          <CardDescription className="text-zinc-400">{t(language, "tutorDescription")}</CardDescription>
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
                  <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping" />
                  <div className="absolute w-20 h-20 bg-indigo-500/30 rounded-full animate-pulse delay-75" />
                  <div className="w-16 h-16 bg-indigo-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center z-10">
                    <Mic className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <p className="absolute -bottom-12 text-indigo-300 font-medium text-sm">{t(language, "listening")}</p>
                </motion.div>
              ) : connectionStatus === "connecting" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-2" />
                  <p className="text-zinc-500 text-sm">{t(language, "connecting")}</p>
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
                  {t(language, "endSession")}
                </Button>
                <p className="text-xs text-zinc-500 text-center animate-pulse">{t(language, "tipGoodbye")}</p>
              </>
            ) : (
              <Button
                onClick={startConversation}
                disabled={connectionStatus === "connecting"}
                size="lg"
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-lg transition-all"
              >
                {connectionStatus === "connecting" ? t(language, "starting") : t(language, "startSession")}
              </Button>
            )}
          </div>

          <p className="text-xs text-zinc-600 text-center">{t(language, "producedBy")}</p>
        </CardContent>
      </Card>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              {t(language, "sessionReport")}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">{t(language, "aiAnalysis")}</DialogDescription>
          </DialogHeader>

          {evaluation && (
            <div className="space-y-6 py-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    {t(language, "proficiency")}
                  </Badge>
                </div>
                <p className="text-lg font-medium text-white">{evaluation.proficiency}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>{t(language, "summary")}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{evaluation.summary}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{t(language, "advice")}</span>
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
