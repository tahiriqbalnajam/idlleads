import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import QRCode from 'qrcode';

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json());

const logger = P({ level: 'info' });

let sock = null;
let qr = null;
let connectionState = 'disconnected';
let connectedClients = new Set();

// Store messages in memory (in production, use a database)
const messageStore = new Map();

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    browser: ['Real Estate CRM', 'Chrome', '1.0.0'],
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr: newQr } = update;

    if (newQr) {
      qr = newQr;
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(newQr);
      broadcastToClients({
        type: 'qr',
        qr: qrDataUrl,
        rawQr: newQr
      });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;

      connectionState = 'disconnected';
      broadcastToClients({
        type: 'connection',
        state: 'disconnected'
      });

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      }
    } else if (connection === 'open') {
      connectionState = 'connected';
      qr = null;
      const user = sock.user;
      broadcastToClients({
        type: 'connection',
        state: 'connected',
        user: {
          id: user.id,
          name: user.name
        }
      });
      logger.info('Connected to WhatsApp');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      const messageData = {
        id: msg.key.id,
        remoteJid: msg.key.remoteJid,
        fromMe: msg.key.fromMe,
        message: msg.message,
        messageTimestamp: msg.messageTimestamp,
        pushName: msg.pushName,
        participant: msg.participant,
      };

      // Store message
      if (!messageStore.has(msg.key.remoteJid)) {
        messageStore.set(msg.key.remoteJid, []);
      }
      messageStore.get(msg.key.remoteJid).push(messageData);

      // Broadcast to connected clients
      broadcastToClients({
        type: 'message',
        message: messageData
      });
    }
  });
}

function broadcastToClients(data) {
  const message = JSON.stringify(data);
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  connectedClients.add(ws);
  logger.info('Client connected to WebSocket');

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'connection',
    state: connectionState,
    user: sock?.user || null
  }));

  if (qr) {
    QRCode.toDataURL(qr).then(qrDataUrl => {
      ws.send(JSON.stringify({
        type: 'qr',
        qr: qrDataUrl,
        rawQr: qr
      }));
    });
  }

  ws.on('close', () => {
    connectedClients.delete(ws);
    logger.info('Client disconnected from WebSocket');
  });
});

// REST API Endpoints
app.get('/status', (req, res) => {
  res.json({
    state: connectionState,
    user: sock?.user || null,
    qr: qr
  });
});

app.post('/send-message', async (req, res) => {
  try {
    const { jid, message } = req.body;

    if (!sock || connectionState !== 'connected') {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    if (!jid || !message) {
      return res.status(400).json({ error: 'JID and message are required' });
    }

    const result = await sock.sendMessage(jid, { text: message });
    
    res.json({ 
      success: true, 
      messageId: result.key.id 
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/send-media', async (req, res) => {
  try {
    const { jid, url, caption, type } = req.body;

    if (!sock || connectionState !== 'connected') {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const mediaTypes = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document'
    };

    const result = await sock.sendMessage(jid, {
      [mediaTypes[type] || 'image']: { url },
      caption: caption || ''
    });
    
    res.json({ 
      success: true, 
      messageId: result.key.id 
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/chats', async (req, res) => {
  try {
    if (!sock || connectionState !== 'connected') {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    // Get all chats from store
    const chats = Array.from(messageStore.keys()).map(jid => {
      const messages = messageStore.get(jid);
      const lastMessage = messages[messages.length - 1];
      
      return {
        jid,
        lastMessage,
        unreadCount: 0, // You'd need to track this
        messagesCount: messages.length
      };
    });

    res.json({ chats });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/messages/:jid', async (req, res) => {
  try {
    const { jid } = req.params;
    const messages = messageStore.get(jid) || [];
    
    res.json({ messages });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/request-pairing-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!sock || sock.authState?.creds?.registered) {
      return res.status(400).json({ error: 'Already registered or socket not ready' });
    }

    const code = await sock.requestPairingCode(phoneNumber);
    
    res.json({ 
      success: true, 
      code 
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/check-number', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!sock || connectionState !== 'connected') {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const [result] = await sock.onWhatsApp(phoneNumber);
    
    res.json({ 
      exists: result?.exists || false,
      jid: result?.jid || null
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`WhatsApp service running on port ${PORT}`);
  connectToWhatsApp();
});
