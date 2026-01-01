@echo off
echo Starting WhatsApp Service...
cd whatsapp-service
start "WhatsApp Service" cmd /k "npm start"
cd ..
echo.
echo WhatsApp service started!
echo Navigate to http://localhost:8000/whatsapp in your browser
echo.
pause
