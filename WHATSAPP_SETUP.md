# WhatsApp Integration Setup Guide

This guide will help you set up the WhatsApp messaging functionality using Baileys in your Real Estate CRM.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Laravel application
- WhatsApp account

## Installation Steps

### 1. Install Node.js Service Dependencies

Navigate to the WhatsApp service directory and install dependencies:

```bash
cd whatsapp-service
npm install
```

### 2. Start the WhatsApp Service

In a separate terminal, start the Node.js WhatsApp service:

```bash
cd whatsapp-service
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The service will start on `http://localhost:3001`

### 3. Start Your Laravel Application

Make sure your Laravel application is running:

```bash
php artisan serve
```

### 4. Connect WhatsApp

Navigate to `/whatsapp` in your application. You have two options to connect:

#### Option A: QR Code Method
1. Click "Connect with QR" button
2. Scan the QR code with WhatsApp on your phone:
   - Open WhatsApp
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Scan the QR code

#### Option B: Pairing Code Method
1. Click "Pairing Code" button
2. Enter your phone number (without + or country code prefix, just numbers)
3. A pairing code will be generated
4. On your phone:
   - Open WhatsApp
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Tap "Link with phone number instead"
   - Enter the pairing code

## Features

### ✅ Device Linking
- QR Code authentication
- Pairing code authentication
- Automatic reconnection

### ✅ Messaging
- Send text messages
- Receive messages in real-time
- View chat history
- Start new chats

### ✅ Real-time Updates
- WebSocket connection for instant message delivery
- Live connection status
- Automatic message syncing

## Architecture

```
┌─────────────────┐
│  Laravel App    │
│  (Frontend UI)  │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐      ┌──────────────┐
│  WhatsApp       │      │   WebSocket  │
│  Controller     │◄─────┤   Connection │
│  (Laravel)      │      │   (Real-time)│
└────────┬────────┘      └──────────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│  Node.js        │      ┌──────────────┐
│  WhatsApp       │◄─────┤  WhatsApp    │
│  Service        │      │  Web API     │
│  (Baileys)      │      │  (Baileys)   │
└─────────────────┘      └──────────────┘
```

## API Endpoints

### Laravel Routes (Proxied to Node.js service)

- `GET /whatsapp` - WhatsApp page
- `GET /whatsapp/status` - Get connection status
- `POST /whatsapp/send-message` - Send text message
- `POST /whatsapp/send-media` - Send media message
- `GET /whatsapp/chats` - Get all chats
- `GET /whatsapp/messages/{jid}` - Get messages for a chat
- `POST /whatsapp/request-pairing-code` - Request pairing code
- `POST /whatsapp/logout` - Logout
- `POST /whatsapp/check-number` - Check if number exists

### Node.js Service Endpoints

Direct access (typically not needed):
- `http://localhost:3001/status`
- `http://localhost:3001/send-message`
- WebSocket: `ws://localhost:3001`

## Configuration

### Change WhatsApp Service Port

Edit `whatsapp-service/server.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

### Change Service URL in Laravel

Edit `app/Http/Controllers/WhatsAppController.php`:

```php
private $whatsappServiceUrl = 'http://localhost:3001';
```

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to WhatsApp service
- **Solution:** Make sure the Node.js service is running on port 3001
- **Check:** Run `curl http://localhost:3001/status`

**Problem:** QR code not appearing
- **Solution:** Check WebSocket connection in browser console
- **Solution:** Ensure no firewall is blocking port 3001

### Authentication Issues

**Problem:** QR code expired
- **Solution:** Click "Connect with QR" again to generate a new code

**Problem:** Pairing code not working
- **Solution:** Make sure phone number format is correct (only numbers, no +)
- **Solution:** Try QR code method instead

### Message Issues

**Problem:** Messages not appearing
- **Solution:** Check WebSocket connection
- **Solution:** Refresh the page

**Problem:** Cannot send messages
- **Solution:** Verify connection status is "Connected"
- **Solution:** Check that the recipient number exists on WhatsApp

## File Structure

```
whatsapp-service/
├── server.js           # Main Node.js server with Baileys integration
├── package.json        # Node.js dependencies
├── .gitignore
└── README.md

app/Http/Controllers/
└── WhatsAppController.php  # Laravel controller (proxy to Node.js)

resources/js/pages/whatsapp/
└── index.tsx           # React frontend component

routes/
└── web.php             # Laravel routes
```

## Security Considerations

1. **Authentication Storage**: Session data is stored in `auth_info_baileys/` directory
   - Keep this directory secure
   - Add to `.gitignore` (already done)
   - In production, consider encrypting this data

2. **API Access**: The WhatsApp controller is protected by Laravel's auth middleware
   - Only authenticated users can access

3. **CORS**: The Node.js service has CORS enabled
   - In production, restrict to your domain only

4. **WebSocket**: Currently allows all connections
   - Consider adding authentication for production

## Production Deployment

### Using Process Manager (PM2)

```bash
cd whatsapp-service
npm install -g pm2
pm2 start server.js --name whatsapp-service
pm2 save
pm2 startup
```

### Using Docker

Create `whatsapp-service/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t whatsapp-service .
docker run -d -p 3001:3001 -v $(pwd)/auth_info_baileys:/app/auth_info_baileys whatsapp-service
```

## Advanced Features (Future Enhancements)

Consider implementing:
- [ ] Group messaging support
- [ ] Media file uploads (images, videos, documents)
- [ ] Message templates
- [ ] Bulk messaging
- [ ] Message scheduling
- [ ] Chat assignment to team members
- [ ] Auto-replies
- [ ] Message analytics
- [ ] Integration with Deals/CRM features

## Support

For issues related to:
- **Baileys**: https://github.com/WhiskeySockets/Baileys
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp

## License

This integration uses Baileys, which is licensed under MIT.
