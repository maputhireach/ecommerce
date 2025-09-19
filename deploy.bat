@echo off
REM Deployment script for ecommerce project (Windows)
echo 🚀 Starting deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Run this script from the project root.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed!
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed!
    cd ..
    exit /b 1
)
cd ..

REM Build backend
echo 🔨 Building backend...
cd backend
npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    cd ..
    exit /b 1
)
cd ..

REM Build frontend
echo 🔨 Building frontend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo ✅ Deployment build completed successfully!
echo 📝 Next steps:
echo    1. Push your code to GitHub
echo    2. Check GitHub Actions for deployment status
echo    3. Configure your backend deployment
echo    4. Update CORS settings with your frontend URL

pause