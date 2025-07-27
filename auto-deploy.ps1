# Blood Management System - Auto Deployment Script
Write-Host "🚀 Blood Management System - Auto Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host ""
Write-Host "🎯 DEPLOYMENT STEPS:" -ForegroundColor Magenta
Write-Host "1. Backend will be deployed to Render" -ForegroundColor White
Write-Host "2. Frontend will be deployed to Vercel" -ForegroundColor White
Write-Host ""

# Set location
Set-Location "c:\Users\quick\Documents\blood-management-system\blood-management-system"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Deploy Frontend to Vercel
Write-Host "🌐 Starting Frontend Deployment to Vercel..." -ForegroundColor Green
Write-Host "Please follow the prompts:" -ForegroundColor Yellow
Write-Host ""

# Navigate to frontend directory
Set-Location "frontend/blood-management-frontend"

# Login to Vercel (this will open browser)
Write-Host "🔐 Logging into Vercel..." -ForegroundColor Yellow
vercel login

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Frontend deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Copy your Vercel URL" -ForegroundColor White
Write-Host "2. Go to render.com and deploy backend" -ForegroundColor White
Write-Host "3. Use the environment variables from DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"