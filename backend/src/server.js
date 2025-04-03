const app = require('./app');
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');

dotenv.config();

const startServer = () => {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        resolve(server);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Trying again...`);
          setTimeout(() => {
            server.close();
            startServer().catch(reject);
          }, 1000);
        } else {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

startServer()
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
