# Product Requirements Document (PRD)
## AI English Tutor Application

---

## Document Information

| Item | Details |
|------|---------|
| Product Name | AI English Tutor |
| Version | 1.1.0 |
| Last Updated | December 2025 |
| Author | Dr. Alf Bae |
| Status | Production |

---

## 1. Executive Summary

### 1.1 Vision
AI English Tutor는 ElevenLabs Voice Agent 플랫폼을 활용한 실시간 음성 기반 영어 회화 학습 애플리케이션입니다. 사용자는 언제 어디서나 AI 튜터와 자연스러운 영어 대화를 나누며 회화 능력을 향상시킬 수 있습니다.

### 1.2 Mission Statement
> "24시간 이용 가능한 개인 AI 튜터를 통해 누구나 부담 없이 영어 회화를 연습하고 실력을 향상시킬 수 있는 환경을 제공한다."

### 1.3 Key Objectives
- 접근성 높은 영어 회화 연습 환경 제공
- AI 기반 실시간 피드백을 통한 학습 효과 극대화
- 개인화된 학습 평가 및 맞춤형 조언 제공
- 어휘력 향상을 위한 실시간 단어 학습 기능

---

## 2. Product Overview

### 2.1 System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Login Screen│  │  English Tutor  │  │  Vocabulary Card    │  │
│  └──────┬──────┘  └────────┬────────┘  └──────────┬──────────┘  │
│         │                  │                      │              │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ /api/auth/login│  │/api/signed-url │  │/api/pronunciation│   │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘   │
└──────────┼───────────────────┼────────────────────┼─────────────┘
           │                   │                    │
           ▼                   ▼                    ▼
