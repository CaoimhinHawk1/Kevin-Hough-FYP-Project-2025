// backend/src/routes/auth.routes.js
const express = require('express');
const firebaseAuthService = require('../services/firebase-auth.service');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await firebaseAuthService.loginWithEmail(email, password);

        // Set token in a cookie for added security
        res.cookie('access_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({
            message: 'Login successful',
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await firebaseAuthService.createUser(email, password, displayName || '');

        res.status(201).json({
            message: 'Registration successful',
            user
        });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error: error.message });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        await firebaseAuthService.resetPassword(email);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to send reset email', error: error.message });
    }
});

module.exports = router;