# Blood Management System - Frontend Deployment Script
Write-Host "🚀 Blood Management System - Frontend Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Not found"
    }
} catch {
    Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎯 FRONTEND DEPLOYMENT STEPS:" -ForegroundColor Magenta
Write-Host "1. Navigate to frontend directory" -ForegroundColor White
Write-Host "2. Login to Vercel" -ForegroundColor White
Write-Host "3. Deploy to production" -ForegroundColor White
Write-Host ""

# Set location to project root
$projectRoot = "c:\Users\quick\Documents\blood-management-system\blood-management-system"
Set-Location $projectRoot

Write-Host "📁 Project directory: $projectRoot" -ForegroundColor Yellow

# Navigate to frontend directory
$frontendPath = Join-Path $projectRoot "frontend\blood-management-frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "📁 Frontend directory: $frontendPath" -ForegroundColor Yellow
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔐 Step 1: Login to Vercel..." -ForegroundColor Green
Write-Host "This will open your browser for authentication." -ForegroundColor Yellow
Write-Host ""

# Login to Vercel
vercel login

Write-Host ""
Write-Host "🚀 Step 2: Deploying to Vercel..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Deploy to Vercel
vercel --prod

Write-Host ""
Write-Host "✅ Frontend deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Copy your Vercel URL from above" -ForegroundColor White
Write-Host "2. Go to render.com and deploy backend" -ForegroundColor White
Write-Host "3. Use environment variables from DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "4. Update FRONTEND_URL in Render with your Vercel URL" -ForegroundColor White
Write-Host ""
Write-Host "📖 For backend deployment, follow EASY_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

pause