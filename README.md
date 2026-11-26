# AI English Tutor

ElevenLabs Conversational AI 음성 에이전트와 실시간으로 영어 회화를 연습하는 웹 앱입니다.
이메일 OTP로 로그인한 뒤 마이크로 AI 튜터와 대화하면, 튜터가 문법을 교정하고 새 단어를 **어휘 카드**로 보여주며,
"Goodbye"라고 말하면 **세션 리포트**(능숙도 · 요약 · 조언)를 띄우고 세션을 마칩니다.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/alfpoohs-projects/v0-english-tutoring-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/ej7WVGbqXHE)

> 이 프로젝트는 [v0.app](https://v0.app/chat/ej7WVGbqXHE)에서 만들어졌고, 이제 로컬에서 직접 개발을 이어갑니다.
> v0에서 다시 배포하면 이 저장소에 `v0/...` 브랜치로 변경이 푸시될 수 있으니, 로컬 작업과 섞이지 않게 주의하세요.

상세 기획은 [docs/PRD.md](docs/PRD.md)를 참고하세요. (PRD의 "ID 코드" 2차 인증은 이후 커밋에서 제거되어 현재 코드에는 없습니다.)

---

## 주요 기능

| 기능 | 설명 | 구현 위치 |
|------|------|-----------|
| 이메일 OTP 로그인 | 5자리 코드를 Resend로 메일 발송, 5분 만료 HMAC 토큰으로 검증, 성공 시 세션 쿠키 발급 | `components/login-screen.tsx`, `app/api/auth/login/route.ts`, `lib/auth.ts` |
| 실시간 음성 회화 | ElevenLabs `useConversation` 훅으로 WebSocket 음성 세션 | `components/english-tutor.tsx`, `app/api/signed-url/route.ts` |
| 어휘 카드 | 에이전트가 `showVocabulary` 클라이언트 툴을 호출하면 카드 표시 | `components/english-tutor.tsx` |
| 단어 발음 듣기 | 카드의 🔊 버튼 → ElevenLabs TTS로 mp3 생성 | `app/api/pronunciation/route.ts` |
| 세션 리포트 | 에이전트가 `reportEvaluation` 툴 호출 → 다이얼로그 표시 후 세션 종료 | `components/english-tutor.tsx` |
| UI 다국어 | 영어 · 핀란드어 · 스웨덴어 · 한국어 (UI 문구만, 튜터는 항상 영어) | `lib/i18n.ts`, `components/language-selector.tsx` |

## 기술 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui** (new-york 스타일, Radix UI 기반) · `lucide-react` 아이콘
- **Framer Motion** — 상태 전환 애니메이션
- **@elevenlabs/react** — Conversational AI 클라이언트 SDK
- **Resend** — OTP 이메일 발송
- **@vercel/analytics** — Vercel 배포 분석
- 패키지 매니저: **pnpm** (`pnpm-lock.yaml`)

## 아키텍처

```
브라우저 (app/page.tsx, 단일 페이지 · 클라이언트 컴포넌트)
 ├─ GET /api/auth/session (새로고침 시 로그인 복원)
 ├─ LoginScreen ──POST /api/auth/login──────────► Resend (OTP 메일) → 성공 시 세션 쿠키
 └─ EnglishTutor            (아래 API는 세션 쿠키가 없으면 401)
     ├─ GET /api/signed-url ──────────────────────► ElevenLabs: 에이전트 조회 → signed URL 발급
     ├─ WebSocket (signed URL) ◄──────────────────► ElevenLabs Conversational AI (음성 대화)
     │     └─ 에이전트가 clientTools 호출: showVocabulary / reportEvaluation
     └─ POST /api/pronunciation ──────────────────► ElevenLabs TTS (audio/mpeg)
```

### 화면 흐름

1. `app/page.tsx`가 `isLoggedIn`·`language` 상태를 `useState`로 들고 있습니다. 라우팅은 없고 한 페이지 안에서 로그인 화면 ↔ 튜터 화면을 바꿉니다. 처음 열 때 `/api/auth/session`으로 세션 쿠키가 유효한지 확인해 로그인을 복원합니다.
2. **로그인** — `request-otp` 요청 시 서버가 5자리 OTP를 만들어 메일로 보내고, `<만료시각>.<HMAC>` 형태의 토큰(5분 유효)을 클라이언트에 돌려줍니다. 서버에는 상태를 저장하지 않습니다. `verify-login`이 성공하면 서명된 HttpOnly 쿠키 `tutor_session`(12시간 유효)을 발급합니다. 로직은 모두 `lib/auth.ts`에 있습니다.
3. **세션 시작** — 마이크 권한 요청 → `/api/signed-url`이 세션 쿠키를 확인하고, `ELEVENLABS_AGENT_ID` 또는 이름이 `English Tutor (v0)`인 에이전트를 찾아(메모리 캐시) signed URL을 발급 → `conversation.startSession({ signedUrl })`. 쿠키가 만료되었으면 401을 받고 로그인 화면으로 돌아갑니다.
4. **대화 중** — 에이전트가 클라이언트 툴을 호출하면 React 상태가 바뀌어 어휘 카드/리포트 다이얼로그가 렌더링됩니다.

### ElevenLabs 에이전트 설정

에이전트 설정(프롬프트, 음성, 첫 인사)은 `scripts/setup-agent.mjs` 한 곳에서만 관리합니다.
이 스크립트는 에이전트가 없으면 만들고, 있으면 설정을 업데이트(PATCH)합니다. `/api/signed-url`은 에이전트를 조회만 하고 새로 만들지 않습니다.

```bash
node --env-file=.env.local scripts/setup-agent.mjs
```

새 ElevenLabs 계정에서 시작하거나 프롬프트를 바꾼 뒤에는 이 스크립트를 실행하세요.
ElevenLabs 대시보드에서 에이전트에 `showVocabulary`, `reportEvaluation` **클라이언트 툴**이 등록되어 있는지도 확인하세요.
(프롬프트만으로는 툴이 호출되지 않을 수 있습니다.)

## 프로젝트 구조

```
app/
  page.tsx                 # 메인 페이지 (로그인/튜터 전환, 언어 선택)
  layout.tsx               # 루트 레이아웃, 폰트, 메타데이터, Vercel Analytics
  globals.css              # Tailwind v4 + 테마 토큰 (실제로 사용되는 CSS)
  api/
    auth/login/route.ts    # OTP 발송/검증, 세션 쿠키 발급
    auth/session/route.ts  # 세션 확인(GET) / 로그아웃(DELETE)
    signed-url/route.ts    # ElevenLabs 에이전트 확보 + signed URL 발급
    pronunciation/route.ts # 단어 TTS
components/
  english-tutor.tsx        # 음성 세션, 어휘 카드, 세션 리포트
  login-screen.tsx         # 이메일 → OTP 2단계 로그인 폼
  language-selector.tsx    # UI 언어 드롭다운
  ui/                      # shadcn/ui 컴포넌트
lib/
  auth.ts                  # OTP 토큰, 세션 쿠키 서명/검증 (서버 전용)
  i18n.ts                  # 번역 문자열과 t() 헬퍼
  utils.ts                 # cn() 클래스 병합 헬퍼
scripts/
  setup-agent.mjs          # ElevenLabs 에이전트 생성/업데이트 스크립트
docs/PRD.md                # 제품 요구사항 문서
styles/globals.css         # v0 템플릿 잔여 파일 (현재 import되지 않음)
```

## 로컬 개발 시작하기

### 1. 요구 사항

- Node.js 20 이상 (Node 24에서 빌드 확인)
- pnpm — 설치되어 있지 않다면 `npx pnpm@9 <명령>`으로 대신 실행할 수 있습니다

```bash
corepack enable pnpm
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다. (`.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.)

