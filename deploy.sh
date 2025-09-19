#!/bin/bash

# Deployment script for ecommerce project
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Test the build
echo "🧪 Testing production build..."
npm run preview &
SERVER_PID=$!
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Preview server started successfully"
    kill $SERVER_PID
else
    echo "❌ Preview server failed to start"
    exit 1
fi

echo "✅ Deployment build completed successfully!"
echo "📝 Next steps:"
echo "   1. Push your code to GitHub"
echo "   2. Check GitHub Actions for deployment status"
echo "   3. Configure your backend deployment"
echo "   4. Update CORS settings with your frontend URL"