#!/bin/bash
echo "Starting WhatsApp Service..."
cd whatsapp-service
npm start &
echo ""
echo "WhatsApp service started!"
echo "Navigate to http://localhost:8000/whatsapp in your browser"
echo ""