```bash
cp .env.example .env.local
```

| 변수 | 필수 | 용도 |
|------|------|------|
| `ELEVENLABS_API_KEY` | 예 | 에이전트 관리, signed URL 발급, 발음 TTS |
| `APP_SECRET` | 운영 환경에서 예 | OTP 토큰과 세션 쿠키 서명 키. 운영 환경에서 없으면 로그인이 500 오류로 막힙니다 (`openssl rand -hex 32`로 생성) |
| `RESEND_API_KEY` | 아니오 | OTP 메일 발송. 없으면 개발 서버 콘솔에 OTP가 출력됩니다 |
| `RESEND_FROM` | 아니오 | 발신 주소 (Resend에서 인증한 도메인) |
| `ELEVENLABS_AGENT_ID` | 아니오 | 지정하면 이름으로 에이전트를 찾지 않고 이 ID를 바로 사용 |
| `ALLOW_TEST_OTP` | 아니오 | `true`면 운영 환경에서도 테스트 코드 `12345` 허용. 실제 배포에서는 비워 두세요 |

**테스트 코드 `12345`** 는 개발 서버(`pnpm dev`)에서만 통과합니다. 운영 빌드(`pnpm start`, Vercel)에서는 `ALLOW_TEST_OTP=true`일 때만 허용됩니다.