┌──────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│   Resend Email   │  │ ElevenLabs Conv AI  │  │ ElevenLabs TTS  │
└──────────────────┘  └─────────────────────┘  └─────────────────┘
\`\`\`

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | Core application framework |
| **Styling** | Tailwind CSS v4, shadcn/ui | UI components and styling |
| **Animation** | Framer Motion | Smooth UI transitions |
| **Voice AI** | ElevenLabs Conversational AI SDK | Real-time voice conversation |
| **TTS** | ElevenLabs Text-to-Speech | Vocabulary pronunciation |
| **Email** | Resend | OTP delivery |
| **Auth** | Custom HMAC-SHA256 token-based | Secure authentication |

---

## 3. User Stories & Features

### 3.1 User Authentication

#### User Story
> As a user, I want to securely log in using my email and a provided ID code so that I can access the English tutoring session.

#### Feature: Two-Factor Authentication Flow

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Enter Email │ -> │ Receive OTP │ -> │ Enter OTP + │ -> │   Access    │
│             │    │ (5 digits)  │    │ ID Code (4) │    │   Granted   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
\`\`\`

**Acceptance Criteria:**
- [ ] User can enter email address
- [ ] System sends 5-digit OTP to email (or simulates in dev mode)
- [ ] User enters OTP + 4-character ID code
- [ ] System validates both codes before granting access
- [ ] Test mode supports code `12345` with ID `alfb`

### 3.2 AI English Tutoring Session

#### User Story
> As a learner, I want to have a natural voice conversation with an AI tutor so that I can practice my English speaking skills.

#### Feature: Real-time Voice Conversation

**Acceptance Criteria:**
- [ ] User can start/stop conversation session
- [ ] Microphone permission is requested before session
- [ ] Real-time voice input/output with AI tutor
- [ ] Visual feedback shows connection and speaking states
- [ ] AI provides polite grammar corrections
- [ ] AI suggests better vocabulary alternatives

### 3.3 Vocabulary Learning

#### User Story
> As a learner, I want to see definitions and examples of new words introduced during conversation so that I can expand my vocabulary.

#### Feature: Real-time Vocabulary Cards

**Card Display:**
\`\`\`
┌────────────────────────────────────────────────────┐
│ picturesque                    /ˌpɪk.tʃəˈresk/ 🔊 │
│ 형용사                                              │
│                                                    │
│ 그림처럼 아름다운, 생생한                            │
│                                                    │
│ "The village was a picturesque collection of       │
│  stone houses."                                    │
└────────────────────────────────────────────────────┘
\`\`\`

**Acceptance Criteria:**
- [ ] AI triggers vocabulary card when introducing new words
- [ ] Card shows word, pronunciation (IPA), part of speech
- [ ] Definition displayed in Korean
- [ ] Example sentence in English
- [ ] Audio pronunciation button (TTS)
- [ ] Card can be dismissed by user

### 3.4 Session Evaluation

#### User Story
> As a learner, I want to receive a summary and assessment when I end my session so that I can understand my progress and areas for improvement.

#### Feature: Session Report (Korean)

**Report Structure:**
\`\`\`
┌────────────────────────────────────────────────────┐
│ ⭐ 세션 리포트                                       │
├────────────────────────────────────────────────────┤
│ 【능숙도】                                          │
│ 중급 (Intermediate)                                │
├────────────────────────────────────────────────────┤
│ 📖 요약                                             │
│ 오늘 세션에서는 여행 관련 주제로 대화했습니다...       │
├────────────────────────────────────────────────────┤
│ 💡 조언                                             │
│ 전치사 사용에 주의하시면 좋겠습니다...                │
└────────────────────────────────────────────────────┘
\`\`\`

**Acceptance Criteria:**
- [ ] Triggered when user says "goodbye", "bye", or similar
- [ ] Displays proficiency level assessment
- [ ] Provides session summary in Korean
- [ ] Offers personalized improvement advice in Korean
- [ ] Session ends automatically after report

---

## 4. API Specification

### 4.1 Authentication API

#### POST `/api/auth/login`

**Request OTP:**
\`\`\`json
{
  "action": "request-otp",
  "email": "user@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "인증 코드가 발송되었습니다.",
  "otpHash": "hmac_signature_hash"
}
\`\`\`

**Verify Login:**
\`\`\`json
{
  "action": "verify-login",
  "email": "user@example.com",
  "otp": "12345",
  "idCode": "alfb",
  "otpHash": "hmac_signature_hash"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

### 4.2 Voice Agent API

#### GET `/api/signed-url`

**Response:**
\`\`\`json
{
  "signedUrl": "wss://api.elevenlabs.io/v1/convai/conversation?agent_id=xxx&signature=xxx"
}
\`\`\`

### 4.3 Pronunciation API

#### POST `/api/pronunciation`

**Request:**
\`\`\`json
{
  "word": "picturesque"
}
\`\`\`

**Response:** `audio/mpeg` binary stream

---

## 5. AI Agent Configuration

### 5.1 Agent Personality & Behavior

\`\`\`javascript
{
  name: "English Tutor (v0)",
  language: "en",
  voice: "Rachel (21m00Tcm4TlvDq8ikWAM)",
  
  behavior: {
    role: "Helpful and patient English tutor",
    tone: "Encouraging, clear, moderate pace",
    corrections: "Polite grammar corrections with explanations",
    vocabulary: "Suggests better alternatives when appropriate"
  },
  
  tools: {
    showVocabulary: {
      trigger: "When introducing advanced/important words",
      output: "Korean definition with IPA and example"
    },
    reportEvaluation: {
      trigger: "When user indicates session end",
      output: "Korean proficiency assessment and advice"
    }
  }
}
\`\`\`

### 5.2 Client Tools Schema

**showVocabulary:**
| Parameter | Type | Description |
|-----------|------|-------------|
| word | string | English word |
| pronunciation | string | IPA notation |
| partOfSpeech | string | Part of speech (Korean) |
| definition | string | Definition (Korean) |
| example | string | Example sentence (English) |

**reportEvaluation:**
| Parameter | Type | Description |
|-----------|------|-------------|
| proficiency | string | Level assessment (Korean) |
| summary | string | Session summary (Korean) |
| advice | string | Improvement tips (Korean) |

---

## 6. Security Considerations

### 6.1 API Key Protection

| Risk | Mitigation |
|------|------------|
| API key exposure | Server-side only usage via signed URL pattern |
| Client-side leaks | All sensitive operations in API routes |
| Key rotation | Environment variable based configuration |

### 6.2 Authentication Security

| Mechanism | Implementation |
|-----------|----------------|
| OTP Generation | Cryptographically random 5-digit codes |
| Token Signing | HMAC-SHA256 with server secret |
| Stateless Verification | Hash-based token validation |
| ID Code | Secondary factor (currently: `alfb`) |

### 6.3 Data Privacy

- No conversation data stored on server
- OTP codes expire after use
- No user PII stored beyond session

---

## 7. Environment Configuration

### 7.1 Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API authentication | Yes |
| `APP_SECRET` | Token signing secret | Yes |
| `RESEND_API_KEY` | Email service authentication | No* |

*If not provided, OTP is logged to console for testing.

---

## 8. UI/UX Specifications

### 8.1 Design System

**Color Palette:**
| Token | Value | Usage |
|-------|-------|-------|
| Background | `oklch(0.145 0 0)` | Main background |
| Foreground | `oklch(0.985 0 0)` | Primary text |
| Primary | `indigo-500` | Interactive elements |
| Accent | `purple-400` | Gradients, highlights |
| Muted | `zinc-400` | Secondary text |

**Typography:**
| Element | Font | Weight |
|---------|------|--------|
| Headings | Geist | Bold (700) |
| Body | Geist | Regular (400) |
| Code/OTP | Geist Mono | Medium (500) |

### 8.2 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | Centered card |
| Desktop | > 1024px | Centered with max-width |

---

## 9. Future Roadmap

### Phase 2 (Short-term)
- [ ] Learning history persistence
- [ ] Multiple conversation scenarios (Business, Travel, etc.)
- [ ] Difficulty level adjustment
- [ ] Progress tracking dashboard

### Phase 3 (Mid-term)
- [ ] Pronunciation scoring and feedback
- [ ] Real-time grammar error highlighting
- [ ] Spaced repetition vocabulary review
- [ ] Mobile app (React Native)

### Phase 4 (Long-term)
- [ ] Multi-language tutors (Japanese, Chinese, Spanish)
- [ ] Group conversation practice
- [ ] AI-generated lesson plans
- [ ] Integration with language learning platforms

---

## 10. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| OTP | One-Time Password, 5-digit verification code |
| ID Code | 4-character secondary authentication code |
| Signed URL | Time-limited authenticated WebSocket URL |
| Client Tools | Functions AI can invoke on the client |
| IPA | International Phonetic Alphabet |

### B. References

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Resend Email API](https://resend.com/docs)

---

**Document End**
