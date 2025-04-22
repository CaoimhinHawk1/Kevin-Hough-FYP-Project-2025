// backend/scripts/sync-firebase-users.js

/**
 * This script synchronizes Firebase users with the PostgreSQL database
 * Run it with: node scripts/sync-firebase-users.js
 */

require('dotenv').config();
const { admin } = require('../src/config/firebase');
const prisma = require('../src/services/prisma.service');

async function syncUsers() {
    console.log('Starting Firebase user sync process...');

    try {
        // Get all users from Firebase Auth
        console.log('Fetching users from Firebase Auth...');
        const listUsersResult = await admin.auth().listUsers();
        console.log(`Found ${listUsersResult.users.length} users in Firebase Auth`);

        let created = 0;
        let updated = 0;
        let errors = 0;

        // Process each Firebase user
        for (const firebaseUser of listUsersResult.users) {
            try {
                console.log(`Processing user ${firebaseUser.uid} (${firebaseUser.email})`);

                // Check if user exists in database
                const existingUser = await prisma.user.findUnique({
                    where: { id: firebaseUser.uid }
                });

                if (existingUser) {
                    // Update existing user
                    await prisma.user.update({
                        where: { id: firebaseUser.uid },
                        data: {
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            email: firebaseUser.email,
                            updatedAt: new Date()
                        }
                    });
                    console.log(`Updated existing user: ${firebaseUser.uid}`);
                    updated++;
                } else {
                    // Create new user
                    await prisma.user.create({
                        data: {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            email: firebaseUser.email,
                            role: 'USER',
                            isAdmin: false
                        }
                    });
                    console.log(`Created new user: ${firebaseUser.uid}`);
                    created++;
                }
            } catch (userError) {
                console.error(`Error processing user ${firebaseUser.uid}:`, userError);
                errors++;
            }
        }

        console.log('\nSync process completed:');
        console.log(`- Created: ${created} users`);
        console.log(`- Updated: ${updated} users`);
        console.log(`- Errors: ${errors} users`);

    } catch (error) {
        console.error('Error syncing users:', error);
    } finally {
        // Close the database connection
        await prisma.$disconnect();

        // Exit the process
        process.exit(0);
    }
}

// Run the sync process
syncUsers();