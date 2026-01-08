export type Language = "en" | "fi" | "sv" | "ko"

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
]

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    aiBasedLearning: "AI-based language learning",
    heroTitle: "Master English Speaking with AI",
    heroSubtitle: "Practice conversation with your own 24/7 AI tutor, get corrections, and build confidence.",

    // Login screen
    login: "Login",
    enterEmail: "Please enter your email address",
    enterVerification: "Please enter verification info",
    email: "Email",
    getVerificationCode: "Get Verification Code",
    verificationCode: "Verification Code (5 digits)",
    idCode: "ID Code (4 letters)",
    enterIdCode: "Enter ID code",
    start: "Start",
    sendingFailed: "Failed to send verification code.",
    loginFailed: "Login failed.",

    // Tutor screen
    englishTutor: "English Tutor",
    tutorDescription: "Practice English conversation with your AI tutor",
    listening: "Listening...",
    connecting: "Connecting...",
    endSession: "End Session",
    startSession: "Start Session",
    starting: "Starting...",
    tipGoodbye: 'Tip: Say "Goodbye" to receive a feedback report!',
    producedBy: "Produced by Dr. Alf Bae. 2025",
    conversationError: "An error occurred during conversation.",
    cannotStartConversation: "Cannot start conversation. Please check microphone permission and try again.",

    // Feedback dialog
    sessionReport: "Session Report",
    aiAnalysis: "AI analysis of your English skills.",
    proficiency: "Proficiency",
    summary: "Summary",
    advice: "Advice",
    evaluationUnavailable: "Evaluation unavailable",
    summaryUnavailable: "Summary unavailable",
    adviceUnavailable: "Advice unavailable",
  },
  fi: {
    // Header
    aiBasedLearning: "Tekoälypohjainen kielenoppiminen",
    heroTitle: "Hallitse englannin puhuminen tekoälyn avulla",
    heroSubtitle:
      "Harjoittele keskustelua oman 24/7 tekoälyopettajasi kanssa, saa korjauksia ja rakenna itseluottamusta.",

    // Login screen
    login: "Kirjaudu",
    enterEmail: "Anna sähköpostiosoitteesi",
    enterVerification: "Anna vahvistustiedot",
    email: "Sähköposti",
    getVerificationCode: "Hanki vahvistuskoodi",
    verificationCode: "Vahvistuskoodi (5 numeroa)",
    idCode: "ID-koodi (4 kirjainta)",
    enterIdCode: "Anna ID-koodi",
    start: "Aloita",
    sendingFailed: "Vahvistuskoodin lähetys epäonnistui.",
    loginFailed: "Kirjautuminen epäonnistui.",

    // Tutor screen
    englishTutor: "Englannin opettaja",
    tutorDescription: "Harjoittele englannin keskustelua tekoälyopettajan kanssa",
    listening: "Kuuntelee...",
    connecting: "Yhdistetään...",
    endSession: "Lopeta istunto",
    startSession: "Aloita istunto",
    starting: "Käynnistetään...",
    tipGoodbye: 'Vinkki: Sano "Goodbye" saadaksesi palauteraportin!',
    producedBy: "Tuottanut Dr. Alf Bae. 2025",
    conversationError: "Keskustelun aikana tapahtui virhe.",
    cannotStartConversation: "Keskustelua ei voi aloittaa. Tarkista mikrofonin käyttöoikeus ja yritä uudelleen.",

    // Feedback dialog
    sessionReport: "Istuntoraportti",
    aiAnalysis: "Tekoälyn analyysi englannin taidoistasi.",
    proficiency: "Taitotaso",
    summary: "Yhteenveto",
    advice: "Neuvot",
    evaluationUnavailable: "Arviointi ei saatavilla",
    summaryUnavailable: "Yhteenveto ei saatavilla",
    adviceUnavailable: "Neuvot ei saatavilla",
  },
  sv: {
    // Header
    aiBasedLearning: "AI-baserad språkinlärning",
    heroTitle: "Bemästra engelska med AI",
    heroSubtitle: "Öva konversation med din egen 24/7 AI-lärare, få korrigeringar och bygg självförtroende.",

    // Login screen
    login: "Logga in",
    enterEmail: "Ange din e-postadress",
    enterVerification: "Ange verifieringsuppgifter",
    email: "E-post",
    getVerificationCode: "Hämta verifieringskod",
    verificationCode: "Verifieringskod (5 siffror)",
    idCode: "ID-kod (4 bokstäver)",
    enterIdCode: "Ange ID-kod",
    start: "Starta",
    sendingFailed: "Misslyckades att skicka verifieringskod.",
    loginFailed: "Inloggning misslyckades.",

    // Tutor screen
    englishTutor: "Engelsk lärare",
    tutorDescription: "Öva engelska konversation med din AI-lärare",
    listening: "Lyssnar...",
    connecting: "Ansluter...",
    endSession: "Avsluta session",
    startSession: "Starta session",
    starting: "Startar...",
    tipGoodbye: 'Tips: Säg "Goodbye" för att få en feedbackrapport!',
    producedBy: "Producerad av Dr. Alf Bae. 2025",
    conversationError: "Ett fel uppstod under konversationen.",
    cannotStartConversation: "Kan inte starta konversation. Kontrollera mikrofonbehörighet och försök igen.",

    // Feedback dialog
    sessionReport: "Sessionsrapport",
    aiAnalysis: "AI-analys av dina engelskkunskaper.",
    proficiency: "Färdighetsnivå",
    summary: "Sammanfattning",
    advice: "Råd",
    evaluationUnavailable: "Utvärdering ej tillgänglig",
    summaryUnavailable: "Sammanfattning ej tillgänglig",
    adviceUnavailable: "Råd ej tillgängliga",
  },
  ko: {
    // Header
    aiBasedLearning: "AI 기반 언어 학습",
    heroTitle: "AI와 함께 영어 스피킹을 마스터하세요",
    heroSubtitle: "24시간 이용 가능한 나만의 AI 튜터와 함께 회화를 연습하고, 교정하며 자신감을 키우세요.",

    // Login screen
    login: "로그인",
    enterEmail: "이메일 주소를 입력해주세요",
    enterVerification: "인증 정보를 입력해주세요",
    email: "이메일",
    getVerificationCode: "인증 코드 받기",
    verificationCode: "인증 코드 (5자리)",
    idCode: "ID 문자 (4자리)",
    enterIdCode: "ID 문자 입력",
    start: "시작하기",
    sendingFailed: "인증 코드 발송에 실패했습니다.",
    loginFailed: "로그인에 실패했습니다.",

    // Tutor screen
    englishTutor: "영어 튜터",
    tutorDescription: "AI 튜터와 함께 영어 회화를 연습해보세요",
    listening: "듣고 있습니다...",
    connecting: "연결 중...",
    endSession: "세션 종료",
    startSession: "세션 시작",
    starting: "시작 중...",
    tipGoodbye: '팁: "Goodbye"라고 말하면 피드백 리포트를 받을 수 있습니다!',
    producedBy: "Produced by Dr. Alf Bae. 2025",
    conversationError: "대화 중 오류가 발생했습니다.",
    cannotStartConversation: "대화를 시작할 수 없습니다. 마이크 권한을 확인하고 다시 시도해주세요.",

    // Feedback dialog
    sessionReport: "세션 리포트",
    aiAnalysis: "AI가 분석한 당신의 영어 실력입니다.",
    proficiency: "능숙도",
    summary: "요약",
    advice: "조언",
    evaluationUnavailable: "평가 불가",
    summaryUnavailable: "요약 불가",
    adviceUnavailable: "조언 불가",
  },
}

export function t(lang: Language, key: string): string {
  return translations[lang][key] || translations["en"][key] || key
}
