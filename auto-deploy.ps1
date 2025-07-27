# Blood Management System - Auto Deploy Script
Write-Host "🚀 Starting Blood Management System Deployment..." -ForegroundColor Green

# Step 1: Navigate to project directory
Set-Location "c:\Users\quick\Documents\blood-management-system\blood-management-system"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Step 2: Check if Railway CLI is installed
Write-Host "🔍 Checking Railway CLI..." -ForegroundColor Yellow
try {
    railway --version
    Write-Host "✅ Railway CLI found!" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Please install Railway CLI manually from: https://docs.railway.app/develop/cli" -ForegroundColor Yellow
    exit 1
}

# Step 3: Login to Railway (if not already logged in)
Write-Host "🔐 Checking Railway login status..." -ForegroundColor Yellow
railway whoami

# Step 4: Deploy backend
Write-Host "🚀 Deploying backend to Railway..." -ForegroundColor Green
Set-Location "backend"

# Create railway.json for configuration
$railwayConfig = @{
    "build" = @{
        "builder" = "NIXPACKS"
        "buildCommand" = "npm install"
    }
    "deploy" = @{
        "startCommand" = "npm start"
        "restartPolicyType" = "ON_FAILURE"
        "restartPolicyMaxRetries" = 10
    }
} | ConvertTo-Json -Depth 3

$railwayConfig | Out-File -FilePath "railway.json" -Encoding UTF8

Write-Host "📝 Created railway.json configuration" -ForegroundColor Yellow

# Deploy to Railway
railway up

Write-Host "✅ Backend deployment initiated!" -ForegroundColor Green
Write-Host "🌐 Check your Railway dashboard for deployment status" -ForegroundColor Yellow

# Step 5: Get Railway URL
Write-Host "🔗 Getting Railway URL..." -ForegroundColor Yellow
$railwayUrl = railway domain

if ($railwayUrl) {
    Write-Host "✅ Railway URL: $railwayUrl" -ForegroundColor Green
    
    # Step 6: Update frontend environment
    Write-Host "🔄 Updating frontend environment..." -ForegroundColor Yellow
    Set-Location "../frontend/blood-management-frontend"
    
    $envContent = @"
VITE_API_URL=$railwayUrl/api
VITE_APP_NAME=Blood Management System
VITE_APP_VERSION=1.0.0
"@
    
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ Frontend environment updated!" -ForegroundColor Green
    
    # Step 7: Deploy frontend to Vercel
    Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Green
    vercel --prod --yes
    
    Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "Frontend: Check Vercel dashboard" -ForegroundColor Yellow
    Write-Host "Backend: $railwayUrl" -ForegroundColor Yellow
} else {
    Write-Host "❌ Could not get Railway URL. Please check Railway dashboard manually." -ForegroundColor Red
}

Write-Host "✅ Deployment script completed!" -ForegroundColor Green