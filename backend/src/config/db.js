const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Only set up a real database connection if we're not using mock data
if (process.env.USE_MOCK_DATA !== 'true') {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // If using mock data, create an in-memory SQLite database instead
  console.log('Using in-memory SQLite database for development');
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
}

// Test the connection and handle errors gracefully
const testConnection = async () => {
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Skipping database connection test (using mock data)');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);

    // If we're in development, switch to mock data mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Switching to mock data mode due to database connection failure');
      process.env.USE_MOCK_DATA = 'true';
    }
  }
};

// Run the test, but don't block the application startup
testConnection();

module.exports = sequelize;