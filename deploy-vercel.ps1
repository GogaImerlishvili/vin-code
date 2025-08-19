# Vercel Deployment Script for MYAUTOVIN.ge (PowerShell)
Write-Host "🚀 Starting Vercel deployment for MYAUTOVIN.ge..." -ForegroundColor Green

# Check if vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Build the project locally first
Write-Host "🔨 Building project locally..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix build errors before deployment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Local build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure custom domain 'myautovin.ge' in Vercel dashboard" -ForegroundColor White
Write-Host "2. Add environment variables from .env.vercel" -ForegroundColor White
Write-Host "3. Test the application functionality" -ForegroundColor White
Write-Host "4. Update BOG payment URLs if needed" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your application should be available at the Vercel URL provided above" -ForegroundColor Green
