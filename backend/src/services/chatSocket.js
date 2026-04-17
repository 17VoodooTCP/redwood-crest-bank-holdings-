/**
 * Socket.io Chat Server — real-time messaging with bot + admin takeover
 */
const { Server } = require('socket.io');
const prisma = require('../utils/prisma');
const { getWelcomeMessage, getBotResponse } = require('./chatBot');

// In-memory session tracking for speed
const activeSessions = new Map(); // sessionId -> { socketId, userId, customerName, status, ... }

// Attachment validation limits (same on customer + admin sides)
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB raw
const MAX_DATA_URL_CHARS = Math.ceil(MAX_ATTACHMENT_BYTES * 1.4); // base64 overhead + safety margin
const ALLOWED_ATTACHMENT_TYPES = /^(image\/(png|jpe?g|gif|webp|heic|heif)|application\/pdf)$/i;

/**
 * Validate an attachment payload from the client.
 * Returns { ok: true, attachment } or { ok: false, reason }.
 */
function validateAttachment(att) {
  if (!att) return { ok: true, attachment: null };
  const { url, name, type, size } = att;
  if (typeof url !== 'string' || !url.startsWith('data:')) {
    return { ok: false, reason: 'Invalid attachment data' };
  }
  if (url.length > MAX_DATA_URL_CHARS) {
    return { ok: false, reason: 'File too large (max 5 MB)' };
  }
  if (typeof type !== 'string' || !ALLOWED_ATTACHMENT_TYPES.test(type)) {
    return { ok: false, reason: 'Only images and PDFs are allowed' };
  }
  if (typeof size === 'number' && size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, reason: 'File too large (max 5 MB)' };
  }
  return {
    ok: true,
    attachment: {
      attachmentUrl: url,
      attachmentName: typeof name === 'string' ? name.slice(0, 255) : 'file',
      attachmentType: type,
      attachmentSize: typeof size === 'number' ? size : null,
    }
  };
}

function initChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    // Raise default 1MB payload so base64-encoded 5MB file attachments (~7MB) fit.
    maxHttpBufferSize: 8 * 1024 * 1024
  });

  const customerNs = io.of('/chat');
  const adminNs = io.of('/admin-chat');

  // ── Customer namespace ──────────────────────────────────────────────────
  customerNs.on('connection', (socket) => {
    console.log(`[CHAT] Customer connected: ${socket.id}`);

    // Customer starts a new chat session
    socket.on('chat:start', async (data) => {
      try {
        const { userId, customerName, customerEmail, userAgent } = data || {};

        // Get IP and geolocation
        const ip = socket.handshake.headers['x-forwarded-for']
          || socket.handshake.address
          || '127.0.0.1';
        const cleanIp = ip.replace('::ffff:', '').replace('::1', '127.0.0.1');

        let geo = {};
        try {
          geo = await fetchGeoLocation(cleanIp);
        } catch (e) {
          console.log('[CHAT] Geo lookup skipped:', e.message);
        }

        // Create session in DB
        const session = await prisma.chatSession.create({
          data: {
            userId: userId || null,
            customerName: customerName || 'Guest',
            customerEmail: customerEmail || null,
            status: 'bot',
            ipAddress: cleanIp,
            city: geo.city || null,
            region: geo.region || null,
            country: geo.country || null,
            countryCode: geo.countryCode || null,
            latitude: geo.lat || null,
            longitude: geo.lon || null,
            isp: geo.isp || null,
            userAgent: userAgent || null
          }
        });

        // Track in memory
        activeSessions.set(session.id, {
          socketId: socket.id,
          sessionId: session.id,
          userId,
          customerName: customerName || 'Guest',
          customerEmail,
          status: 'bot',
          ip: cleanIp,
          geo,
          lastActivity: new Date()
        });

        socket.join(session.id);
        socket.sessionId = session.id;

        // Send welcome message
        const welcome = getWelcomeMessage();
        const botMsg = await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: 'bot',
            senderName: 'Redwood Assistant',
            content: welcome.content,
            messageType: 'suggestion',
            suggestions: JSON.stringify(welcome.suggestions)
          }
        });

        socket.emit('chat:message', {
          id: botMsg.id,
          sender: 'bot',
          senderName: 'Redwood Assistant',
          content: welcome.content,
          messageType: 'suggestion',
          suggestions: welcome.suggestions,
          createdAt: botMsg.createdAt
        });

        socket.emit('chat:session', { sessionId: session.id, status: 'bot' });

        // Notify admin namespace of new session
        adminNs.emit('chat:session-update', {
          ...formatSessionForAdmin(session, activeSessions.get(session.id))
        });

      } catch (err) {
        console.error('[CHAT] Start error:', err);
        socket.emit('chat:error', { message: 'Failed to start chat session' });
      }
    });

    // Customer sends a message
    socket.on('chat:message', async (data) => {
      try {
        const { sessionId, content, attachment } = data;
        if (!sessionId) return;

        const sessionData = activeSessions.get(sessionId);
        if (!sessionData) return;

        // Validate attachment (if provided)
        const attResult = validateAttachment(attachment);
        if (!attResult.ok) {
          socket.emit('chat:error', { message: attResult.reason });
          return;
        }

        // Must have either content or an attachment
        const hasText = typeof content === 'string' && content.trim().length > 0;
        if (!hasText && !attResult.attachment) return;

        // Update last activity
        sessionData.lastActivity = new Date();
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { lastActivity: new Date() }
        });

        // Save customer message
        const messageType = attResult.attachment ? 'file' : 'text';
        const custMsg = await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: 'customer',
            senderName: sessionData.customerName,
            content: hasText ? content : '',
            messageType,
            ...(attResult.attachment || {})
          }
        });

        const msgPayload = {
          id: custMsg.id,
          sender: 'customer',
          senderName: sessionData.customerName,
          content: custMsg.content,
          messageType,
          attachmentUrl: custMsg.attachmentUrl,
          attachmentName: custMsg.attachmentName,
          attachmentType: custMsg.attachmentType,
          attachmentSize: custMsg.attachmentSize,
          createdAt: custMsg.createdAt
        };

        // Notify admin (customer shows their own optimistic copy locally)
        adminNs.to(sessionId).emit('chat:message', msgPayload);
        adminNs.emit('chat:activity', { sessionId, lastActivity: new Date() });

        // Bot only reacts to text messages, not file-only sends
        if (sessionData.status === 'bot' && hasText) {
          const botReply = getBotResponse(content);

          // Small delay for natural feel
          setTimeout(async () => {
            try {
              const botMsg = await prisma.chatMessage.create({
                data: {
                  sessionId,
                  sender: 'bot',
                  senderName: 'Redwood Assistant',
                  content: botReply.content,
                  messageType: botReply.suggestions?.length ? 'suggestion' : 'text',
                  suggestions: botReply.suggestions?.length ? JSON.stringify(botReply.suggestions) : null
                }
              });

              const botPayload = {
                id: botMsg.id,
                sender: 'bot',
                senderName: 'Redwood Assistant',
                content: botReply.content,
                messageType: botReply.suggestions?.length ? 'suggestion' : 'text',
                suggestions: botReply.suggestions || [],
                createdAt: botMsg.createdAt
              };

              customerNs.to(sessionId).emit('chat:message', botPayload);
              adminNs.to(sessionId).emit('chat:message', botPayload);

              // If user requested an agent, update status
              if (botReply.action === 'REQUEST_AGENT') {
                sessionData.status = 'waiting';
                await prisma.chatSession.update({
                  where: { id: sessionId },
                  data: { status: 'waiting' }
                });
                adminNs.emit('chat:session-update', {
                  ...formatSessionForAdmin(null, sessionData),
                  id: sessionId,
                  status: 'waiting'
                });
                customerNs.to(sessionId).emit('chat:status', { status: 'waiting' });
              }
            } catch (e) {
              console.error('[CHAT] Bot reply error:', e);
            }
          }, 800);
        }

      } catch (err) {
        console.error('[CHAT] Message error:', err);
      }
    });

    // Customer typing indicator
    socket.on('chat:typing', (data) => {
      if (data?.sessionId) {
        adminNs.to(data.sessionId).emit('chat:typing', {
          sessionId: data.sessionId,
          sender: 'customer'
        });
      }
    });

    socket.on('chat:stop-typing', (data) => {
      if (data?.sessionId) {
        adminNs.to(data.sessionId).emit('chat:stop-typing', {
          sessionId: data.sessionId,
          sender: 'customer'
        });
      }
    });

    // Customer disconnects
    socket.on('disconnect', async () => {
      console.log(`[CHAT] Customer disconnected: ${socket.id}`);
      if (socket.sessionId) {
        const sessionData = activeSessions.get(socket.sessionId);
        if (sessionData) {
          sessionData.status = 'closed';
          try {
            await prisma.chatSession.update({
              where: { id: socket.sessionId },
              data: { status: 'closed' }
            });
          } catch (e) { /* ignore */ }
          adminNs.emit('chat:session-closed', { sessionId: socket.sessionId });
          activeSessions.delete(socket.sessionId);
        }
      }
    });
  });

  // ── Admin namespace ─────────────────────────────────────────────────────
  adminNs.on('connection', (socket) => {
    console.log(`[CHAT] Admin connected: ${socket.id}`);

    // Send all active sessions to admin
    socket.on('chat:get-sessions', async () => {
      try {
        // Get active DB sessions
        const dbSessions = await prisma.chatSession.findMany({
          where: { status: { not: 'closed' } },
          orderBy: { lastActivity: 'desc' },
          include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        const sessions = dbSessions.map(s => {
          const memSession = activeSessions.get(s.id);
          return {
            id: s.id,
            customerName: s.customerName || 'Guest',
            customerEmail: s.customerEmail,
            status: memSession?.status || s.status,
            ipAddress: s.ipAddress,
            city: s.city,
            region: s.region,
            country: s.country,
            countryCode: s.countryCode,
            latitude: s.latitude,
            longitude: s.longitude,
            isp: s.isp,
            lastActivity: memSession?.lastActivity || s.lastActivity,
            createdAt: s.createdAt,
            lastMessage: s.messages[0]?.content || null,
            isOnline: !!memSession
          };
        });

        socket.emit('chat:sessions', sessions);
      } catch (err) {
        console.error('[CHAT] Get sessions error:', err);
      }
    });

    // Admin joins a specific chat session
    socket.on('chat:join', async (data) => {
      const { sessionId } = data;
      socket.join(sessionId);

      try {
        const messages = await prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'asc' }
        });

        socket.emit('chat:history', {
          sessionId,
          messages: messages.map(m => ({
            id: m.id,
            sender: m.sender,
            senderName: m.senderName,
            content: m.content,
            messageType: m.messageType,
            suggestions: m.suggestions ? JSON.parse(m.suggestions) : [],
            attachmentUrl: m.attachmentUrl,
            attachmentName: m.attachmentName,
            attachmentType: m.attachmentType,
            attachmentSize: m.attachmentSize,
            createdAt: m.createdAt
          }))
        });
      } catch (err) {
        console.error('[CHAT] Join error:', err);
      }
    });

    // Admin takes over from bot
    socket.on('chat:takeover', async (data) => {
      const { sessionId, agentName } = data;
      const sessionData = activeSessions.get(sessionId);

      try {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: 'active', agentId: socket.id, agentName: agentName || 'Agent' }
        });

        if (sessionData) {
          sessionData.status = 'active';
          sessionData.agentName = agentName || 'Agent';
        }

        // System message to customer
        const sysMsg = await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: 'system',
            senderName: 'System',
            content: `${agentName || 'An agent'} has joined the chat. You're now speaking with a live representative.`,
            messageType: 'system'
          }
        });

        const sysPayload = {
          id: sysMsg.id,
          sender: 'system',
          senderName: 'System',
          content: sysMsg.content,
          messageType: 'system',
          suggestions: [],
          createdAt: sysMsg.createdAt
        };

        customerNs.to(sessionId).emit('chat:message', sysPayload);
        customerNs.to(sessionId).emit('chat:status', { status: 'active', agentName });
        adminNs.emit('chat:session-update', {
          id: sessionId,
          status: 'active',
          agentName
        });

      } catch (err) {
        console.error('[CHAT] Takeover error:', err);
      }
    });

    // Admin sends a message
    socket.on('chat:message', async (data) => {
      const { sessionId, content, agentName, attachment } = data;
      if (!sessionId) return;

      // Validate attachment (if provided)
      const attResult = validateAttachment(attachment);
      if (!attResult.ok) {
        socket.emit('chat:error', { message: attResult.reason });
        return;
      }

      const hasText = typeof content === 'string' && content.trim().length > 0;
      if (!hasText && !attResult.attachment) return;

      try {
        const messageType = attResult.attachment ? 'file' : 'text';
        const agentMsg = await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: 'agent',
            senderName: agentName || 'Agent',
            content: hasText ? content : '',
            messageType,
            ...(attResult.attachment || {})
          }
        });

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { lastActivity: new Date() }
        });

        const payload = {
          id: agentMsg.id,
          sender: 'agent',
          senderName: agentName || 'Agent',
          content: agentMsg.content,
          messageType,
          suggestions: [],
          attachmentUrl: agentMsg.attachmentUrl,
          attachmentName: agentMsg.attachmentName,
          attachmentType: agentMsg.attachmentType,
          attachmentSize: agentMsg.attachmentSize,
          createdAt: agentMsg.createdAt
        };

        customerNs.to(sessionId).emit('chat:message', payload);
        adminNs.to(sessionId).emit('chat:message', payload);

      } catch (err) {
        console.error('[CHAT] Admin message error:', err);
      }
    });

    // Admin typing indicator
    socket.on('chat:typing', (data) => {
      if (data?.sessionId) {
        customerNs.to(data.sessionId).emit('chat:typing', {
          sessionId: data.sessionId,
          sender: 'agent'
        });
      }
    });

    socket.on('chat:stop-typing', (data) => {
      if (data?.sessionId) {
        customerNs.to(data.sessionId).emit('chat:stop-typing', {
          sessionId: data.sessionId,
          sender: 'agent'
        });
      }
    });

    // Admin closes a session
    socket.on('chat:close', async (data) => {
      const { sessionId } = data;
      try {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: 'closed' }
        });

        const closeMsg = await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: 'system',
            senderName: 'System',
            content: 'This chat session has been closed. Thank you for banking with Redwood Crest!',
            messageType: 'system'
          }
        });

        customerNs.to(sessionId).emit('chat:message', {
          id: closeMsg.id,
          sender: 'system',
          senderName: 'System',
          content: closeMsg.content,
          messageType: 'system',
          suggestions: [],
          createdAt: closeMsg.createdAt
        });
        customerNs.to(sessionId).emit('chat:status', { status: 'closed' });
        adminNs.emit('chat:session-closed', { sessionId });

        activeSessions.delete(sessionId);
      } catch (err) {
        console.error('[CHAT] Close error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[CHAT] Admin disconnected: ${socket.id}`);
    });
  });

  return io;
}

