const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// User Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password, // Password will be hashed by the User model pre-save hook
            role: req.body.role || 'Agent' // Allow role assignment, default to 'Agent'
        });

        await newUser.save();
        
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// User Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user by username with timeout handling and retries
        let user = null;
        let retries = 3;
        while (retries > 0) {
            try {
                user = await User.findOne({ username }).maxTimeMS(5000);
                break;
            } catch (error) {
                retries--;
                if (retries === 0) throw error;
                console.log(`Database query attempt failed. Retries left: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password using the method from User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create and assign a token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '24h' }
        );

        res.json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            res.status(503).json({ error: 'Database connection timeout. Please try again.' });
        } else if (error.name === 'MongooseError') {
            res.status(503).json({ error: 'Database error. Please try again.' });
        } else {
            res.status(500).json({ error: 'Error during login. Please try again.' });
        }
    }
});

module.exports = router;
