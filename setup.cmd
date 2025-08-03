@echo off
echo Running MetaMask setup...
npm run test:setup

echo.
echo Running login and tests...
npm run test

pause
