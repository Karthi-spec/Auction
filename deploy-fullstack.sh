#!/bin/bash

echo "🚀 Deploying Full-Stack IPL Auction System..."
echo

echo "📦 Installing dependencies..."
node install-server.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo
echo "🏗️ Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo
echo "🔧 Building server..."
npm run server:build
if [ $? -ne 0 ]; then
    echo "❌ Server build failed"
    exit 1
fi

echo
echo "✅ Build completed successfully!"
echo
echo "🎯 To start the application:"
echo "   npm run dev     - Development mode"
echo "   npm run start   - Production mode"
echo
echo "📡 Server will run on: http://localhost:5000"
echo "🌐 Frontend will run on: http://localhost:3000"
echo