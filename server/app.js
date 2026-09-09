const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const travelPlanRoutes = require('./routes/travelPlanRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const routeRoutes = require('./routes/routeRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const mongoose = require('mongoose');

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:3000'
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development or local testing, allow any localhost/127.0.0.1 port
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Default to allowing the origin rather than throwing an uncaught 500 error
    callback(null, true);
  },
  credentials: true
}));

const isDev = process.env.NODE_ENV === 'development';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 30,
  message: { success: false, message: 'Too many login/register attempts, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDev ? 200 : 30,
  message: { success: false, message: 'Too many AI requests, please try again later.' }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply general rate limiter
app.use(limiter);

// Health check with DB status
app.get('/health', (req, res) => {
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'Server is running',
    service: 'AI-Enabled Tourist Guide API',
    database: dbStatusMap[dbState] || 'unknown',
    databaseConnected: dbState === 1,
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString()
  });
});

// Database connectivity check for API routes
app.use('/api', (req, res, next) => {
  // Routes that can work without database (e.g. guest chat with Groq AI, route geometry)
  const isGuestChat = req.path === '/chat/message' && !req.headers.authorization;
  const isRoutePlan = req.path.startsWith('/routes/plan');

  if (isGuestChat || isRoutePlan) {
    return next();
  }

  // If database is not connected, return clear 503 instead of buffering and timing out
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline or connecting. If using MongoDB Atlas, verify your IP is whitelisted (0.0.0.0/0) in MongoDB Cloud Network Access.',
      databaseStatus: 'disconnected'
    });
  }

  next();
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/travel-plans', travelPlanRoutes);
app.use('/api/recommendations', aiLimiter, recommendationRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/feedback', feedbackRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
