const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const pdf = require('pdf-parse');
const sequelize = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

const KEYWORDS = ['10x', '20x', '30x', '40x', '50x', '60x'];

app.post('/api/parse-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const data = await pdf(req.file.buffer);
    const text = data.text;

    // Extract sentences containing keywords
    const requirements = text
      .split('\n')
      .filter(line => KEYWORDS.some(keyword => line.toLowerCase().includes(keyword))
        .map(line => line.trim())
      );

    res.json({ requirements });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Routes
const eventRoutes = require('./routes/eventRoutes');
const customerRoutes = require('./routes/customerRoutes');
const itemRoutes = require('./routes/itemRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/items', itemRoutes);

// Database synchronization
sequelize
  .sync({ force: false }) // Set `force: true` to drop and recreate tables (use with caution)
  .then(() => console.log('Database synced'))
  .catch((err) => console.error('Database sync error:', err));

module.exports = app;
