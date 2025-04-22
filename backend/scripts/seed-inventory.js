// backend/scripts/seed-inventory.js

/**
 * This script adds sample inventory items to the database
 * Run it with: node scripts/seed-inventory.js
 */

require('dotenv').config();
const prisma = require('../src/services/prisma.service');

const sampleItems = [
    {
        name: '40x60 Marquee',
        type: 'marquee',
        quantity: 3,
        available: 2,
        condition: 'excellent',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        location: 'Warehouse A',
        notes: 'Premium marquee for large events'
    },
    {
        name: '20x30 Marquee',
        type: 'marquee',
        quantity: 5,
        available: 3,
        condition: 'good',
        lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        location: 'Warehouse A',
        notes: 'Standard marquee for medium events'
    },
    {
        name: '10x15 Marquee',
        type: 'marquee',
        quantity: 8,
        available: 5,
        condition: 'fair',
        lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        nextMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
        location: 'Warehouse B',
        notes: 'Small marquee for intimate events'
    },
    {
        name: 'Luxury Portable Toilet',
        type: 'toilet',
        quantity: 10,
        available: 6,
        condition: 'excellent',
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        location: 'Warehouse C',
        notes: 'High-end portable toilets with sink and mirror'
    },
    {
        name: 'Standard Portable Toilet',
        type: 'toilet',
        quantity: 20,
        available: 12,
        condition: 'good',
        lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        nextMaintenance: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), // 70 days from now
        location: 'Warehouse C',
        notes: 'Standard portable toilets for events'
    },
    {
        name: 'Basic Portable Toilet',
        type: 'toilet',
        quantity: 15,
        available: 8,
        condition: 'needs-repair',
        lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        nextMaintenance: new Date(), // Today (urgent)
        location: 'Warehouse C',
        notes: 'Economy portable toilets, several need maintenance'
    },
    {
        name: 'Folding Chairs',
        type: 'furniture',
        quantity: 200,
        available: 150,
        condition: 'good',
        location: 'Warehouse B',
        notes: 'Standard white folding chairs'
    },
    {
        name: 'Round Tables (8 person)',
        type: 'furniture',
        quantity: 30,
        available: 25,
        condition: 'excellent',
        location: 'Warehouse B',
        notes: '6ft round tables'
    },
    {
        name: 'LED String Lights',
        type: 'lighting',
        quantity: 50,
        available: 45,
        condition: 'good',
        location: 'Warehouse A',
        notes: 'Warm white LED string lights'
    },
    {
        name: 'Uplights',
        type: 'lighting',
        quantity: 40,
        available: 35,
        condition: 'fair',
        lastMaintenance: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        nextMaintenance: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
        location: 'Warehouse A',
        notes: 'RGB LED uplights with remote control'
    }
];

async function seedInventory() {
    console.log('Starting inventory seeding process...');

    try {
        // Count existing items
        const existingCount = await prisma.inventoryItem.count();
        console.log(`Found ${existingCount} existing inventory items`);

        if (existingCount > 0) {
            const confirmation = process.argv.includes('--force');
            if (!confirmation) {
                console.log('Database already has inventory items. To add more sample data, run with --force flag.');
                return;
            }
            console.log('--force flag detected, proceeding with seed despite existing data');
        }

        // Create items
        let createdCount = 0;

        for (const item of sampleItems) {
            // Log the item being created
            console.log(`Creating item: ${JSON.stringify(item.name)}`);

            // Create the item with explicit data object
            await prisma.inventoryItem.create({
                data: {
                    name: item.name,
                    type: item.type,
                    quantity: item.quantity,
                    available: item.available,
                    condition: item.condition,
                    lastMaintenance: item.lastMaintenance || null,
                    nextMaintenance: item.nextMaintenance || null,
                    location: item.location || null,
                    notes: item.notes || null,
                    imageUrl: item.imageUrl || null
                }
            });

            createdCount++;
            console.log(`Created inventory item: ${item.name}`);
        }

        console.log(`Seeding complete: ${createdCount} inventory items created`);
    } catch (error) {
        console.error('Error seeding inventory data:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Database connection closed');
    }
}

// Run the seed function
seedInventory();