Resend의 기본 발신 주소 `onboarding@resend.dev`는 Resend 계정 본인 이메일로만 발송됩니다. 다른 사람에게 보내려면 Resend에서 도메인을 인증하고 `RESEND_FROM`을 설정하세요.

### 4. 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)을 열고 이메일을 입력한 뒤 메일(또는 서버 콘솔)에 찍힌 OTP나 테스트 코드 `12345`로 로그인합니다.
마이크 권한이 필요하므로 `localhost` 또는 HTTPS에서 접속하세요.

### 5. 기타 명령

```bash
pnpm build
```

```bash
pnpm start
```

`pnpm lint` 스크립트는 있지만 ESLint 설정 파일과 패키지가 아직 없어 동작하지 않습니다.

## 배포

GitHub `main` 브랜치에 푸시하면 Vercel 프로젝트(`alfpoohs-projects/v0-english-tutoring-app`)가 자동으로 배포합니다.
Vercel 프로젝트 설정의 Environment Variables에 위 환경 변수를 등록하세요. 특히 `APP_SECRET`과 `RESEND_API_KEY`가 없으면 운영 환경에서 로그인할 수 없습니다.

## 알려진 이슈와 개선 과제

**보안**

- [ ] **이전에 커밋된 ElevenLabs API 키를 폐기하세요.** 코드에서는 제거되었지만 Git 히스토리와 공개 저장소에 남아 있으므로, ElevenLabs에서 키를 폐기·재발급하고 새 키를 `.env.local`과 Vercel 환경 변수에 넣어야 합니다.
- [ ] OTP 요청/검증에 횟수 제한(rate limit)이 없습니다. 5분 안에 5자리 코드를 무차별 대입할 수 있으므로 IP·이메일별 제한이 필요합니다 (예: Upstash Redis, Vercel Firewall).
- [ ] 세션 쿠키는 만료 전까지 서버에서 강제로 무효화할 수 없습니다 (상태 없는 서명 쿠키). 필요하면 `APP_SECRET`을 바꿔 모든 세션을 끊을 수 있습니다.
- [ ] 화면에 로그아웃 버튼이 없습니다 (API `DELETE /api/auth/session`은 있음).

**기능/품질**

- [ ] 어휘 정의와 세션 리포트가 UI 언어와 관계없이 항상 한국어로 생성됩니다 (프롬프트에 고정).
- [ ] 언어 선택은 새로고침하면 영어로 초기화됩니다.
- [ ] 여러 의존성이 `latest`로 지정되어 있어(`@elevenlabs/react`, `framer-motion` 등) 설치 시점마다 버전이 달라질 수 있습니다. 버전을 고정하세요.
- [ ] 메타데이터가 v0 기본값(`title: 'v0 App'`)이고 `<html lang="en">`이 고정입니다.
- [ ] 사용하지 않는 패키지(`recharts`, `react-day-picker`, `embla-carousel-react` 등 v0 템플릿 기본값)와 `styles/globals.css` 정리.
- [ ] 테스트 코드와 ESLint 설정이 없습니다.

**해결됨**

- [x] 하드코딩된 ElevenLabs API 키 제거 — 이제 환경 변수만 사용
- [x] 테스트 OTP `12345`를 개발 환경(또는 `ALLOW_TEST_OTP=true`)으로 제한
- [x] 서명된 HttpOnly 세션 쿠키로 `/api/signed-url`, `/api/pronunciation` 보호, 새로고침해도 로그인 유지
- [x] OTP 토큰 5분 만료, 운영 환경에서 `APP_SECRET` 필수, OTP를 운영 로그에 남기지 않음
- [x] 에이전트 설정을 `scripts/setup-agent.mjs` 한 곳으로 통합
- [x] 빌드 시 TypeScript 오류 무시(`ignoreBuildErrors`) 해제

로드맵(학습 기록, 시나리오별 대화, 발음 채점 등)은 [docs/PRD.md](docs/PRD.md)의 "Future Roadmap"을 참고하세요.

---

Produced by Dr. Alf Bae. 2025
