# Team Sync (Workspace Collab Platform)

A highly responsive, premium dark-mode team coordination platform that integrates deeply with Google Workspace to manage priorities, tasks, and meetings in a single dashboard. 

## ✨ Key Features

- **Google Workspace Authentication**: Secure login using Google OAuth 2.0.
- **AI Workspace Assistant**: A context-aware assistant powered by **Google Gemini 1.5 Flash** that knows your schedule and tasks.
- **Live Google Calendar Sync**: Real-time integration with Google Calendar to display upcoming meetings and sync sync schedules.
- **Priority Task Management**: Real-time task creation and tracking with a sleek, interactive UI.
- **Firebase Backend Integration**: Dynamic reads and writes directly to Firestore utilizing Next.js Server Actions.
- **Offline Capabilities via NextAuth**: Stores secure refresh tokens for background task execution and calendar synchronization.
- **Modern UI/UX**: Premium dark mode design utilizing raw CSS variables, glassmorphism, and responsive grid layouts.
- **100% Test Coverage**: Complete unit test suite using Jest and React Testing Library for core business logic and UI components.
- **Cloud Run Ready**: Optimized multi-stage Docker builds and automated deployment scripts designed specifically for Google Cloud Run.

## 🛠️ Tech Stack

- **Core**: Next.js 14 (App Router) & React 18
- **Authentication**: NextAuth.js (v5 Beta) + `@auth/firebase-adapter`
- **Database**: Firebase (Firestore) & Firebase Admin SDK
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **APIs**: Google Calendar API (`googleapis`)
- **Styling**: Vanilla CSS Modules with custom Design Tokens
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, `jest-environment-jsdom`
- **Deployment**: Docker, Google Cloud Run (`gcloud`)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18 or later
- A Firebase Project (with Firestore enabled)
- A Google Cloud Project (with OAuth credentials configured)

### 2. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```
You will need:
- `AUTH_SECRET`: Generate one using `npx auth secret`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: From Google Cloud Console
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: From your Firebase Service Account

### 3. Installation
Install the required dependencies using the legacy peer deps flag to ensure perfect React 18 / Next 14 compatibility:
```bash
npm install --legacy-peer-deps
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:9090](http://localhost:9090) with your browser to see the result.

## 🧪 Testing

The project uses Jest for unit testing, heavily mocking server boundaries to ensure fast, isolated tests.
To run the test suite and see the coverage report:
```bash
npm run test:coverage
```

## 🚢 Deployment (Google Cloud Run)

This repository is pre-configured for a zero-downtime deployment to Google Cloud Run. 

1. Ensure the Google Cloud CLI (`gcloud`) is installed and authenticated.
2. Review the settings in `deploy.sh`.
3. Run the deployment script:
```bash
./deploy.sh
```
4. **Important**: After deployment, navigate to your service in the Google Cloud Console and paste the contents of your `.env.local` into the "Variables & Secrets" tab. We do not bake backend secrets into the Docker image for security reasons.

## 📁 Directory Structure
```
├── src/
│   ├── app/              # Next.js App Router (Pages, Layouts, Actions)
│   ├── auth.ts           # NextAuth v5 Configuration
│   ├── components/       # Reusable React components (if applicable)
│   └── lib/              # Firebase Client & Admin initialization
├── public/               # Static assets
├── jest.config.ts        # Test runner configuration
├── Dockerfile            # Multi-stage optimized production image
└── deploy.sh             # Cloud Run deployment wrapper
```
