@echo off
cd /d "d:\my stuff\mypj\ecommerce\backend"
echo Starting E-commerce Backend Server...
echo Current directory: %CD%
echo.
npx ts-node src/index.ts
pause