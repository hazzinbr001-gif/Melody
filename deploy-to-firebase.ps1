# Melody Firebase Deployment Script (Windows PowerShell)
# This script automates the build and deployment process to Firebase Hosting

$ErrorActionPreference = "Stop"

Write-Host "🎵 Melody Firebase Deployment Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
try {
    pnpm --version | Out-Null
} catch {
    Write-Host "❌ pnpm is not installed" -ForegroundColor Red
    Write-Host "Install pnpm with: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check if firebase-tools is installed
try {
    firebase --version | Out-Null
} catch {
    Write-Host "❌ Firebase CLI is not installed" -ForegroundColor Red
    Write-Host "Install Firebase CLI with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
Set-Location $ScriptDir
pnpm install --ignore-scripts
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Building for Firebase..." -ForegroundColor Yellow
Set-Location "$ScriptDir\artifacts\showcase"
npx vite build --config vite.config.firebase.ts
Write-Host "✓ Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Verifying build output..." -ForegroundColor Yellow
if (Test-Path "$ScriptDir\artifacts\showcase\dist\index.html") {
    Write-Host "✓ Build output verified" -ForegroundColor Green
} else {
    Write-Host "❌ Build output not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 4: Deploying to Firebase..." -ForegroundColor Yellow
Set-Location $ScriptDir

# Check if user is logged in to Firebase
try {
    firebase projects:list | Out-Null
} catch {
    Write-Host "You need to authenticate with Firebase" -ForegroundColor Yellow
    firebase login
}

firebase deploy
Write-Host "✓ Deployment completed" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Your site is now live at:"
Write-Host "Check Firebase Console for your hosting URL"
