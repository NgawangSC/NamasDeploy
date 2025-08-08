@echo off
REM NAMAS Architecture - cPanel Deployment Script for Windows

echo 🚀 Starting cPanel deployment process...

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ Error: .env.production file not found!
    echo Please create .env.production with your Railway backend URL
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the project for production
echo 🔨 Building project for production...
npm run build:production

REM Check if build was successful
if not exist "build" (
    echo ❌ Build failed! Check for errors above.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo.
echo 📁 Files ready for cPanel upload in the 'build' directory
echo.
echo Next steps:
echo 1. Open your cPanel File Manager
echo 2. Navigate to public_html directory
echo 3. Upload all contents from the 'build' folder
echo 4. Create .htaccess file with the contents from DEPLOYMENT.md
echo 5. Test your website!
echo.
echo 🌟 Deployment preparation complete!
pause