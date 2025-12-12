@echo off
echo 🌐 Deploying IPL Auction System as Website...
echo.

echo 📦 Installing production dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🏗️ Building for production...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo 🚀 Ready for deployment! Choose your platform:
echo.
echo 1. Railway (Recommended - Easiest)
echo    - Go to railway.app
echo    - Connect your GitHub repository
echo    - Automatic deployment!
echo.
echo 2. Vercel (Great for Next.js)
echo    - Run: npx vercel --prod
echo.
echo 3. Render (Good alternative)
echo    - Go to render.com
echo    - Create web service from GitHub
echo.
echo 4. Manual deployment
echo    - Upload 'out' folder to any web host
echo.
echo 🌐 Your website will be live with:
echo    ✅ Real-time bidding
echo    ✅ 627+ players database
echo    ✅ Professional animations
echo    ✅ Mobile responsive
echo    ✅ Team management
echo.
pause