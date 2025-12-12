const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const auctionRoutes = require('./routes/auction');
const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');
const mediaRoutes = require('./routes/media');
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGINS || "").split(',')
      : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow Next.js to handle CSP
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGINS || "").split(',')
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (images, videos, logos)
app.use('/static/players', express.static(path.join(__dirname, '../IPL_Player_Photos')));
app.use('/static/videos', express.static(path.join(__dirname, '../Player Video')));
app.use('/static/team-videos', express.static(path.join(__dirname, '../Team videos')));
app.use('/static/logos', express.static(path.join(__dirname, '../Logos')));
app.use('/static/public', express.static(path.join(__dirname, '../public')));

// Initialize database
initializeDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});

// API Routes
app.use('/api/auction', auctionRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/static', mediaRoutes);

// Root route for friendly message
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>IPL Auction API</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>🏏 IPL Auction Backend is Running!</h1>
        <p>This is the API server. The frontend application should be running on port 3000.</p>
        <p><a href="http://localhost:3000">Go to Frontend Website</a></p>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO connection handling
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };