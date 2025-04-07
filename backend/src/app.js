const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sequelize = require('./config/db');


const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

// Routes
const eventRoutes = require('./routes/eventRoutes');
const customerRoutes = require('./routes/customerRoutes');
const itemRoutes = require('./routes/itemRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/items', itemRoutes);

// Database synchronization
sequelize
  .sync({ force: false })
  .then(() => console.log('Database synced'))
  .catch((err) => console.error('Database sync error:', err));

module.exports = app;
