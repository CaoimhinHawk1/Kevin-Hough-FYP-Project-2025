// backend/server.js
const app = require('./app');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

// Port configuration
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Received shutdown signal, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds if server hasn't closed
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);

  // In production, we might want to restart the process, but for development, keep it alive
  if (process.env.NODE_ENV === 'production') {
    console.log('Exiting due to uncaught exception in production');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);

  // In production, treat unhandled rejections as uncaught exceptions
  if (process.env.NODE_ENV === 'production') {
    console.log('Exiting due to unhandled promise rejection in production');
    process.exit(1);
  }
});

module.exports = server; // Export for testing