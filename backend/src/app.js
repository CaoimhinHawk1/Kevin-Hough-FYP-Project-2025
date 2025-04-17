const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');

const app = express();

// Configure CORS with credentials support
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000'], // Angular dev server and production build
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true // Important for cookies/auth
}));

// File uploads setup
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// API Routes
app.use('/api/auth', authRoutes); // New centralized auth routes
app.use('/api/events', eventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token or not authenticated' });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Database synchronization
sequelize
    .sync({ force: false, alter: process.env.NODE_ENV !== 'production' })
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Database sync error:', err));

module.exports = app;