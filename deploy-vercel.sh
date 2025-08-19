#!/bin/bash

# Vercel Deployment Script for MYAUTOVIN.ge
echo "🚀 Starting Vercel deployment for MYAUTOVIN.ge..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project locally first
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deployment."
    exit 1
fi

echo "✅ Local build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure custom domain 'myautovin.ge' in Vercel dashboard"
echo "2. Add environment variables from .env.vercel"
echo "3. Test the application functionality"
echo "4. Update BOG payment URLs if needed"
echo ""
echo "🔗 Your application should be available at the Vercel URL provided above"
