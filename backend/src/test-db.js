// backend/src/test-db.js
// A simple script to test database connection

require('dotenv').config();
const sequelize = require('./config/db');
const { InventoryItem } = require('./models');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
}

async function testModelSync() {
    console.log('🔍 Testing model synchronization...');

    try {
        const { syncDatabase } = require('./config/db-sync');
        await syncDatabase({ force: false });
        console.log('✅ All models were synchronized successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to synchronize models:', error);
        return false;
    }
}

async function testInventoryModel() {
    console.log('🔍 Testing InventoryItem model...');

    try {
        // Get InventoryItem count
        const count = await InventoryItem.count();
        console.log(`✅ Found ${count} inventory items.`);

        // If no items exist, create a test item
        if (count === 0 && process.env.INSERT_TEST_DATA === 'true') {
            console.log('Creating a test inventory item...');
            const testItem = await InventoryItem.create({
                name: 'Test Item',
                type: 'test',
                quantity: 1,
                available: 1,
                condition: 'good'
            });
            console.log('✅ Test item created:', testItem.id);
        }

        return true;
    } catch (error) {
        console.error('❌ Error testing InventoryItem model:', error);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting database tests...');
    console.log('=================================');

    const connOk = await testDatabaseConnection();

    if (connOk) {
        await testModelSync();
        await testInventoryModel();
    } else {
        console.log('ℹ️ Using mock data would be recommended until database is configured.');
    }

    console.log('=================================');
    console.log('🏁 Completed database tests');
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
});