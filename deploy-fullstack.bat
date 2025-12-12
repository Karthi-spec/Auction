@echo off
echo 🚀 Deploying Full-Stack IPL Auction System...
echo.

echo 📦 Installing dependencies...
call node install-server.js
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🏗️ Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo 🔧 Building server...
call npm run server:build
if errorlevel 1 (
    echo ❌ Server build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo 🎯 To start the application:
echo    npm run dev     - Development mode
echo    npm run start   - Production mode
echo.
echo 📡 Server will run on: http://localhost:5000
echo 🌐 Frontend will run on: http://localhost:3000
echo.
pause