Write-Host "🚀 Blood Management System - Frontend Deployment" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
vercel --version

Write-Host ""
Write-Host "📁 Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location "c:\Users\quick\Documents\blood-management-system\blood-management-system\frontend\blood-management-frontend"

Write-Host ""
Write-Host "🔐 Login to Vercel (browser will open)..." -ForegroundColor Green
vercel login

Write-Host ""
Write-Host "🚀 Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "Copy your Vercel URL and proceed to backend deployment on Render" -ForegroundColor Cyan