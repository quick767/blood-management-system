@echo off
echo Starting GitHub deployment...
echo.

REM Navigate to project directory
cd /d "c:\Users\quick\Documents\blood-management-system\blood-management-system"

REM Initialize git repository
echo Initializing Git repository...
git init

REM Add all files
echo Adding all files...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: Blood Management System deployment ready"

REM Set main branch
echo Setting main branch...
git branch -M main

REM Add remote origin
echo Adding remote origin...
git remote add origin https://github.com/quick767/blood-management-system.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo.
echo ✅ SUCCESS! Your Blood Management System has been uploaded to GitHub!
echo 🌐 Repository URL: https://github.com/quick767/blood-management-system
echo.
echo Next steps:
echo 1. Deploy backend to Render
echo 2. Deploy frontend to Vercel
echo 3. Your website will be live!
echo.
pause