const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const prisma = require('./services/prisma.service');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

// Test database connection
prisma.$connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

const app = express();

// Configure CORS with credentials support
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000'], // Angular dev server and production build
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true // Important for cookies/auth
}));

// File uploads setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Load routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Admin routes
const userAdminRoutes = require('./routes/userAdminRoutes');
app.use('/api/admin/users', userAdminRoutes);

// Handle 404s
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Export for server.js
module.exports = app;