// backend/src/services/prisma.service.js
const { PrismaClient } = require('@prisma/client');

class PrismaService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Get the Prisma client instance
     */
    getClient() {
        return this.prisma;
    }

    /**
     * Execute code within a transaction
     * @param {Function} callback - Function to execute within the transaction
     */
    async transaction(callback) {
        return this.prisma.$transaction(async (prisma) => {
            return callback(prisma);
        });
    }

    /**
     * Disconnect from the database (useful for tests and graceful shutdown)
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Create a singleton instance
const prismaService = new PrismaClient();

module.exports = prismaService;