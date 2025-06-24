#!/bin/bash

echo "🚀 Deploying An-Nahda Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Backend URL: https://an-nahda-backend.vercel.app"
echo "🧪 Test URL: https://an-nahda-backend.vercel.app/api/payment/test" 