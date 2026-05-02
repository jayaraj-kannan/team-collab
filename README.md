# 🚀 Team Sync: Workspace Collab Platform

A premium, high-performance team coordination dashboard built with **Next.js 14**, **Firestore**, and **Google Gemini**. Designed for seamless integration with Google Workspace, Team Sync provides a unified view of your tasks, meetings, and AI-powered insights in a stunning dark-mode interface.

---

## ✨ Key Features

- **🛡️ Google Workspace Auth**: Secure, enterprise-grade login via Google OAuth 2.0.
- **🤖 AI Workspace Assistant**: Context-aware coordination powered by **Google Gemini 1.5 Flash**.
- **📅 Real-time Calendar Sync**: Deep integration with the Google Calendar API for live scheduling.
- **✅ Priority Task Management**: Interactive task tracking with real-time status toggles and animations.
- **💎 Premium Design**: Sleek dark-mode UI with glassmorphism, responsive grid layouts, and custom animations.
- **🧪 100% Code Coverage**: Guaranteed stability with a complete suite of unit tests for all components and logic.
- **🚢 Cloud Run Automation**: Zero-config deployment via Docker and automated `gcloud` orchestration.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Node.js 18+ (React 18)
- **Auth**: NextAuth.js v5 (Beta) + Firebase Adapter
- **Database**: Google Firestore (Firebase Admin SDK)
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Integration**: Google Calendar REST API
- **Testing**: Jest + React Testing Library (100% Coverage)
- **Styling**: Vanilla CSS (CSS Variables + Design Tokens)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18.17+
- A Firebase Project (with Firestore enabled)
- A Google Cloud Project (with OAuth credentials)

### 2. Environment Setup
Create a `.env.local` file in the root:
```bash
cp .env.example .env.local
```
Key requirements:
- `AUTH_SECRET`: Generate with `npx auth secret`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: From Google Cloud APIs
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: Service account details

### 3. Installation
```bash
npm install --legacy-peer-deps
```

### 4. Development
```bash
npm run dev
```
Dashboard available at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Quality Assurance

We maintain **100% line coverage** across the core application. We use Jest with deep mocking of Firebase and Google APIs to ensure lightning-fast test execution.

**Run all tests with coverage:**
```bash
npm test -- --coverage
```

---

## 🚢 Production Deployment

The project is optimized for **Google Cloud Run** using a multi-stage `Dockerfile`.

### Automated Deploy
The provided `deploy.sh` script automates the build and deployment process:
1. Enforces a production build.
2. Injects environment variables securely.
3. Deploys to Cloud Run.

```bash
chmod +x deploy.sh
./deploy.sh
```

### Required APIs
Ensure these APIs are enabled in your Google Cloud Project:
- `artifactregistry.googleapis.com`
- `cloudbuild.googleapis.com`
- `run.googleapis.com`
- `calendar-json.googleapis.com` ([Enable here](https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview))

---

## 🔒 Security Best Practices

- **Secret Management**: Sensitive files like `sa.json` (Service Account) and `cs.json` (OAuth Secret) are excluded from Docker images via `.dockerignore`.
- **Injection**: Environment variables are injected at runtime rather than build time to prevent secret leaking in container logs.
- **Adapters**: Uses the `@auth/firebase-adapter` for secure, server-side session management.

---

## 📁 Architecture
```
├── src/
│   ├── app/              # Next.js Pages & Server Actions
│   ├── components/       # Interactive Client Components
│   ├── lib/              # Firebase Admin & Google API Clients
│   └── auth.ts           # NextAuth v5 Core Logic
├── Dockerfile            # Optimized production image
├── deploy.sh             # Cloud Run deployment wrapper
└── jest.config.ts        # Test runner configuration
```
