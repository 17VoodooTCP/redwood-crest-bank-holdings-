require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { validateCsrf } = require('./middleware/csrf');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const transferRoutes = require('./routes/transfer');
const payRoutes = require('./routes/pay');
const commandRoutes = require('./routes/command');
const wireRoutes = require('./routes/wire');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const systemRoutes = require('./routes/system');

const http = require('http');
const { initChatSocket } = require('./services/chatSocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Auth rate limiter (stricter) ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// ── CSRF protection (state-changing requests) ──────────────────────────────
// Auth routes are exempt so login/register can set the initial CSRF cookie.
app.use('/accounts', validateCsrf);
app.use('/transfer', validateCsrf);
app.use('/pay', validateCsrf);
app.use('/command', validateCsrf);
app.use('/wire', validateCsrf);
app.use('/user', validateCsrf);
app.use('/messages', validateCsrf);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);
app.use('/transfer', transferRoutes);
app.use('/pay', payRoutes);
app.use('/command', commandRoutes);
app.use('/wire', wireRoutes);
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);
app.use('/system', systemRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Socket.io for live chat ──────────────────────────────────────────────
const io = initChatSocket(server);

server.listen(PORT, () => {
  console.log(`\n🏦 Redwood Crest Bank API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Frontend:    ${process.env.FRONTEND_URL}`);
  console.log(`   Live Chat:   WebSocket enabled\n`);
});

module.exports = app;
