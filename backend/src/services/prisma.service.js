// backend/src/services/prisma.service.js
const { PrismaClient } = require('@prisma/client');


// Create a singleton instance
const prismaService = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Add this line to see all Prisma queries
});

prismaService.$connect()
    .then(() => console.log('Successfully connected to PostgreSQL database'))
    .catch(e => console.error('Failed to connect to database:', e));

module.exports = prismaService;