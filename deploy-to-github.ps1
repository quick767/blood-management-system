# Blood Management System - GitHub Deployment Script
Write-Host "🚀 Starting GitHub deployment..." -ForegroundColor Green
Write-Host ""

# Navigate to project directory
Set-Location "c:\Users\quick\Documents\blood-management-system\blood-management-system"

try {
    # Initialize git repository
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    
    # Add all files
    Write-Host "📄 Adding all files..." -ForegroundColor Yellow
    git add .
    
    # Create initial commit
    Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Blood Management System deployment ready"
    
    # Set main branch
    Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
    git branch -M main
    
    # Add remote origin
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/quick767/blood-management-system.git
    
    # Push to GitHub
    Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Your Blood Management System has been uploaded to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Repository URL: https://github.com/quick767/blood-management-system" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Magenta
    Write-Host "1. Deploy backend to Render" -ForegroundColor White
    Write-Host "2. Deploy frontend to Vercel" -ForegroundColor White
    Write-Host "3. Your website will be live!" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Git is installed and in PATH" -ForegroundColor White
    Write-Host "2. Restart PowerShell/Command Prompt" -ForegroundColor White
    Write-Host "3. Try running commands manually" -ForegroundColor White
}

Read-Host "Press Enter to continue..."