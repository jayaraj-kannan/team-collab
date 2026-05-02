#!/bin/bash

# Configuration
PROJECT_ID="pw-2026"
SERVICE_NAME="team-sync"
REGION="us-central1"

# 1. Check for environment file
if [ -f .env.local ]; then
  echo "📄 Found .env.local file. Proceeding with deployment..."
else
  echo "❌ .env.local file not found! Please create it before deploying."
  exit 1
fi

# 2. Build the Docker image and push to Container Registry
# Next.js standalone does not need build-time substitutions for backend secrets!
echo "🏗️  Starting Cloud Build for $PROJECT_ID..."

gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Deploying to Cloud Run..."
  
  # 3. Deploy the pre-built image to Cloud Run
  gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 9090
    
  echo "🏁 Deployment finished!"
  echo ""
  echo "⚠️  IMPORTANT: Next.js backend variables (like FIREBASE_PRIVATE_KEY) contain newlines and quotes."
  echo "⚠️  Injecting them directly via bash substitutions is highly unstable and unsecure."
  echo "⚠️  Please navigate to the Google Cloud Run Console for '$SERVICE_NAME' -> Edit & Deploy New Revision -> Variables & Secrets"
  echo "⚠️  and paste the contents of your .env.local file there to make the app function correctly in production."
else
  echo "❌ Build failed. Please check the logs above."
  exit 1
fi
