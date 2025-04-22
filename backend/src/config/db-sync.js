// backend/src/config/db-sync.js
const sequelize = require('./db');
const { Customer, Event, Item, InventoryItem, User, Task } = require('../models');

/**
 * Synchronize all models with the database
 * This function handles database synchronization with proper error handling
 * and adaptable behavior based on the database dialect
 */
async function syncDatabase(options = {}) {
    const isSQLite = sequelize.options.dialect === 'sqlite';

    console.log(`Synchronizing database models (dialect: ${sequelize.options.dialect})...`);

    try {
        // SQLite has limitations, so let's handle specific models first
        if (isSQLite) {
            console.log('Using SQLite-compatible synchronization approach');

            // Sync models in a specific order to handle foreign keys properly
            try {
                // First, sync models without foreign key dependencies
                await User.sync({ alter: options.alter || false });
                await Customer.sync({ alter: options.alter || false });
                await InventoryItem.sync({ alter: options.alter || false });
                await Item.sync({ alter: options.alter || false });

                // Then, sync models with dependencies
                await Event.sync({ alter: options.alter || false });
                await Task.sync({ alter: options.alter || false });

                console.log('All models synchronized successfully (individual approach)');
            } catch (err) {
                console.error('Error during individual model sync:', err);
                throw err;
            }
        } else {
            // For PostgreSQL, we can use the standard approach
            await sequelize.sync({
                force: options.force || false,
                alter: options.alter || false
            });
            console.log('All models synchronized successfully');
        }

        return true;
    } catch (error) {
        console.error('Error synchronizing database:', error);

        // If in development mode and using real DB, suggest mock data mode
        if (process.env.NODE_ENV === 'development' && !isSQLite) {
            console.log('Consider setting USE_MOCK_DATA=true in .env for development without database setup');
        }

        throw error;
    }
}

module.exports = { syncDatabase };