const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Assuming User model is defined in models/User.js
const router = express.Router();

// User Registration Endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body; // Added email to registration
    console.log('Registration attempt:', { username, email }); // Debugging log

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        console.log('User already exists:', username); // Debugging log
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default role as 'Agent'
    const newUser = new User({
        username,
        password: hashedPassword,
        email, // Use the email from the request body
        role: 'Agent' // Default role
    });

    try {
        await newUser.save();
        console.log('User registered successfully:', newUser); // Debugging log
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error); // Debugging log
        res.status(500).json({ message: 'Error registering user' });
    }
});

module.exports = router;
