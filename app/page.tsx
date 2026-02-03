"use client"

import { EnglishTutor } from "@/components/english-tutor"
import { LoginScreen } from "@/components/login-screen"
import { LanguageSelector } from "@/components/language-selector"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { type Language, t } from "@/lib/i18n"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [language, setLanguage] = useState<Language>("en")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
      </div>

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm text-zinc-400 text-xs mb-4">
            <Sparkles className="w-3 h-3 mr-2 text-indigo-400" />
            <span>{t(language, "aiBasedLearning")}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-6xl md:text-7xl text-balance">
            {t(language, "heroTitle").includes("AI") ? (
              <>
                {t(language, "heroTitle").split("AI")[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
                {t(language, "heroTitle").split("AI")[1]}
              </>
            ) : (
              t(language, "heroTitle")
            )}
          </h1>
          <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">{t(language, "heroSubtitle")}</p>
        </div>

        {isLoggedIn ? (
          <EnglishTutor language={language} />
        ) : (
          <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} language={language} />
        )}
      </div>
    </main>
  )
}
