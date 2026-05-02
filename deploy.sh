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
  
  # 3. Create a temporary env-vars file for Cloud Run
  echo "🔐 Preparing environment variables for Cloud Run..."
  ENV_YAML="env-vars.yaml"
  echo "# Generated env vars" > $ENV_YAML
  
  # Parse .env.local and format as YAML (key: value)
  # This avoids shell quoting issues with private keys
  grep -v '^#' .env.local | grep -v '^[[:space:]]*$' | while read -r line; do
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
    echo "$key: \"$value\"" >> $ENV_YAML
  done

  # 4. Deploy the pre-built image to Cloud Run using the env-vars file
  gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 9090 \
    --env-vars-file $ENV_YAML
    
  # Clean up the sensitive YAML file
  rm $ENV_YAML
    
  echo "🏁 Deployment finished successfully!"
  echo "✨ Your environment variables have been securely synchronized with Cloud Run."
else
  echo "❌ Build failed. Please check the logs above."
  exit 1
fi