// ── Geolocation helper ────────────────────────────────────────────────────
async function fetchGeoLocation(ip) {
  // Skip localhost/private IPs
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return {
      city: 'Local',
      region: 'Development',
      country: 'Localhost',
      countryCode: 'LC',
      lat: 37.7749,
      lon: -122.4194,
      isp: 'Local Network'
    };
  }

  const http = require('http');
  return new Promise((resolve, reject) => {
    const req = http.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            resolve({
              city: json.city,
              region: json.regionName,
              country: json.country,
              countryCode: json.countryCode,
              lat: json.lat,
              lon: json.lon,
              isp: json.isp
            });
          } else {
            reject(new Error(json.message || 'Geo lookup failed'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('Geo timeout')); });
  });
}

function formatSessionForAdmin(dbSession, memSession) {
  return {
    id: dbSession?.id || memSession?.sessionId,
    customerName: dbSession?.customerName || memSession?.customerName || 'Guest',
    customerEmail: dbSession?.customerEmail || memSession?.customerEmail,
    status: memSession?.status || dbSession?.status || 'bot',
    ipAddress: dbSession?.ipAddress || memSession?.ip,
    city: dbSession?.city || memSession?.geo?.city,
    region: dbSession?.region || memSession?.geo?.region,
    country: dbSession?.country || memSession?.geo?.country,
    countryCode: dbSession?.countryCode || memSession?.geo?.countryCode,
    latitude: dbSession?.latitude || memSession?.geo?.lat,
    longitude: dbSession?.longitude || memSession?.geo?.lon,
    lastActivity: memSession?.lastActivity || dbSession?.lastActivity,
    createdAt: dbSession?.createdAt || new Date(),
    isOnline: !!memSession
  };
}

module.exports = { initChatSocket };
